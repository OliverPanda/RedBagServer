var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var helmet = require('helmet');
var rateLimit = require('express-rate-limit');

// 导入数据库连接
const { connectDB } = require('./src/config/database');

// 导入路由
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./src/routes/auth');
var userRouter = require('./src/routes/user');
var monitoringRouter = require('./src/routes/monitoring');
var redPacketsRouter = require('./src/routes/redpackets');
var strategyRouter = require('./src/routes/strategy');
var analyticsRouter = require('./src/routes/analytics');
var healthRouter = require('./src/routes/health');
var testRouter = require('./src/routes/test');

var app = express();

// 数据库连接将在 bin/www 中处理

// 安全中间件
app.use(helmet());

// CORS中间件
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// 限流中间件
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 15分钟内最多100个请求
  message: {
    code: 429,
    message: '请求过于频繁，请稍后再试',
    error: {
      field: 'rate_limit',
      message: '请求频率超出限制'
    }
  }
});
app.use('/api/', limiter);

// 日志中间件
app.use(logger('dev'));

// 解析中间件
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(cookieParser());

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 测试路由
app.use('/test', testRouter);

// 健康检查路由
app.use('/health', healthRouter);

// API路由
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/monitoring', monitoringRouter);
app.use('/api/redpackets', redPacketsRouter);
app.use('/api/strategy', strategyRouter);
app.use('/api/analytics', analyticsRouter);

// 原有路由
app.use('/users', usersRouter);
app.use('/', indexRouter);

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    code: 404,
    message: '接口不存在',
    error: {
      field: 'route',
      message: '请求的接口路径不存在'
    },
    timestamp: new Date().toISOString()
  });
});

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error('全局错误:', err);
  
  // 默认错误响应
  const statusCode = err.statusCode || 500;
  const message = err.message || '服务器内部错误';
  
  res.status(statusCode).json({
    code: statusCode,
    message,
    error: {
      field: 'server',
      message: '服务器发生未知错误'
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = app;
