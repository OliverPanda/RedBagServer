const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');

// JWT认证中间件
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        code: 401,
        message: '访问令牌缺失',
        error: {
          field: 'authorization',
          message: '请在请求头中提供有效的访问令牌'
        }
      });
    }

    // 验证JWT令牌
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // 查找用户
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({
        code: 401,
        message: '用户不存在',
        error: {
          field: 'token',
          message: '访问令牌无效或已过期'
        }
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        code: 403,
        message: '账户已被禁用',
        error: {
          field: 'account',
          message: '您的账户已被禁用，请联系管理员'
        }
      });
    }

    // 将用户信息添加到请求对象
    req.user = user;
    next();
  } catch (error) {
    // 处理所有JWT相关错误
    if (error.name === 'JsonWebTokenError' || 
        error.name === 'NotBeforeError' || 
        error.name === 'TokenExpiredError' ||
        error.message?.includes('jwt') ||
        error.message?.includes('token')) {
      return res.status(401).json({
        code: 401,
        message: '访问令牌无效',
        error: {
          field: 'token',
          message: '访问令牌格式错误或已损坏'
        }
      });
    }

    console.error('认证中间件错误:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      error: {
        field: 'server',
        message: '认证过程中发生未知错误'
      }
    });
  }
};

// 可选认证中间件（不强制要求登录）
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await User.findById(decoded.userId).select('-password');
      if (user && user.isActive) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    // 忽略认证错误，继续执行
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuth
};
