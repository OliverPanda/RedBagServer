const express = require('express');
const router = express.Router();
const strategyController = require('../controllers/strategyController');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const Joi = require('joi');

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

// 获取当前策略
router.get('/current', authenticateToken, strategyController.getCurrentStrategy);

// 更新策略
router.put('/update', authenticateToken, validate(updateStrategySchema), strategyController.updateStrategy);

// 获取策略预设
router.get('/presets', authenticateToken, strategyController.getStrategyPresets);

// 应用策略预设
router.post('/presets/:presetId/apply', authenticateToken, strategyController.applyStrategyPreset);

module.exports = router;
