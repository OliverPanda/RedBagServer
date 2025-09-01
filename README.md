#  自动抢红包应用后端服务

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.16+-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5.0+-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> 基于 Express.js + MongoDB 的智能自动抢红包应用后端服务，提供完整的用户认证、红包监控、策略配置、数据分析等功能。

##  目录

- [项目介绍](#项目介绍)
- [功能特性](#功能特性)
- [技术架构](#技术架构)
- [快速开始](#快速开始)
- [API 文档](#api-文档)
- [项目结构](#项目结构)
- [开发指南](#开发指南)
- [部署说明](#部署说明)
- [贡献指南](#贡献指南)
- [许可证](#许可证)

##  项目介绍

自动抢红包应用后端服务是一个专为移动端应用提供后端支持的完整解决方案。系统支持微信、支付宝、钉钉、聚人等多个主流社交平台的红包监控和自动抢取功能，通过智能策略配置和实时数据分析，帮助用户提高抢红包的成功率和收益。

### 核心价值

-  **高性能**: 基于 Node.js 异步非阻塞架构，支持高并发请求
-  **安全可靠**: 集成 JWT 认证、数据验证、安全中间件等
-  **数据驱动**: 提供完整的用户行为分析和收益统计
-  **灵活配置**: 支持个性化策略设置和智能模式切换
-  **多平台**: 支持主流社交平台的红包监控

##  功能特性

###  用户认证系统
- 手机号验证码注册/登录
- 密码登录支持
- JWT Token 认证
- 用户信息管理

###  红包监控系统
- 多应用平台监听（微信、支付宝、钉钉、聚人）
- 实时红包检测
- 智能抢红包策略
- 监听状态管理

###  红包记录管理
- 抢红包历史记录
- 分页查询和筛选
- 数据统计和分析
- 记录详情查看

###  策略配置系统
- 个性化抢红包策略
- 金额范围设置
- 响应延迟配置
- 群聊优先级管理
- 预设策略模板

###  数据分析系统
- 收益趋势分析
- 成功率统计
- 数据概览展示
- 多格式数据导出

###  实时通信
- WebSocket 支持
- 实时状态推送
- 红包检测通知
- 抢红包结果反馈

##  技术架构

### 后端技术栈
- **运行环境**: Node.js 18+
- **Web 框架**: Express.js 4.16+
- **数据库**: MongoDB 5.0+ (Mongoose ODM)
- **缓存**: Redis 4.6+
- **认证**: JWT (jsonwebtoken)
- **数据验证**: Joi
- **密码加密**: bcryptjs
- **实时通信**: Socket.io
- **文件上传**: Multer
- **时间处理**: Moment.js

### 安全特性
- **安全中间件**: Helmet.js
- **CORS 配置**: 跨域资源共享
- **速率限制**: Express Rate Limit
- **数据验证**: 请求参数验证
- **SQL 注入防护**: Mongoose 内置防护

### 开发工具
- **热重载**: Nodemon
- **API 文档**: Swagger UI
- **环境配置**: dotenv
- **日志记录**: Morgan

##  快速开始

### 环境要求

- Node.js 18.0.0 或更高版本
- MongoDB 5.0 或更高版本
- Redis 4.6 或更高版本（可选）
- Windows/macOS/Linux 操作系统

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd RedBagServer
```

2. **安装依赖**
```bash
npm install
```

3. **环境配置**
```bash
# 复制环境配置文件
cp .env.example .env

# 编辑环境配置
# 配置数据库连接、JWT密钥等
```

4. **启动服务**
```bash
# 开发模式（支持热重载）
npm run dev

# 生产模式
npm start
```

5. **访问服务**
- API 服务: http://localhost:3000
- Swagger 文档: http://localhost:3000/api-docs
- 健康检查: http://localhost:3000/health

### 环境变量配置

```env
# 服务器配置
PORT=3000
NODE_ENV=development

# 数据库配置
MONGODB_URI=mongodb://localhost:27017/redbag
MONGODB_OPTIONS={}

# JWT 配置
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=7d

# Redis 配置（可选）
REDIS_URL=redis://localhost:6379

# 短信服务配置（可选）
SMS_API_KEY=your-sms-api-key
SMS_API_SECRET=your-sms-api-secret
```

##  API 文档

### 接口概览

系统提供 6 个主要功能模块，共计 25 个 API 接口：

| 模块 | 接口数量 | 基础路径 | 描述 |
|------|----------|----------|------|
|  用户认证 | 4 | `/api/auth` | 用户注册、登录、验证码等 |
|  用户管理 | 3 | `/api/user` | 用户信息管理、统计等 |
|  红包监控 | 6 | `/api/monitoring` | 应用监听状态、设置管理等 |
|  红包记录 | 4 | `/api/redpackets` | 红包记录查询、统计等 |
|  策略设置 | 4 | `/api/strategy` | 抢红包策略配置和管理 |
|  数据分析 | 4 | `/api/analytics` | 收益分析、趋势分析等 |

### 认证方式

所有需要认证的接口都使用 **Bearer Token** 认证方式：

```http
Authorization: Bearer <your_jwt_token>
```

### 响应格式

所有接口都使用统一的响应格式：

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {},
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 在线文档

- **Swagger UI**: http://localhost:3000/api-docs
- **健康检查**: http://localhost:3000/health
- **API 状态**: http://localhost:3000/health/api/html

##  项目结构

```
RedBagServer/
  src/                          # 源代码目录
     config/                   # 配置文件
       config.js                # 环境配置
       database.js              # 数据库连接
       swagger.js               # Swagger 配置
     controllers/              # 控制器层
       authController.js        # 认证控制器
       userController.js        # 用户控制器
       monitoringController.js  # 监控控制器
       redPacketController.js   # 红包记录控制器
       strategyController.js    # 策略控制器
       analyticsController.js   # 数据分析控制器
     models/                   # 数据模型
       User.js                  # 用户模型
       RedPacketRecord.js       # 红包记录模型
       MonitoringApp.js         # 监控应用模型
     routes/                   # 路由定义
       auth.js                  # 认证路由
       user.js                  # 用户路由
       monitoring.js            # 监控路由
       redpackets.js            # 红包记录路由
       strategy.js              # 策略路由
       analytics.js             # 数据分析路由
       health.js                # 健康检查路由
       test.js                  # 测试路由
     middleware/               # 中间件
       auth.js                  # 认证中间件
       validation.js            # 数据验证中间件
     utils/                    # 工具函数
        webSocketManager.js      # WebSocket 管理
  scripts/                      # 脚本文件
    generate-api-docs.js         # API 文档生成脚本
  bin/                          # 启动脚本
    www                          # 服务器启动文件
  public/                       # 静态资源
  routes/                       # 根路由
  app.js                        # 应用主文件
  package.json                  # 项目配置
  .env.example                  # 环境配置示例
  README.md                     # 项目说明文档
```

##  开发指南

### 开发模式

```bash
# 启动开发服务器（支持热重载）
npm run dev

# 生成 API 文档
npm run docs

# 查看 Swagger 文档地址
npm run docs:swagger
```

### 代码规范

- 使用 ES6+ 语法
- 遵循 RESTful API 设计规范
- 统一的错误处理和响应格式
- 完整的 JSDoc 注释
- 使用 Joi 进行数据验证

### 数据库设计

#### User 模型
- 基本信息：手机号、昵称、头像
- 收益统计：总收益、今日收益、红包数量、成功率
- 账户状态：活跃状态、最后登录时间

#### RedPacketRecord 模型
- 红包信息：金额、发送者、群聊、消息
- 抢取结果：状态、响应时间、排名
- 元数据：应用类型、时间戳等

#### MonitoringApp 模型
- 应用配置：监听状态、策略设置
- 统计信息：今日红包数、总收益
- 最后红包：最新红包详情

### 添加新接口

1. 在 `src/controllers/` 中添加控制器
2. 在 `src/routes/` 中定义路由
3. 添加 Swagger 注释
4. 在 `app.js` 中注册路由
5. 更新 API 文档

##  部署说明

### 生产环境部署

1. **环境准备**
```bash
# 设置生产环境
export NODE_ENV=production

# 安装生产依赖
npm ci --only=production
```

2. **进程管理**
```bash
# 使用 PM2 管理进程
npm install -g pm2
pm2 start ecosystem.config.js
```

3. **反向代理**
```nginx
# Nginx 配置示例
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Docker 部署

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# 构建镜像
docker build -t redbag-server .

# 运行容器
docker run -p 3000:3000 redbag-server
```

##  贡献指南

我们欢迎所有形式的贡献，包括但不限于：

-  Bug 报告
-  功能建议
-  文档改进
-  代码优化
-  测试用例

### 贡献流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 开发环境设置

```bash
# 克隆仓库
git clone https://github.com/your-username/RedBagServer.git

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 运行测试
npm test
```

##  许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

##  联系我们

- **项目主页**: [GitHub Repository](https://github.com/your-username/RedBagServer)
- **问题反馈**: [Issues](https://github.com/your-username/RedBagServer/issues)
- **功能建议**: [Discussions](https://github.com/your-username/RedBagServer/discussions)

##  致谢

感谢所有为这个项目做出贡献的开发者和用户！

---

** 如果这个项目对你有帮助，请给我们一个 Star！**
