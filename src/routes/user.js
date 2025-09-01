const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const Joi = require('joi');

// 更新用户信息验证模式
const updateProfileSchema = Joi.object({
  nickname: Joi.string().max(50).optional().messages({
    'string.max': '昵称不能超过50个字符'
  }),
  avatar: Joi.string().uri().optional().messages({
    'string.uri': '头像URL格式不正确'
  })
});

// 获取用户信息
router.get('/profile', authenticateToken, userController.getUserProfile);

// 更新用户信息
router.put('/profile', authenticateToken, validate(updateProfileSchema), userController.updateUserProfile);

// 获取用户统计数据
router.get('/stats', authenticateToken, userController.getUserStats);

module.exports = router;
