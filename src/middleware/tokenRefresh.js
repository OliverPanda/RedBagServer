const jwt = require('jsonwebtoken');
const config = require('../config/config');

/**
 * 自动Token刷新中间件
 * 检查token是否即将过期，如果是则自动刷新并返回新token
 * 这个中间件应该在认证中间件之后使用
 */
const autoTokenRefresh = (req, res, next) => {
  try {
    // 只有在有用户信息的情况下才进行token刷新检查
    if (!req.user || !req.user._id) {
      return next();
    }

    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    
    // 解码token但不验证过期时间
    const decoded = jwt.decode(token);
    
    if (!decoded || !decoded.exp) {
      return next();
    }

    // 计算token剩余时间（秒）
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = decoded.exp - now;
    
    // 如果token在5分钟内过期，则刷新token
    const refreshThreshold = 5 * 60; // 5分钟
    
    if (timeLeft < refreshThreshold && timeLeft > 0) {
      // 生成新的token
      const newToken = jwt.sign(
        { userId: req.user._id },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );
      
      // 将新token添加到响应头
      res.set('X-New-Token', newToken);
      res.set('X-Token-Refreshed', 'true');
      res.set('X-Token-Expires-In', timeLeft.toString());
    }
    
    next();
  } catch (error) {
    // 如果刷新失败，继续执行，不影响正常流程
    console.warn('Token refresh failed:', error.message);
    next();
  }
};

/**
 * 生成访问token
 */
const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

/**
 * 生成刷新token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    config.jwt.secret,
    { expiresIn: config.jwt.refreshExpiresIn || '7d' }
  );
};

/**
 * 验证刷新token
 */
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    return decoded;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

/**
 * 检查token是否即将过期
 */
const isTokenExpiringSoon = (token, thresholdMinutes = 5) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return false;
    }
    
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = decoded.exp - now;
    const threshold = thresholdMinutes * 60;
    
    return timeLeft < threshold && timeLeft > 0;
  } catch (error) {
    return false;
  }
};

module.exports = {
  autoTokenRefresh,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  isTokenExpiringSoon
};
