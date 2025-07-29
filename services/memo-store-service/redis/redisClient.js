const { createClient } = require('redis');
const client = createClient({
  url: 'redis://localhost:6379'  // 你的 Redis 地址
});

// 处理错误
client.on('error', (err) => console.error('Redis Client Error', err));

// 确保连接
(async () => {
  try {
    await client.connect();
    console.log('Connected to Redis');
  } catch (err) {
    console.error('Failed to connect to Redis:', err);
  }
})();

module.exports = client;  // 导出给其他文件复用