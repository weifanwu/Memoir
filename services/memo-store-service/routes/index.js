var express = require('express');
var router = express.Router();
var db = require('../sqlite/db');  // Import the shared database connection
const multer = require('multer');
const storage = multer.memoryStorage(); // Store images in memory
const upload = multer({ storage });

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
    image_data BLOB,
    FOREIGN KEY(diary_id) REFERENCES diaries(id)
  );
`;

const getDiariesSQL = `
  SELECT diaries.id, diaries.content, diaries.created_at, diary_images.id AS image_id, diary_images.image_data
  FROM diaries
  LEFT JOIN diary_images ON diaries.id = diary_images.diary_id
`;

db.run(createDiariesTableSQL, function(err) {
  if (err) {
    console.error('Error creating diaries table:', err.message);
  } else {
    console.log('Diaries table is ready');
  }
});

db.run(createDiaryImagesTableSQL, function(err) {
  if (err) {
    console.error('Error creating diary_images table:', err.message);
  } else {
    console.log('Diary_images table is ready');
  }
});

router.get('/getDiaries', function (req, res, next) {
  db.all(getDiariesSQL, [], (err, rows) => {
    if (err) {
      console.error('Error fetching diaries and images:', err.message);
      return res.status(500).json({ error: 'Failed to fetch diaries and images' });
    }

    const diaries = {};

    rows.forEach((row) => {
      if (!diaries[row.id]) {
        diaries[row.id] = {
          id: row.id,
          content: row.content,
          created_at: row.created_at,
          images: []
        };
      }

      if (row.image_id && row.image_data) {
        // Convert Buffer (BLOB) to base64
        const base64Image = Buffer.from(row.image_data).toString('base64');

        diaries[row.id].images.push({
          id: row.image_id,
          base64: base64Image,
          mime: 'image/jpeg' // 你可以根据实际格式动态判断
        });
      }
    });

    const result = Object.values(diaries);
    res.json({ diaries: result });
  });
});

router.post('/addDiary', upload.array('images[]'), (req, res) => {
  const { content } = req.body;
  const images = req.files;

  if (!content) {
    res.status(400).json({ message: 'Content is required' });
  }

  const insertDiaryQuery = 'INSERT INTO diaries (content) VALUES (?)';

  db.run(insertDiaryQuery, [content], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err });
    }

    const diaryId = this.lastID;  // Get the inserted diary ID

    const insertImageQuery = 'INSERT INTO diary_images (diary_id, image_data) VALUES (?, ?)';

    images.forEach(image => {
      const imageBlob = image.buffer // Convert Base64 image data to binary
      db.run(insertImageQuery, [diaryId, imageBlob], function(err) {
        if (err) {
          return res.status(500).json({ message: 'Database error when inserting images', error: err });
        }
        console.log(`Diary saved with ID: ${this.lastID}`);
      });
    });
  });
  res.status(200).json({ message: 'Content is required' });
});


// POST delete a diary entry by id and its related images
router.post('/deleteDiary', function(req, res, next) {
  const { id } = req.body;

  // Validate input
  if (!id) {
    return res.status(400).json({ message: 'Diary ID is required' });
  }

  // Delete images associated with the diary entry
  const deleteImagesQuery = 'DELETE FROM diary_images WHERE diary_id = ?';
  db.run(deleteImagesQuery, [id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Error deleting images', error: err });
    }

    // Now delete the diary entry itself
    const deleteDiaryQuery = 'DELETE FROM diaries WHERE id = ?';
    db.run(deleteDiaryQuery, [id], function(err) {
      if (err) {
        return res.status(500).json({ message: 'Error deleting diary', error: err });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Diary entry not found' });
      }
      res.json({ message: 'Diary entry and associated images deleted', id });
    });
  });
});

module.exports = router;
