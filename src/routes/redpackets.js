const express = require('express');
const router = express.Router();
const redPacketController = require('../controllers/redPacketController');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const Joi = require('joi');

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

// 获取抢红包记录
router.get('/records', authenticateToken, redPacketController.getRedPacketRecords);

// 获取红包详情
router.get('/:recordId', authenticateToken, redPacketController.getRedPacketDetail);

// 获取统计数据
router.get('/stats', authenticateToken, redPacketController.getRedPacketStats);

// 添加红包记录（模拟抢红包成功）
router.post('/add', authenticateToken, validate(addRedPacketSchema), redPacketController.addRedPacketRecord);

module.exports = router;
