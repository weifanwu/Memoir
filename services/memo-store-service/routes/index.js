require('dotenv').config();
const express = require('express');
const router = express.Router();
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand, DeleteCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { sendLog } = require('../kafkaProducer'); // 引入 Kafka 日志函数

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

  if (!diaryid || !content || !username) {
    return res.status(400).json({ message: 'diaryid, username and content are required' });
  }

  if (!date) date = new Date().toISOString();

  try {
    // 写入日记表
    await ddbDocClient.send(new PutCommand({
      TableName: DIARY_TABLE,
      Item: { diaryid, username, content, date }
    }));

    await sendLog({
      action: 'uploadDiary',
      diaryid,
      username,
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(200).json({ message: 'Diary uploaded successfully', username });
  } catch (err) {
    console.error('Error uploading diary:', err);
    res.status(503).json({ message: 'Failed to upload diary', error: err.message });
  }
});

router.get('/getDiaries', async (req, res) => {
  const { username } = req.query;
  if (!username) return res.status(400).json({ message: 'username is required' });

  try {
    const result = await ddbDocClient.send(new QueryCommand({
      TableName: DIARY_TABLE,
      IndexName: 'username-index',
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

router.delete('/deleteDiary/:diaryid', async (req, res) => {
  const { diaryid } = req.params;
  if (!diaryid) return res.status(400).json({ message: 'diaryid is required' });

  try {
    await ddbDocClient.send(new DeleteCommand({ TableName: DIARY_TABLE, Key: { diaryid } }));

    await sendLog({
      action: 'deleteDiary',
      diaryid,
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(200).json({ message: 'Diary deleted successfully', diaryid });
  } catch (err) {
    console.error('DynamoDB delete error:', err);
    res.status(503).json({ message: 'Failed to delete diary', error: err.message });
  }
});

module.exports = router;