const User = require('../models/User');
const { createResponse } = require('../middleware/validation');

// 获取用户信息
const getUserProfile = async (req, res) => {
  try {
    const user = req.user;
    
    // 隐藏敏感信息
    const userProfile = {
      id: user._id,
      phone: user.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'), // 手机号脱敏
      nickname: user.nickname,
      avatar: user.avatar,
      totalEarnings: user.totalEarnings,
      todayEarnings: user.todayEarnings,
      redPacketCount: user.redPacketCount,
      successRate: user.successRate,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt
    };

    return createResponse(res, 200, '获取用户信息成功', userProfile);
  } catch (error) {
    console.error('获取用户信息错误:', error);
    return createResponse(res, 500, '服务器内部错误', null, {
      field: 'server',
      message: '获取用户信息失败，请稍后重试'
    });
  }
};

// 更新用户信息
const updateUserProfile = async (req, res) => {
  try {
    const { nickname, avatar } = req.body;
    const user = req.user;

    // 更新允许的字段
    if (nickname !== undefined) {
      user.nickname = nickname;
    }
    if (avatar !== undefined) {
      user.avatar = avatar;
    }

    await user.save();

    return createResponse(res, 200, '更新用户信息成功', {
      id: user._id,
      phone: user.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
      nickname: user.nickname,
      avatar: user.avatar,
      totalEarnings: user.totalEarnings,
      todayEarnings: user.todayEarnings,
      redPacketCount: user.redPacketCount,
      successRate: user.successRate,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    console.error('更新用户信息错误:', error);
    return createResponse(res, 500, '服务器内部错误', null, {
      field: 'server',
      message: '更新用户信息失败，请稍后重试'
    });
  }
};

// 获取用户统计数据
const getUserStats = async (req, res) => {
  try {
    const user = req.user;
    
    const stats = {
      totalEarnings: user.totalEarnings,
      todayEarnings: user.todayEarnings,
      redPacketCount: user.redPacketCount,
      successRate: user.successRate,
      averageAmount: user.redPacketCount > 0 ? (user.totalEarnings / user.redPacketCount).toFixed(2) : 0,
      lastLoginAt: user.lastLoginAt,
      accountAge: Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)) // 账户年龄（天）
    };

    return createResponse(res, 200, '获取统计数据成功', stats);
  } catch (error) {
    console.error('获取用户统计数据错误:', error);
    return createResponse(res, 500, '服务器内部错误', null, {
      field: 'server',
      message: '获取统计数据失败，请稍后重试'
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserStats
};
