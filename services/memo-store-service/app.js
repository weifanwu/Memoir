var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var cors = require('cors');
var logger = require('morgan');
const client = require('./redis/redisClient');  // 引入上面初始化好的连接
const { initConsumer } = require('./kafkaConsumer');
const { initProducer, sendLog } = require('./kafkaProducer');
var indexRouter = require('./routes/index');

var app = express();

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:3000',  // Replace with your desired origin(s)
  methods: ['GET', 'POST', 'DELETE'],  // Specify allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'],  // Specify allowed headers
  credentials: true, // 允许跨域带 cookie
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
initProducer();
initConsumer().catch(console.error);

// Base64 URL-safe 解码函数
function base64UrlDecode(base64UrlString) {
  base64UrlString = base64UrlString
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  while (base64UrlString.length % 4) {
    base64UrlString += '=';
  }
  return Buffer.from(base64UrlString, 'base64').toString('utf8');
}

async function checkSession(req, res, next) {
  let sessionId = req.cookies['SESSION'];  // 从 Cookie 拿 SessionId
  if (!sessionId) {
    console.warn('Unauthorized access attempt: No session ID found');
    console.log('cookies:', req.cookies);
    return res.status(401).json({ message: 'Unauthorized: No session ID' });
  }

  try {
    // 解码 SESSION ID
    const decodedSessionId = base64UrlDecode(sessionId);

    const sessionKey = `spring:session:sessions:${decodedSessionId}`;
    const exists = await client.exists(sessionKey);
    if (!exists) {
      console.warn(`Unauthorized access attempt: Session ID ${decodedSessionId} not found`);
      return res.status(401).json({ message: 'Unauthorized: Session not found' });
    }

    // 获取 session 数据（可选）
    const data = await client.hGetAll(sessionKey);
    const username = data['sessionAttr:username'].trim();  // 假设 session 中存储了用户名

    req.username = username;  // 将用户名存储在请求对象中

    next();
  } catch (err) {
    console.error('Redis error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

app.use('/api', checkSession, indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// 错误处理器
app.use(function(err, req, res, next) {
  // 设置 locals，只在开发环境提供错误信息
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // 检查是否为 API 请求，返回 JSON 格式的错误
  if (req.accepts('json')) {
    return res.status(err.status || 500).json({
      message: err.message,
      error: req.app.get('env') === 'development' ? err : {}
    });
  }

  // 如果是 HTML 请求，返回简单的文本错误信息
  res.status(err.status || 500);
  res.send('Something went wrong!');  // 你可以自定义错误页面或返回文本
});


module.exports = app;

// const grpc = require('@grpc/grpc-js');
// const protoLoader = require('@grpc/proto-loader');

// const packageDef = protoLoader.loadSync(path.join(__dirname, 'proto', 'service.proto'));
// const grpcObject = grpc.loadPackageDefinition(packageDef);
// const diaryPackage = grpcObject.diary;

// function addDiary(call, callback) {
//     const { userId, content } = call.request;
//     console.log(`New diary for ${userId}: ${content}`);
//     callback(null, { status: 'Diary saved' });
// }

// const grpcServer = new grpc.Server();
// grpcServer.addService(diaryPackage.DiaryService.service, { AddDiary: addDiary });

// grpcServer.bindAsync('127.0.0.1:50052', grpc.ServerCredentials.createInsecure(), (err, port) => {
//     if (err) {
//         console.error('gRPC server bind error:', err);
//         return;
//     }
//     console.log('Diary gRPC server running on port', port);
// });
