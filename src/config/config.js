require('dotenv').config();

module.exports = {
  // 环境配置
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,

  // 数据库配置
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/redbag',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },

  // Redis配置
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD || '',
  },

  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || 7200,
  },

  // 短信服务配置
  sms: {
    apiKey: process.env.SMS_API_KEY || 'your_sms_api_key',
    apiSecret: process.env.SMS_API_SECRET || 'your_sms_api_secret',
  },

  // 推送通知配置
  push: {
    key: process.env.PUSH_NOTIFICATION_KEY || 'your_push_key',
  },

  // 文件上传配置
  upload: {
    path: process.env.UPLOAD_PATH || './uploads',
    maxSize: process.env.MAX_FILE_SIZE || 5242880,
  },

  // 限流配置
  rateLimit: {
    windowMs: process.env.RATE_LIMIT_WINDOW_MS || 900000,
    max: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
  },

  // 应用配置
  apps: {
    wechat: { name: '微信', icon: '💬' },
    alipay: { name: '支付宝', icon: '💰' },
    dingtalk: { name: '钉钉', icon: '📱' },
    juren: { name: '聚人', icon: '👥' },
  }
};
