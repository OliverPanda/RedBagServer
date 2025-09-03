const express = require('express');
const router = express.Router();
const tokenController = require('../controllers/tokenController');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const Joi = require('joi');

/**
 * @swagger
 * tags:
 *   name: Token管理
 *   description: Token刷新、验证等管理接口
 */

// 刷新token验证模式
const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': '刷新令牌不能为空'
  })
});

/**
 * @swagger
 * /api/token/refresh:
 *   post:
 *     summary: 刷新访问令牌
 *     description: 使用刷新令牌获取新的访问令牌
 *     tags: [Token管理]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: 刷新令牌
 *                 example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
 *     responses:
 *       200:
 *         description: 刷新成功
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
 *                         accessToken:
 *                           type: string
 *                           description: 新的访问令牌
 *                         refreshToken:
 *                           type: string
 *                           description: 新的刷新令牌
 *                         expiresIn:
 *                           type: string
 *                           description: 令牌过期时间
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 刷新令牌无效
 */
router.post('/refresh', validate(refreshTokenSchema), tokenController.refreshAccessToken);

/**
 * @swagger
 * /api/token/validate:
 *   get:
 *     summary: 验证令牌状态
 *     description: 验证当前访问令牌是否有效
 *     tags: [Token管理]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 令牌有效
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
 *                         valid:
 *                           type: boolean
 *                           description: 令牌是否有效
 *                         userId:
 *                           type: string
 *                           description: 用户ID
 *                         expiresAt:
 *                           type: string
 *                           format: date-time
 *                           description: 令牌过期时间
 *       401:
 *         description: 令牌无效
 */
router.get('/validate', authenticateToken, tokenController.validateToken);

module.exports = router;
