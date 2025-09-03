# 后端配置指南与最佳实践

## 1. JWT Token 管理

### 配置说明
```javascript
// 环境变量配置
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=30m          // 访问token过期时间
JWT_REFRESH_EXPIRES_IN=7d   // 刷新token过期时间
```

### 最佳实践
- **访问Token**: 30分钟过期，用于API访问
- **刷新Token**: 7天过期，用于获取新的访问Token
- **自动刷新**: 通过中间件自动检测并刷新即将过期的Token
- **安全存储**: 刷新Token应存储在HttpOnly Cookie中

### 使用方式
```javascript
// 1. 登录/注册时返回双Token
{
  "token": "access_token_here",
  "refreshToken": "refresh_token_here",
  "expiresIn": "30m"
}

// 2. 自动刷新机制
// 中间件会在Token即将过期时自动刷新
// 响应头包含新Token: X-New-Token

// 3. 手动刷新
POST /api/token/refresh
{
  "refreshToken": "refresh_token_here"
}
```

## 2. 数据库配置

### MongoDB 配置
```javascript
// 环境变量
MONGODB_URI=mongodb://localhost:27017/redbag_dev
MONGODB_OPTIONS_USE_NEW_URL_PARSER=true
MONGODB_OPTIONS_USE_UNIFIED_TOPOLOGY=true

// 连接池配置
MONGODB_MAX_POOL_SIZE=10
MONGODB_MIN_POOL_SIZE=5
MONGODB_MAX_IDLE_TIME_MS=30000
```

### Redis 配置
```javascript
// 环境变量
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password
REDIS_DB=0

// 连接配置
REDIS_CONNECT_TIMEOUT=10000
REDIS_COMMAND_TIMEOUT=5000
REDIS_RETRY_DELAY_ON_FAILURE=100
```

## 3. 安全配置

### 限流配置
```javascript
// 全局限流
RATE_LIMIT_WINDOW_MS=900000    // 15分钟
RATE_LIMIT_MAX_REQUESTS=100    // 每个IP最多100个请求

// API特定限流
AUTH_RATE_LIMIT_WINDOW_MS=300000  // 5分钟
AUTH_RATE_LIMIT_MAX_REQUESTS=5    // 认证接口最多5次
```

### CORS 配置
```javascript
// 开发环境
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

// 生产环境
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
```

### 安全头配置
```javascript
// Helmet 安全头
HELMET_CONTENT_SECURITY_POLICY=true
HELMET_HSTS_MAX_AGE=31536000
HELMET_X_FRAME_OPTIONS=DENY
```

## 4. 日志配置

### 日志级别
```javascript
// 环境变量
LOG_LEVEL=info              // error, warn, info, debug
LOG_FILE_PATH=./logs        // 日志文件路径
LOG_MAX_SIZE=10m            // 单个日志文件最大大小
LOG_MAX_FILES=5             // 保留的日志文件数量
```

### 日志格式
```javascript
// 结构化日志
{
  "timestamp": "2025-01-01T00:00:00.000Z",
  "level": "info",
  "message": "User login successful",
  "userId": "user_id_here",
  "ip": "127.0.0.1",
  "userAgent": "Mozilla/5.0...",
  "requestId": "req_123456"
}
```

## 5. 监控配置

### 健康检查
```javascript
// 健康检查端点
HEALTH_CHECK_ENABLED=true
HEALTH_CHECK_PORT=3001
HEALTH_CHECK_PATH=/health

// 检查项目
HEALTH_CHECK_DB=true
HEALTH_CHECK_REDIS=true
HEALTH_CHECK_EXTERNAL_APIS=true
```

### 性能监控
```javascript
// 响应时间监控
PERFORMANCE_MONITORING=true
SLOW_QUERY_THRESHOLD=1000    // 慢查询阈值(ms)
REQUEST_TIMEOUT=30000        // 请求超时时间(ms)
```

## 6. 缓存配置

### Redis 缓存
```javascript
// 缓存配置
CACHE_TTL_DEFAULT=3600       // 默认缓存时间(秒)
CACHE_TTL_USER_SESSION=1800  // 用户会话缓存时间
CACHE_TTL_API_RESPONSE=300   // API响应缓存时间

// 缓存键前缀
CACHE_KEY_PREFIX=redbag:
CACHE_KEY_USER=user:
CACHE_KEY_SESSION=session:
```

## 7. 文件上传配置

### 文件存储
```javascript
// 上传配置
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760       // 10MB
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif
UPLOAD_TEMP_DIR=./temp

// 云存储配置
CLOUD_STORAGE_PROVIDER=aws_s3
AWS_S3_BUCKET=your-bucket
AWS_S3_REGION=us-east-1
```

## 8. 邮件服务配置

### SMTP 配置
```javascript
// 邮件服务
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

// 邮件模板
EMAIL_TEMPLATE_PATH=./templates/email
EMAIL_FROM_NAME=RedBag System
EMAIL_FROM_ADDRESS=noreply@redbag.com
```

## 9. 第三方服务配置

### 短信服务
```javascript
// 阿里云短信
SMS_PROVIDER=aliyun
SMS_ACCESS_KEY_ID=your_access_key
SMS_ACCESS_KEY_SECRET=your_secret
SMS_SIGN_NAME=your_sign_name
SMS_TEMPLATE_CODE=your_template_code

// 腾讯云短信
SMS_PROVIDER=tencent
SMS_SECRET_ID=your_secret_id
SMS_SECRET_KEY=your_secret_key
SMS_APP_ID=your_app_id
```

### 支付服务
```javascript
// 支付宝
ALIPAY_APP_ID=your_app_id
ALIPAY_PRIVATE_KEY=your_private_key
ALIPAY_PUBLIC_KEY=alipay_public_key
ALIPAY_GATEWAY=https://openapi.alipay.com/gateway.do

// 微信支付
WECHAT_PAY_APP_ID=your_app_id
WECHAT_PAY_MCH_ID=your_mch_id
WECHAT_PAY_API_KEY=your_api_key
```

## 10. 开发工具配置

### 调试配置
```javascript
// 调试模式
DEBUG=app:*
DEBUG_COLORS=true
DEBUG_DEPTH=2

// 开发工具
SWAGGER_ENABLED=true
SWAGGER_PATH=/api-docs
API_DOCS_ENABLED=true
```

### 测试配置
```javascript
// 测试环境
TEST_DB_NAME=redbag_test
TEST_TIMEOUT=30000
TEST_PARALLEL=true
TEST_COVERAGE_THRESHOLD=80
```

## 11. 部署配置

### 容器配置
```dockerfile
# Docker 环境变量
NODE_ENV=production
PORT=3000
WORKERS=4
CLUSTER_MODE=true
```

### 进程管理
```javascript
// PM2 配置
PM2_INSTANCES=4
PM2_EXEC_MODE=cluster
PM2_MAX_MEMORY_RESTART=1G
PM2_AUTORESTART=true
```

## 12. 安全最佳实践

### 密码安全
```javascript
// 密码策略
PASSWORD_MIN_LENGTH=8
PASSWORD_REQUIRE_UPPERCASE=true
PASSWORD_REQUIRE_LOWERCASE=true
PASSWORD_REQUIRE_NUMBERS=true
PASSWORD_REQUIRE_SYMBOLS=true
PASSWORD_HASH_ROUNDS=12
```

### 会话安全
```javascript
// 会话配置
SESSION_SECRET=your-session-secret
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_HTTP_ONLY=true
SESSION_COOKIE_SAME_SITE=strict
SESSION_MAX_AGE=1800000        // 30分钟
```

### API 安全
```javascript
// API 安全
API_VERSIONING=true
API_RATE_LIMITING=true
API_REQUEST_VALIDATION=true
API_RESPONSE_SANITIZATION=true
API_CORS_ENABLED=true
```

## 13. 性能优化配置

### 数据库优化
```javascript
// 连接池优化
DB_POOL_SIZE=10
DB_POOL_MIN=2
DB_POOL_MAX=20
DB_POOL_IDLE_TIMEOUT=30000

// 查询优化
DB_QUERY_TIMEOUT=30000
DB_INDEX_OPTIMIZATION=true
DB_QUERY_CACHING=true
```

### 内存优化
```javascript
// 内存管理
MEMORY_LIMIT=512m
GC_OPTIMIZATION=true
MEMORY_LEAK_DETECTION=true
HEAP_DUMP_ON_ERROR=true
```

## 14. 错误处理配置

### 错误监控
```javascript
// 错误追踪
ERROR_TRACKING_ENABLED=true
ERROR_REPORTING_URL=https://your-error-service.com
ERROR_SAMPLE_RATE=1.0
ERROR_CONTEXT_DEPTH=5
```

### 错误响应
```javascript
// 错误响应格式
ERROR_INCLUDE_STACK=false    // 生产环境不包含堆栈
ERROR_INCLUDE_REQUEST_ID=true
ERROR_LOG_LEVEL=error
ERROR_NOTIFICATION_ENABLED=true
```

## 15. 配置管理最佳实践

### 环境隔离
- 开发环境：宽松配置，详细日志
- 测试环境：接近生产，完整功能
- 生产环境：严格配置，最小权限

### 配置验证
```javascript
// 启动时验证配置
const requiredConfigs = [
  'JWT_SECRET',
  'MONGODB_URI',
  'REDIS_URL'
];

requiredConfigs.forEach(config => {
  if (!process.env[config]) {
    throw new Error(`Missing required config: ${config}`);
  }
});
```

### 配置热重载
```javascript
// 支持配置热重载（非敏感配置）
const configWatcher = require('chokidar');
configWatcher.watch('./config').on('change', () => {
  console.log('Config changed, reloading...');
  // 重新加载配置
});
```

这个配置指南涵盖了后端开发中的主要配置项和最佳实践，可以根据项目需求进行调整和扩展。
