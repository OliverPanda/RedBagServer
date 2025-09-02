# 环境配置设置指南

本文档介绍如何设置和管理红包服务器的不同环境配置。

## 📁 配置文件结构

```
RedBagServer/
├── env.example          # 环境变量示例文件
├── env.development     # 开发环境配置
├── env.test           # 测试环境配置
├── env.production     # 生产环境配置
├── scripts/
│   ├── setup-env.js   # 环境配置管理脚本
│   └── load-env.js    # 环境配置加载器
└── .gitignore         # Git忽略文件（包含.env）
```

## 🚀 快速开始

### 1. 自动创建所有环境配置

```bash
npm run env:setup:all
```

这将自动创建所有三个环境的配置文件。

### 2. 交互式创建特定环境配置

```bash
npm run env:setup
```

按照提示选择环境并自定义配置。

### 3. 查看当前环境配置

```bash
npm run env:load
```

## 🔧 环境配置说明

### 开发环境 (Development)

- **用途**: 本地开发和调试
- **端口**: 3000
- **数据库**: 本地 MongoDB (redbag_dev)
- **日志级别**: debug
- **特性**: 启用 Swagger、调试模式、热重载

### 测试环境 (Test)

- **用途**: 自动化测试
- **端口**: 3001
- **数据库**: 内存数据库 (mongodb-memory-server)
- **日志级别**: warn
- **特性**: 禁用 Swagger、调试模式

### 生产环境 (Production)

- **用途**: 生产部署
- **端口**: 3000
- **数据库**: 生产 MongoDB 集群
- **日志级别**: info
- **特性**: 禁用 Swagger、调试模式，启用安全特性

## 📝 配置变量说明

### 基础配置

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `NODE_ENV` | 运行环境 | development/test/production |
| `PORT` | 服务器端口 | 3000 |

### 数据库配置

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `MONGODB_URI` | MongoDB 连接字符串 | mongodb://localhost:27017/redbag |
| `REDIS_URL` | Redis 连接字符串 | redis://localhost:6379 |

### 安全配置

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `JWT_SECRET` | JWT 签名密钥 | your_secret_key_here |
| `SESSION_SECRET` | 会话密钥 | your_session_secret |

### 服务配置

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `SMS_API_KEY` | 短信服务 API 密钥 | your_sms_api_key |
| `PUSH_NOTIFICATION_KEY` | 推送通知密钥 | your_push_key |

## 🛠️ 手动配置步骤

### 1. 复制示例文件

```bash
cp env.example .env.local
```

### 2. 修改配置

编辑 `.env.local` 文件，根据实际环境修改配置值。

### 3. 启动服务

```bash
# 开发环境
npm run dev

# 测试环境
npm run start:test

# 生产环境
npm run start:prod
```

## 🔒 安全注意事项

### 生产环境

1. **修改所有默认密钥**
   - JWT_SECRET
   - SESSION_SECRET
   - 数据库密码

2. **限制访问**
   - 配置防火墙
   - 使用 HTTPS
   - 限制 CORS 域名

3. **监控和日志**
   - 启用错误监控
   - 配置日志轮转
   - 设置告警

### 开发环境

1. **使用本地服务**
   - 本地 MongoDB
   - 本地 Redis

2. **禁用生产特性**
   - 不启用 HTTPS 重定向
   - 放宽限流设置

## 📋 常用命令

```bash
# 环境配置管理
npm run env:setup          # 交互式配置
npm run env:setup:all      # 创建所有配置
npm run env:load           # 加载配置

# 启动服务
npm run dev                # 开发模式
npm run start:test         # 测试环境
npm run start:prod         # 生产环境

# 运行测试
npm test                   # 运行所有测试
npm run test:watch         # 监听模式
npm run test:coverage      # 生成覆盖率报告
```

## 🐛 故障排除

### 常见问题

1. **配置文件不存在**
   ```bash
   npm run env:setup:all
   ```

2. **环境变量未加载**
   - 检查文件名是否正确
   - 确认 NODE_ENV 设置
   - 运行 `npm run env:load` 验证

3. **数据库连接失败**
   - 检查 MongoDB 服务状态
   - 验证连接字符串
   - 确认网络连接

4. **权限问题**
   - 检查文件权限
   - 确认目录存在
   - 验证用户权限

### 调试技巧

1. **查看环境变量**
   ```bash
   npm run env:load
   ```

2. **检查配置文件**
   ```bash
   cat env.development
   ```

3. **验证配置加载**
   ```bash
   NODE_ENV=development node -e "console.log(process.env.NODE_ENV)"
   ```

## 📚 相关文档

- [Express.js 环境配置](https://expressjs.com/en/advanced/best-practices-production.html)
- [Node.js 环境变量](https://nodejs.org/docs/latest/api/process.html#processenv)
- [MongoDB 连接字符串](https://docs.mongodb.com/manual/reference/connection-string/)
- [Redis 配置](https://redis.io/topics/config)

## 🤝 贡献

如果你发现配置问题或有改进建议，请：

1. 创建 Issue 描述问题
2. 提交 Pull Request 修复问题
3. 更新相关文档

---

**注意**: 生产环境部署前，请务必：
- 修改所有默认密钥
- 配置正确的数据库连接
- 设置适当的安全策略
- 测试所有功能正常
