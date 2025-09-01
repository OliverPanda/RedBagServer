# 🧧 自动抢红包应用后端服务

基于 Express.js + MongoDB 的智能自动抢红包应用后端服务，提供完整的用户认证、红包监控、策略设置等API接口。

## ✨ 主要功能

- 🔐 **用户认证系统** - 支持手机号验证码和密码登录
- 👁️ **红包监控** - 多应用群聊监控和自动监听
- 📝 **红包记录** - 完整的抢红包历史和统计数据
- 🎯 **策略设置** - 灵活的抢红包策略配置
- 🔔 **通知系统** - 实时消息推送和通知管理
- 📊 **数据分析** - 收益统计和趋势分析
- 🌐 **实时通信** - WebSocket实时数据推送

## 🚀 技术栈

- **后端框架**: Express.js 4.x
- **数据库**: MongoDB + Mongoose
- **缓存**: Redis
- **认证**: JWT (JSON Web Token)
- **验证**: Joi
- **安全**: Helmet, CORS, Rate Limiting
- **实时通信**: Socket.io
- **文件上传**: Multer

## 📋 系统要求

- Node.js >= 14.0.0
- MongoDB >= 4.0.0
- Redis >= 6.0.0 (可选)

## 🛠️ 安装和运行

### 1. 克隆项目
```bash
git clone <repository-url>
cd RedBagServer
```

### 2. 安装依赖
```bash
npm install
```

### 3. 环境配置
创建 `.env` 文件并配置以下环境变量：
```env
# 环境配置
NODE_ENV=development
PORT=3000

# 数据库配置
MONGODB_URI=mongodb://localhost:27017/redbag

# JWT配置
JWT_SECRET=your_super_secret_jwt_key_here

# Redis配置 (可选)
REDIS_URL=redis://localhost:6379
```

### 4. 启动服务
```bash
# 开发模式
npm run dev
# 生产模式
npm start
```

服务将在 http://localhost:3000 启动

## 📚 API接口文档

### 认证接口
- `POST /api/auth/send-code` - 发送验证码
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户退出

### 用户接口
- `GET /api/user/profile` - 获取用户信息
- `PUT /api/user/profile` - 更新用户信息
- `GET /api/user/stats` - 获取用户统计数据

### 红包监控接口
- `GET /api/monitoring/apps` - 获取应用监听状态
- `PUT /api/monitoring/apps/:appId/toggle` - 切换应用监听状态
- `PUT /api/monitoring/apps/:appId/settings` - 更新应用设置
- `POST /api/monitoring/start` - 开始监听
- `POST /api/monitoring/stop` - 停止监听
- `POST /api/monitoring/reset-today` - 重置今日统计

### 红包记录接口
- `GET /api/redpackets/records` - 获取抢红包记录
- `GET /api/redpackets/:recordId` - 获取红包详情
- `GET /api/redpackets/stats` - 获取统计数据
- `POST /api/redpackets/add` - 添加红包记录（模拟抢红包成功）

### 策略设置接口
- `GET /api/strategy/current` - 获取当前策略
- `PUT /api/strategy/update` - 更新策略
- `GET /api/strategy/presets` - 获取策略预设
- `POST /api/strategy/presets/:presetId/apply` - 应用策略预设

### 数据分析接口
- `GET /api/analytics/earnings` - 收益分析
- `GET /api/analytics/overview` - 数据概览
- `GET /api/analytics/trends` - 趋势分析
- `GET /api/analytics/export` - 数据导出

### WebSocket实时通信
- 连接地址: `ws://localhost:3000`
- 认证方式: 在连接时传递JWT令牌
- 支持事件:
  - `redpacket_detected` - 红包检测通知
  - `grab_result` - 抢红包结果
  - `status_update` - 状态更新
  - `system_notification` - 系统通知

## 🗄️ 数据模型

### User (用户)
- 基本信息：手机号、昵称、头像
- 收益统计：总收益、今日收益、红包数量、成功率
- 账户状态：活跃状态、最后登录时间

### RedPacketRecord (红包记录)
- 红包信息：金额、发送者、群聊、消息
- 抢取结果：状态、响应时间、排名
- 元数据：应用类型、时间戳等

### MonitoringApp (监听应用)
- 应用配置：监听状态、策略设置
- 统计信息：今日红包数、总收益
- 最后红包：最新红包详情

## 🔧 开发指南

### 项目结构
```
src/
├── config/          # 配置文件
├── controllers/     # 控制器
├── middleware/      # 中间件
├── models/          # 数据模型
├── routes/          # 路由定义
└── utils/           # 工具函数
```

### 添加新接口
1. 在 `src/controllers/` 创建控制器
2. 在 `src/routes/` 定义路由
3. 在 `app.js` 中注册路由
4. 添加相应的数据模型（如需要）

### 数据库操作
使用 Mongoose 进行数据库操作，所有模型都在 `src/models/` 目录下。

## 🧪 测试

### 测试验证码
开发环境下，验证码统一使用 `123456`

### API测试
可以使用 Postman 或其他API测试工具测试接口

## 📝 注意事项

1. **生产环境**：请修改默认的JWT密钥和数据库连接信息
2. **短信服务**：需要集成真实的短信服务提供商
3. **文件上传**：确保上传目录有正确的读写权限
4. **安全配置**：根据实际需求调整CORS和限流配置

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 📞 联系方式

如有问题，请通过以下方式联系：
- 提交 Issue
- 发送邮件至：[your-email@example.com]

---

**注意**: 本项目仅供学习和研究使用，请遵守相关法律法规和平台规则。
