require('dotenv').config();
const express = require('express');
const router = express.Router();
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand, DeleteCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');

const ddbClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ca-central-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

const DIARY_TABLE = 'diary';

router.post('/uploadDiary', async (req, res) => {
  let { diaryid, username, content, date } = req.body;

  if (!diaryid) {
    return res.status(400).json({ message: 'content is required' });
  }
  if (!content) {
    return res.status(400).json({ message: 'content is required' });
  }
  if (!username) {
    return res.status(400).json({ message: 'userid (username) is required to associate diary' });
  }

  if (!date) {
    date = new Date().toISOString();
  }



  try {
    await ddbDocClient.send(new PutCommand({
      TableName: DIARY_TABLE,
      Item: {
        diaryid: diaryid, // 使用 UUID 生成唯一的 diaryid
        username,
        content,
        date
      }
    }));
    res.status(200).json({ message: 'Diary uploaded successfully', username });
  } catch (err) {
    console.error('DynamoDB put diary error:', err);
    // 返回 503，让前端知道失败
    res.status(503).json({ message: 'Failed to upload diary, save locally', error: err.message });
  }
});

// 获取所有日记（按用户，用 GSI 查询）
router.get('/getDiaries', async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ message: 'username is required' });
  }

  try {
    const result = await ddbDocClient.send(new QueryCommand({
      TableName: DIARY_TABLE,
      IndexName: 'username-index', // 使用 GSI
      KeyConditionExpression: "#u = :u",
      ExpressionAttributeNames: { "#u": "username" },
      ExpressionAttributeValues: { ":u": username },
    }));

    res.status(200).json({ diaries: result.Items || [] });
  } catch (err) {
    console.error('DynamoDB query error:', err);
    res.status(503).json({ message: 'Failed to fetch diaries', error: err.message });
  }
});

// 删除指定日记（通过 diaryid）
router.delete('/deleteDiary/:diaryid', async (req, res) => {
  const { diaryid } = req.params;

  if (!diaryid) {
    return res.status(400).json({ message: 'diaryid is required' });
  }

  try {
    await ddbDocClient.send(new DeleteCommand({
      TableName: DIARY_TABLE,
      Key: { diaryid },
    }));
    res.status(200).json({ message: 'Diary deleted successfully', diaryid });
  } catch (err) {
    console.error('DynamoDB delete error:', err);
    res.status(503).json({ message: 'Failed to delete diary', error: err.message });
  }
});

module.exports = router;