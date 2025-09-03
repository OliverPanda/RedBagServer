// 根据 NODE_ENV 加载相应的环境配置文件
const path = require('path');
const dotenv = require('dotenv');

// 获取环境类型
const env = process.env.NODE_ENV || 'development';

// 环境配置文件映射
const envFiles = {
  development: 'env.development',
  test: 'env.test',
  production: 'env.production'
};

// 加载环境配置文件
const envFile = envFiles[env];
if (envFile) {
  const envFilePath = path.resolve(__dirname, '../../', envFile);
  const result = dotenv.config({ path: envFilePath });
  
  if (result.error) {
    console.warn(`⚠️  环境配置文件加载失败: ${result.error.message}`);
    console.warn(`💡 请确保 ${envFile} 文件存在`);
  } else {
    console.log(`✅ 已加载 ${env} 环境配置: ${envFilePath}`);
  }
} else {
  console.warn(`⚠️  未知的环境类型: ${env}，使用默认配置`);
}

// 如果存在 .env 文件，也加载它（优先级更高）
dotenv.config();

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
    expiresIn: process.env.JWT_EXPIRES_IN || '30m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
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
