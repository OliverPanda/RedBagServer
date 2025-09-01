const express = require('express');
const router = express.Router();
const monitoringController = require('../controllers/monitoringController');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const Joi = require('joi');

// 更新应用设置验证模式
const updateAppSettingsSchema = Joi.object({
  settings: Joi.object({
    autoGrab: Joi.boolean().optional(),
    minAmount: Joi.number().min(0).optional(),
    maxAmount: Joi.number().min(0).optional(),
    responseDelay: Joi.number().min(0).max(10).optional()
  }).optional()
});

// 获取应用监听状态
router.get('/apps', authenticateToken, monitoringController.getAppsMonitoringStatus);

// 切换应用监听状态
router.put('/apps/:appId/toggle', authenticateToken, monitoringController.toggleAppMonitoring);

// 更新应用设置
router.put('/apps/:appId/settings', authenticateToken, validate(updateAppSettingsSchema), monitoringController.updateAppSettings);

// 开始监听
router.post('/start', authenticateToken, monitoringController.startMonitoring);

// 停止监听
router.post('/stop', authenticateToken, monitoringController.stopMonitoring);

// 重置今日统计
router.post('/reset-today', authenticateToken, monitoringController.resetTodayStats);

module.exports = router;
