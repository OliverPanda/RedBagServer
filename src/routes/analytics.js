const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticateToken } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: 数据分析
 *   description: 收益分析、趋势分析等数据统计接口
 */

/**
 * @swagger
 * /api/analytics/earnings:
 *   get:
 *     summary: 收益分析
 *     description: 获取用户的收益分析数据
 *     tags: [数据分析]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, week, month, year]
 *         description: 分析周期
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
 *                         totalEarnings:
 *                           type: number
 *                           description: 总收益
 *                         periodEarnings:
 *                           type: number
 *                           description: 周期收益
 *                         averageDaily:
 *                           type: number
 *                           description: 日均收益
 *                         trendData:
 *                           type: array
 *                           description: 趋势数据
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
// 收益分析
router.get('/earnings', authenticateToken, analyticsController.getEarningsAnalysis);

/**
 * @swagger
 * /api/analytics/overview:
 *   get:
 *     summary: 数据概览
 *     description: 获取用户数据的整体概览
 *     tags: [数据分析]
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
 *                         totalRedPackets:
 *                           type: integer
 *                           description: 总红包数量
 *                         totalEarnings:
 *                           type: number
 *                           description: 总收益
 *                         successRate:
 *                           type: number
 *                           description: 成功率
 *                         averageAmount:
 *                           type: number
 *                           description: 平均金额
 *                         highestAmount:
 *                           type: number
 *                           description: 最高金额
 *                         lowestAmount:
 *                           type: number
 *                           description: 最低金额
 *                         todayStats:
 *                           type: object
 *                           description: 今日统计
 *                         weekStats:
 *                           type: object
 *                           description: 本周统计
 *                         monthStats:
 *                           type: object
 *                           description: 本月统计
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
// 数据概览
router.get('/overview', authenticateToken, analyticsController.getDataOverview);

/**
 * @swagger
 * /api/analytics/trends:
 *   get:
 *     summary: 趋势分析
 *     description: 获取用户数据的趋势分析
 *     tags: [数据分析]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *           minimum: 1
 *           maximum: 365
 *         description: 分析天数
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
 *                         dailyTrends:
 *                           type: array
 *                           description: 每日趋势数据
 *                         weeklyTrends:
 *                           type: array
 *                           description: 每周趋势数据
 *                         monthlyTrends:
 *                           type: array
 *                           description: 每月趋势数据
 *                         growthRate:
 *                           type: number
 *                           description: 增长率
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
// 趋势分析
router.get('/trends', authenticateToken, analyticsController.getTrendsAnalysis);

/**
 * @swagger
 * /api/analytics/export:
 *   get:
 *     summary: 数据导出
 *     description: 导出用户的红包记录数据
 *     tags: [数据分析]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, json]
 *           default: csv
 *         description: 导出格式
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
 *         description: 导出成功
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               description: CSV格式数据
 *           application/json:
 *             schema:
 *               type: object
 *               description: JSON格式数据
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
// 数据导出
router.get('/export', authenticateToken, analyticsController.exportData);

module.exports = router;
