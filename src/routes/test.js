const express = require('express');
const router = express.Router();

// 测试路由
router.get('/', (req, res) => {
  res.json({
    message: '测试路由工作正常',
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  });
});

// 测试子路由
router.get('/sub', (req, res) => {
  res.json({
    message: '测试子路由工作正常',
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  });
});

module.exports = router;
