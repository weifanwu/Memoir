require('dotenv').config();
const express = require('express');
const router = express.Router();
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');
const path = require('path');
const db = require('../sqlite/db');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 初始化 S3
const s3 = new S3Client({
  region: process.env.AWS_REGION || 'ca-central-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});
const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'memoir-diary-pics';

// 创建表
const createDiariesTableSQL = `
  CREATE TABLE IF NOT EXISTS diaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;
const createDiaryImagesTableSQL = `
  CREATE TABLE IF NOT EXISTS diary_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    diary_id INTEGER,
    image_data TEXT,  -- 改为 TEXT 存 S3 key
    FOREIGN KEY(diary_id) REFERENCES diaries(id)
  );
`;
db.run(createDiariesTableSQL);
db.run(createDiaryImagesTableSQL);

// 获取日记
const getDiariesSQL = `
  SELECT diaries.id, diaries.content, diaries.created_at, diary_images.id AS image_id, diary_images.image_data
  FROM diaries
  LEFT JOIN diary_images ON diaries.id = diary_images.diary_id
`;

router.get('/getDiaries', function (req, res) {
  db.all(getDiariesSQL, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch diaries and images' });

    const diaries = {};

    rows.forEach(row => {
      if (!diaries[row.id]) {
        diaries[row.id] = {
          id: row.id,
          content: row.content,
          created_at: row.created_at,
          images: []
        };
      }

      if (row.image_id && row.image_data) {
        const imageUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${row.image_data}`;
        diaries[row.id].images.push({
          id: row.image_id,
          url: imageUrl
        });
      }
    });

    res.json({ diaries: Object.values(diaries) });
  });
});

// 上传日记 + 图片
router.post('/addDiary', upload.array('images[]'), async (req, res) => {
  const { content } = req.body;
  const images = req.files;

  if (!content) return res.status(400).json({ message: 'Content is required' });

  db.run('INSERT INTO diaries (content) VALUES (?)', [content], async function(err) {
    if (err) return res.status(500).json({ message: 'Database error', error: err });

    const diaryId = this.lastID;

    for (const image of images) {
      const ext = path.extname(image.originalname) || '.jpg';
      const key = `diary-images/${diaryId}/${crypto.randomUUID()}${ext}`;

      try {
        const command = new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
          Body: image.buffer,
          ContentType: image.mimetype
        });
        await s3.send(command);

        db.run('INSERT INTO diary_images (diary_id, image_data) VALUES (?, ?)', [diaryId, key]);
      } catch (err) {
        console.error('S3 upload failed:', err);
        return res.status(500).json({ message: 'Upload to S3 failed', error: err });
      }
    }

    res.status(200).json({ message: 'Diary saved', diaryId });
  });
});

// 删除日记
router.post('/deleteDiary', function(req, res) {
  const { id } = req.body;
  if (!id) return res.status(400).json({ message: 'Diary ID is required' });

  db.all('SELECT image_data FROM diary_images WHERE diary_id = ?', [id], async (err, rows) => {
    if (err) return res.status(500).json({ message: 'Fetch failed before deletion', error: err });

    // 删除 S3 上的对象
    for (const row of rows) {
      const key = row.image_data;
      try {
        await s3.send(new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key
        }));
      } catch (err) {
        console.warn(`Failed to delete ${key} from S3`, err);
      }
    }

    db.run('DELETE FROM diary_images WHERE diary_id = ?', [id], err => {
      if (err) return res.status(500).json({ message: 'Error deleting images', error: err });

      db.run('DELETE FROM diaries WHERE id = ?', [id], function(err) {
        if (err) return res.status(500).json({ message: 'Error deleting diary', error: err });
        if (this.changes === 0) return res.status(404).json({ message: 'Diary not found' });

        res.json({ message: 'Diary and images deleted', id });
      });
    });
  });
});

module.exports = router;