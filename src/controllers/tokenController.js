const User = require('../models/User');
const { createResponse } = require('../middleware/validation');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../middleware/tokenRefresh');

/**
 * 刷新访问令牌
 */
const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return createResponse(res, 400, '刷新令牌不能为空', null, {
        field: 'refreshToken',
        message: '请提供刷新令牌'
      });
    }

    // 验证刷新token
    const decoded = verifyRefreshToken(token);
    
    // 检查用户是否存在
    const user = await User.findById(decoded.userId);
    if (!user) {
      return createResponse(res, 401, '用户不存在', null, {
        field: 'refreshToken',
        message: '刷新令牌无效'
      });
    }

    // 生成新的访问token和刷新token
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    return createResponse(res, 200, '令牌刷新成功', {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '30m'
    });

  } catch (error) {
    console.error('刷新令牌错误:', error);
    return createResponse(res, 401, '刷新令牌无效', null, {
      field: 'refreshToken',
      message: '刷新令牌已过期或无效'
    });
  }
};

/**
 * 验证token状态
 */
const validateToken = async (req, res) => {
  try {
    // 如果到达这里，说明token是有效的（通过了认证中间件）
    const user = req.user;
    
    return createResponse(res, 200, '令牌有效', {
      valid: true,
      userId: user._id,
      expiresAt: new Date(user.exp * 1000).toISOString()
    });
  } catch (error) {
    console.error('验证令牌错误:', error);
    return createResponse(res, 500, '服务器内部错误', null, {
      field: 'server',
      message: '验证令牌失败'
    });
  }
};

module.exports = {
  refreshAccessToken,
  validateToken
};
