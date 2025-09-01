const express = require('express');
const router = express.Router();
const strategyController = require('../controllers/strategyController');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const Joi = require('joi');

/**
 * @swagger
 * tags:
 *   name: 策略设置
 *   description: 抢红包策略配置和管理接口
 */

// 更新策略验证模式
const updateStrategySchema = Joi.object({
  isAutoGrabEnabled: Joi.boolean().optional(),
  minAmount: Joi.number().min(0).optional(),
  maxAmount: Joi.number().min(0).optional(),
  responseDelay: Joi.number().min(0).max(10).optional(),
  priorityGroups: Joi.array().items(Joi.string()).optional(),
  excludedGroups: Joi.array().items(Joi.string()).optional(),
  timeFilter: Joi.object({
    enabled: Joi.boolean().optional(),
    startTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    endTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional()
  }).optional(),
  advancedSettings: Joi.object({
    smartRecognition: Joi.boolean().optional(),
    antiDetectionMode: Joi.boolean().optional()
  }).optional()
});

/**
 * @swagger
 * /api/strategy/current:
 *   get:
 *     summary: 获取当前策略
 *     description: 获取用户当前的抢红包策略配置
 *     tags: [策略设置]
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
 *                         isAutoGrabEnabled:
 *                           type: boolean
 *                           description: 是否启用自动抢红包
 *                         minAmount:
 *                           type: number
 *                           description: 最小金额
 *                         maxAmount:
 *                           type: number
 *                           description: 最大金额
 *                         responseDelay:
 *                           type: number
 *                           description: 响应延迟（秒）
 *                         priorityGroups:
 *                           type: array
 *                           items:
 *                             type: string
 *                           description: 优先群聊列表
 *                         excludedGroups:
 *                           type: array
 *                           items:
 *                             type: string
 *                           description: 排除群聊列表
 *                         timeFilter:
 *                           type: object
 *                           description: 时间过滤设置
 *                         advancedSettings:
 *                           type: object
 *                           description: 高级设置
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
// 获取当前策略
router.get('/current', authenticateToken, strategyController.getCurrentStrategy);

/**
 * @swagger
 * /api/strategy/update:
 *   put:
 *     summary: 更新策略
 *     description: 更新用户的抢红包策略配置
 *     tags: [策略设置]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isAutoGrabEnabled:
 *                 type: boolean
 *                 description: 是否启用自动抢红包
 *               minAmount:
 *                 type: number
 *                 minimum: 0
 *                 description: 最小金额
 *               maxAmount:
 *                 type: number
 *                 minimum: 0
 *                 description: 最大金额
 *               responseDelay:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 10
 *                 description: 响应延迟（秒）
 *               priorityGroups:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 优先群聊列表
 *               excludedGroups:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 排除群聊列表
 *               timeFilter:
 *                 type: object
 *                 properties:
 *                   enabled:
 *                     type: boolean
 *                     description: 是否启用时间过滤
 *                   startTime:
 *                     type: string
 *                     pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                     description: 开始时间 (HH:MM)
 *                   endTime:
 *                     type: string
 *                     pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                     description: 结束时间 (HH:MM)
 *               advancedSettings:
 *                 type: object
 *                 properties:
 *                   smartRecognition:
 *                     type: boolean
 *                     description: 智能识别模式
 *                   antiDetectionMode:
 *                     type: boolean
 *                     description: 反检测模式
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
 *                       type: object
 *                       description: 更新后的策略配置
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
// 更新策略
router.put('/update', authenticateToken, validate(updateStrategySchema), strategyController.updateStrategy);

/**
 * @swagger
 * /api/strategy/presets:
 *   get:
 *     summary: 获取策略预设
 *     description: 获取系统提供的策略预设模板
 *     tags: [策略设置]
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
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             description: 预设ID
 *                             example: 'aggressive'
 *                           name:
 *                             type: string
 *                             description: 预设名称
 *                             example: '激进模式'
 *                           description:
 *                             type: string
 *                             description: 预设描述
 *                             example: '快速响应，优先抢大红包'
 *                           config:
 *                             type: object
 *                             description: 预设配置
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
// 获取策略预设
router.get('/presets', authenticateToken, strategyController.getStrategyPresets);

/**
 * @swagger
 * /api/strategy/presets/{presetId}/apply:
 *   post:
 *     summary: 应用策略预设
 *     description: 应用指定的策略预设模板
 *     tags: [策略设置]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: presetId
 *         required: true
 *         schema:
 *           type: string
 *           enum: [aggressive, balanced, conservative]
 *         description: 预设ID
 *         example: 'aggressive'
 *     responses:
 *       200:
 *         description: 应用成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       description: 应用后的策略配置
 *       400:
 *         description: 预设不存在
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
// 应用策略预设
router.post('/presets/:presetId/apply', authenticateToken, strategyController.applyStrategyPreset);

module.exports = router;
