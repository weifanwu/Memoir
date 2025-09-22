const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'diary-api-producer',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});

const producer = kafka.producer();

async function initProducer() {
  try {
    await producer.connect();
    console.log('Kafka producer connected');
  } catch (err) {
    console.error('Producer init error:', err);
  }
}

/**
 * 发送日志消息到 Kafka
 * @param {Object} log - 日志对象
 */
async function sendLog(log) {
  try {
    await producer.send({
      topic: 'diary-logs',
      messages: [{ value: JSON.stringify(log) }],
    });
  } catch (err) {
    console.error('Failed to send log to Kafka:', err);
  }
}

module.exports = { initProducer, sendLog };
