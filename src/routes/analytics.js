const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticateToken } = require('../middleware/auth');

// 收益分析
router.get('/earnings', authenticateToken, analyticsController.getEarningsAnalysis);

// 数据概览
router.get('/overview', authenticateToken, analyticsController.getDataOverview);

// 趋势分析
router.get('/trends', authenticateToken, analyticsController.getTrendsAnalysis);

// 数据导出
router.get('/export', authenticateToken, analyticsController.exportData);

module.exports = router;
