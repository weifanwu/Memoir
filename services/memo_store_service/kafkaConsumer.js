require('dotenv').config();
const { Kafka } = require('kafkajs');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const LOG_TABLE = 'DiaryLogs';

// 初始化 DynamoDB 客户端
const ddbClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ca-central-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

// 初始化 Kafka Consumer
const kafka = new Kafka({
  clientId: 'diary-api-consumer',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'diary-log-group' });

async function initConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'diary-logs', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const log = JSON.parse(message.value.toString());

      const params = {
        TableName: LOG_TABLE,
        Item: {
          id: `${log.username || 'unknown'}-${Date.now()}`,
          ...log,
        },
      };

      try {
        await ddbDocClient.send(new PutCommand(params));
        console.log('Log written to DynamoDB:', params.Item);
      } catch (err) {
        console.error('Failed to write log to DynamoDB:', err);
      }
    },
  });

  console.log('Kafka consumer initialized');
}

module.exports = { initConsumer };
