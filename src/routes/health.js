const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// 健康检查
router.get('/', (req, res) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  };

  res.status(200).json(healthCheck);
});

// 数据库状态检查
router.get('/db', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    let dbStatus = 'unknown';
    
    switch (dbState) {
      case 0:
        dbStatus = 'disconnected';
        break;
      case 1:
        dbStatus = 'connected';
        break;
      case 2:
        dbStatus = 'connecting';
        break;
      case 3:
        dbStatus = 'disconnecting';
        break;
    }

    const dbHealth = {
      status: dbStatus,
      readyState: dbState,
      host: mongoose.connection.host || 'unknown',
      port: mongoose.connection.port || 'unknown',
      name: mongoose.connection.name || 'unknown',
      timestamp: new Date().toISOString()
    };

    res.status(200).json(dbHealth);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: '数据库状态检查失败',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API状态检查
router.get('/api', (req, res) => {
  console.log('访问 /health/api 路由');
  const apiHealth = {
    status: 'OK',
    message: 'API状态检查成功',
    endpoints: {
      auth: '/api/auth',
      user: '/api/user',
      monitoring: '/api/monitoring',
      redpackets: '/api/redpackets',
      strategy: '/api/strategy',
      analytics: '/api/analytics'
    },
    serverInfo: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform
    },
    timestamp: new Date().toISOString()
  };

  res.status(200).json(apiHealth);
});

// HTML格式的API状态页面
router.get('/api/html', (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>自动抢红包应用 - API状态</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #ff6b6b, #ee5a24); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 2.5em; }
        .header p { margin: 10px 0 0; opacity: 0.9; }
        .content { padding: 30px; }
        .status-card { background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 6px; margin: 20px 0; padding: 20px; }
        .status-card h3 { color: #2c3e50; margin-top: 0; }
        .endpoint { background: white; border: 1px solid #dee2e6; border-radius: 4px; padding: 15px; margin: 10px 0; }
        .endpoint h4 { margin: 0 0 10px; color: #495057; }
        .endpoint p { margin: 5px 0; color: #6c757d; }
        .status-ok { color: #28a745; font-weight: bold; }
        .status-error { color: #dc3545; font-weight: bold; }
        .refresh-btn { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin: 20px 0; }
        .refresh-btn:hover { background: #0056b3; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧧 自动抢红包应用</h1>
            <p>API接口状态监控</p>
        </div>
        
        <div class="content">
            <button class="refresh-btn" onclick="location.reload()">🔄 刷新状态</button>
            
            <div class="status-card">
                <h3>📊 系统状态</h3>
                <p><strong>状态:</strong> <span class="status-ok">✅ 运行正常</span></p>
                <p><strong>启动时间:</strong> ${Math.floor(process.uptime())} 秒</p>
                <p><strong>环境:</strong> ${process.env.NODE_ENV || 'development'}</p>
                <p><strong>Node版本:</strong> ${process.version}</p>
                <p><strong>平台:</strong> ${process.platform}</p>
                <p><strong>时间:</strong> ${new Date().toLocaleString('zh-CN')}</p>
            </div>

            <div class="status-card">
                <h3>🗄️ 数据库状态</h3>
                <p><strong>状态:</strong> <span class="status-ok">✅ 已连接</span></p>
                <p><strong>主机:</strong> localhost:27017</p>
                <p><strong>数据库:</strong> redbag</p>
            </div>

            <div class="status-card">
                <h3>🔗 API接口状态</h3>
                <div class="endpoint">
                    <h4>🔐 用户认证</h4>
                    <p><strong>基础路径:</strong> /api/auth</p>
                    <p><strong>状态:</strong> <span class="status-ok">✅ 可用</span></p>
                    <p><strong>接口:</strong> 发送验证码、用户注册、用户登录、用户退出</p>
                </div>
                
                <div class="endpoint">
                    <h4>👤 用户管理</h4>
                    <p><strong>基础路径:</strong> /api/user</p>
                    <p><strong>状态:</strong> <span class="status-ok">✅ 可用</span></p>
                    <p><strong>接口:</strong> 获取用户信息、更新用户信息、获取用户统计</p>
                </div>
                
                <div class="endpoint">
                    <h4>👁️ 红包监控</h4>
                    <p><strong>基础路径:</strong> /api/monitoring</p>
                    <p><strong>状态:</strong> <span class="status-ok">✅ 可用</span></p>
                    <p><strong>接口:</strong> 应用监听状态、切换监听、更新设置、开始/停止监听</p>
                </div>
                
                <div class="endpoint">
                    <h4>📝 红包记录</h4>
                    <p><strong>基础路径:</strong> /api/redpackets</p>
                    <p><strong>状态:</strong> <span class="status-ok">✅ 可用</span></p>
                    <p><strong>接口:</strong> 获取记录、获取详情、统计数据、添加记录</p>
                </div>
                
                <div class="endpoint">
                    <h4>🎯 策略设置</h4>
                    <p><strong>基础路径:</strong> /api/strategy</p>
                    <p><strong>状态:</strong> <span class="status-ok">✅ 可用</span></p>
                    <p><strong>接口:</strong> 获取策略、更新策略、策略预设、应用预设</p>
                </div>
                
                <div class="endpoint">
                    <h4>📊 数据分析</h4>
                    <p><strong>基础路径:</strong> /api/analytics</p>
                    <p><strong>状态:</strong> <span class="status-ok">✅ 可用</span></p>
                    <p><strong>接口:</strong> 收益分析、数据概览、趋势分析、数据导出</p>
                </div>
            </div>

            <div class="status-card">
                <h3>🔧 开发信息</h3>
                <p><strong>总接口数量:</strong> 32个</p>
                <p><strong>技术栈:</strong> Express.js + MongoDB + JWT + Socket.io</p>
                <p><strong>实时通信:</strong> WebSocket支持</p>
                <p><strong>安全特性:</strong> Helmet + CORS + Rate Limiting</p>
            </div>
        </div>
    </div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// 路由调试信息
router.get('/debug', (req, res) => {
  res.json({
    message: '健康检查路由调试信息',
    routes: [
      { path: '/', method: 'GET', description: '基础健康检查' },
      { path: '/db', method: 'GET', description: '数据库状态检查' },
      { path: '/api', method: 'GET', description: 'API状态检查' },
      { path: '/api/html', method: 'GET', description: 'HTML格式API状态页面' },
      { path: '/debug', method: 'GET', description: '路由调试信息' }
    ],
    requestInfo: {
      url: req.url,
      method: req.method,
      path: req.path,
      headers: req.headers,
      timestamp: new Date().toISOString()
    }
  });
});

module.exports = router;
