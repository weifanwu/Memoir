var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var cors = require('cors');
var logger = require('morgan');

var indexRouter = require('./routes/index');

var app = express();

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:3000',  // Replace with your desired origin(s)
  methods: ['GET', 'POST'],  // Specify allowed methods
  allowedHeaders: ['Content-Type', 'Authorization']  // Specify allowed headers
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', indexRouter);

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
