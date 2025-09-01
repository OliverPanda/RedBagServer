const express = require('express');
const router = express.Router();
const redPacketController = require('../controllers/redPacketController');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const Joi = require('joi');

/**
 * @swagger
 * tags:
 *   name: 红包记录
 *   description: 红包记录查询、统计等接口
 */

// 添加红包记录验证模式
const addRedPacketSchema = Joi.object({
  app: Joi.string().valid('wechat', 'alipay', 'dingtalk', 'juren').required().messages({
    'any.only': '应用类型必须是 wechat、alipay、dingtalk 或 juren 之一',
    'any.required': '应用类型不能为空'
  }),
  groupName: Joi.string().required().messages({
    'any.required': '群聊名称不能为空'
  }),
  groupId: Joi.string().required().messages({
    'any.required': '群聊ID不能为空'
  }),
  sender: Joi.string().required().messages({
    'any.required': '发送者不能为空'
  }),
  amount: Joi.number().positive().precision(2).required().messages({
    'number.positive': '金额必须大于0',
    'any.required': '金额不能为空'
  }),
  message: Joi.string().optional(),
  responseTime: Joi.number().min(0).optional(),
  rank: Joi.number().min(1).optional()
});

/**
 * @swagger
 * /api/redpackets/records:
 *   get:
 *     summary: 获取抢红包记录
 *     description: 分页获取用户的抢红包记录
 *     tags: [红包记录]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 每页大小
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 开始日期 (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 结束日期 (YYYY-MM-DD)
 *       - in: query
 *         name: app
 *         schema:
 *           type: string
 *           enum: [wechat, alipay, dingtalk, juren]
 *         description: 应用类型
 *       - in: query
 *         name: group
 *         schema:
 *           type: string
 *         description: 群聊名称
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [success, failed]
 *         description: 抢红包状态
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
// 获取抢红包记录
router.get('/records', authenticateToken, redPacketController.getRedPacketRecords);

/**
 * @swagger
 * /api/redpackets/{recordId}:
 *   get:
 *     summary: 获取红包详情
 *     description: 获取指定红包记录的详细信息
 *     tags: [红包记录]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recordId
 *         required: true
 *         schema:
 *           type: string
 *         description: 红包记录ID
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
 *                       $ref: '#/components/schemas/RedPacketRecord'
 *       401:
 *         description: 未授权访问
 *       404:
 *         description: 记录不存在
 *       500:
 *         description: 服务器内部错误
 */
// 获取红包详情
router.get('/:recordId', authenticateToken, redPacketController.getRedPacketDetail);

/**
 * @swagger
 * /api/redpackets/stats:
 *   get:
 *     summary: 获取统计数据
 *     description: 获取红包相关的统计数据
 *     tags: [红包记录]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, week, month, year]
 *         description: 统计周期
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 开始日期 (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 结束日期 (YYYY-MM-DD)
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
 *                         totalCount:
 *                           type: integer
 *                           description: 总红包数量
 *                         totalAmount:
 *                           type: number
 *                           description: 总金额
 *                         successCount:
 *                           type: integer
 *                           description: 成功数量
 *                         successRate:
 *                           type: number
 *                           description: 成功率
 *                         averageAmount:
 *                           type: number
 *                           description: 平均金额
 *                         periodStats:
 *                           type: array
 *                           description: 周期统计数据
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
// 获取统计数据
router.get('/stats', authenticateToken, redPacketController.getRedPacketStats);

/**
 * @swagger
 * /api/redpackets/add:
 *   post:
 *     summary: 添加红包记录
 *     description: 模拟抢红包成功，添加红包记录
 *     tags: [红包记录]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - app
 *               - groupName
 *               - groupId
 *               - sender
 *               - amount
 *             properties:
 *               app:
 *                 type: string
 *                 enum: [wechat, alipay, dingtalk, juren]
 *                 description: 应用类型
 *                 example: 'wechat'
 *               groupName:
 *                 type: string
 *                 description: 群聊名称
 *                 example: '工作群'
 *               groupId:
 *                 type: string
 *                 description: 群聊ID
 *                 example: 'group123'
 *               sender:
 *                 type: string
 *                 description: 发送者
 *                 example: '张三'
 *               amount:
 *                 type: number
 *                 format: float
 *                 minimum: 0.01
 *                 description: 红包金额
 *                 example: 8.88
 *               message:
 *                 type: string
 *                 description: 红包消息
 *                 example: '恭喜发财'
 *               responseTime:
 *                 type: number
 *                 minimum: 0
 *                 description: 响应时间（秒）
 *                 example: 0.15
 *               rank:
 *                 type: integer
 *                 minimum: 1
 *                 description: 抢红包排名
 *                 example: 3
 *     responses:
 *       200:
 *         description: 添加成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/RedPacketRecord'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
// 添加红包记录（模拟抢红包成功）
router.post('/add', authenticateToken, validate(addRedPacketSchema), redPacketController.addRedPacketRecord);

module.exports = router;
