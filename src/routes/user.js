const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const Joi = require('joi');

/**
 * @swagger
 * tags:
 *   name: 用户管理
 *   description: 用户信息管理、统计等接口
 */

// 更新用户信息验证模式
const updateProfileSchema = Joi.object({
  nickname: Joi.string().max(50).optional().messages({
    'string.max': '昵称不能超过50个字符'
  }),
  avatar: Joi.string().uri().optional().messages({
    'string.uri': '头像URL格式不正确'
  })
});

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: 获取用户信息
 *     description: 获取当前登录用户的详细信息
 *     tags: [用户管理]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
// 获取用户信息
router.get('/profile', authenticateToken, userController.getUserProfile);

/**
 * @swagger
 * /api/user/profile:
 *   put:
 *     summary: 更新用户信息
 *     description: 更新当前登录用户的昵称和头像
 *     tags: [用户管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nickname:
 *                 type: string
 *                 maxLength: 50
 *                 description: 用户昵称
 *                 example: '新昵称'
 *               avatar:
 *                 type: string
 *                 format: uri
 *                 description: 头像URL
 *                 example: 'https://example.com/avatar.jpg'
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
// 更新用户信息
router.put('/profile', authenticateToken, validate(updateProfileSchema), userController.updateUserProfile);

/**
 * @swagger
 * /api/user/stats:
 *   get:
 *     summary: 获取用户统计数据
 *     description: 获取当前登录用户的统计数据，包括收益、红包数量、成功率等
 *     tags: [用户管理]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         totalEarnings:
 *                           type: number
 *                           description: 总收益
 *                           example: 100.50
 *                         todayEarnings:
 *                           type: number
 *                           description: 今日收益
 *                           example: 25.80
 *                         redPacketCount:
 *                           type: integer
 *                           description: 红包数量
 *                           example: 50
 *                         successRate:
 *                           type: number
 *                           description: 成功率
 *                           example: 85.5
 *                         averageAmount:
 *                           type: number
 *                           description: 平均金额
 *                           example: 2.01
 *                         lastLoginAt:
 *                           type: string
 *                           format: date-time
 *                           description: 最后登录时间
 *                         accountAge:
 *                           type: integer
 *                           description: 账户年龄（天）
 *                           example: 30
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
// 获取用户统计数据
router.get('/stats', authenticateToken, userController.getUserStats);

module.exports = router;
