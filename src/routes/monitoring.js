const express = require('express');
const router = express.Router();
const monitoringController = require('../controllers/monitoringController');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const Joi = require('joi');

/**
 * @swagger
 * tags:
 *   name: 红包监控
 *   description: 应用监听状态、设置管理等接口
 */

// 更新应用设置验证模式
const updateAppSettingsSchema = Joi.object({
  settings: Joi.object({
    autoGrab: Joi.boolean().optional(),
    minAmount: Joi.number().min(0).optional(),
    maxAmount: Joi.number().min(0).optional(),
    responseDelay: Joi.number().min(0).max(10).optional()
  }).optional()
});

/**
 * @swagger
 * /api/monitoring/apps:
 *   get:
 *     summary: 获取应用监听状态
 *     description: 获取所有应用的监听状态和配置信息
 *     tags: [红包监控]
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
 *                         $ref: '#/components/schemas/MonitoringApp'
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
// 获取应用监听状态
router.get('/apps', authenticateToken, monitoringController.getAppsMonitoringStatus);

/**
 * @swagger
 * /api/monitoring/apps/{appId}/toggle:
 *   put:
 *     summary: 切换应用监听状态
 *     description: 开启或关闭指定应用的监听
 *     tags: [红包监控]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appId
 *         required: true
 *         schema:
 *           type: string
 *           enum: [wechat, alipay, dingtalk, juren]
 *         description: 应用ID
 *         example: 'wechat'
 *     responses:
 *       200:
 *         description: 切换成功
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
 *                         isMonitoring:
 *                           type: boolean
 *                           description: 当前监听状态
 *       400:
 *         description: 应用ID无效
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
// 切换应用监听状态
router.put('/apps/:appId/toggle', authenticateToken, monitoringController.toggleAppMonitoring);

/**
 * @swagger
 * /api/monitoring/apps/{appId}/settings:
 *   put:
 *     summary: 更新应用设置
 *     description: 更新指定应用的监听设置
 *     tags: [红包监控]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appId
 *         required: true
 *         schema:
 *           type: string
 *           enum: [wechat, alipay, dingtalk, juren]
 *         description: 应用ID
 *         example: 'wechat'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               settings:
 *                 type: object
 *                 properties:
 *                   autoGrab:
 *                     type: boolean
 *                     description: 是否自动抢红包
 *                   minAmount:
 *                     type: number
 *                     minimum: 0
 *                     description: 最小金额
 *                   maxAmount:
 *                     type: number
 *                     minimum: 0
 *                     description: 最大金额
 *                   responseDelay:
 *                     type: number
 *                     minimum: 0
 *                     maximum: 10
 *                     description: 响应延迟（秒）
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
 *                       $ref: '#/components/schemas/MonitoringApp'
 *       400:
 *         description: 应用ID无效
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
// 更新应用设置
router.put('/apps/:appId/settings', authenticateToken, validate(updateAppSettingsSchema), monitoringController.updateAppSettings);

/**
 * @swagger
 * /api/monitoring/start:
 *   post:
 *     summary: 开始监听
 *     description: 开启所有应用的监听
 *     tags: [红包监控]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 开始监听成功
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
 *                         message:
 *                           type: string
 *                           example: '所有应用监听已开启'
 *                         activeApps:
 *                           type: array
 *                           items:
 *                             type: string
 *                           description: 已开启监听的应用列表
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
// 开始监听
router.post('/start', authenticateToken, monitoringController.startMonitoring);

/**
 * @swagger
 * /api/monitoring/stop:
 *   post:
 *     summary: 停止监听
 *     description: 停止所有应用的监听
 *     tags: [红包监控]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 停止监听成功
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
 *                         message:
 *                           type: string
 *                           example: '所有应用监听已停止'
 *                         stoppedApps:
 *                           type: array
 *                           items:
 *                             type: string
 *                           description: 已停止监听的应用列表
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
// 停止监听
router.post('/stop', authenticateToken, monitoringController.stopMonitoring);

/**
 * @swagger
 * /api/monitoring/reset-today:
 *   post:
 *     summary: 重置今日统计
 *     description: 重置所有应用的今日统计数据
 *     tags: [红包监控]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 重置成功
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
 *                         message:
 *                           type: string
 *                           example: '今日统计数据已重置'
 *                         resetApps:
 *                           type: array
 *                           items:
 *                             type: string
 *                           description: 已重置统计的应用列表
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
// 重置今日统计
router.post('/reset-today', authenticateToken, monitoringController.resetTodayStats);

module.exports = router;
