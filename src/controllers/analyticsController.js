const RedPacketRecord = require('../models/RedPacketRecord');
const User = require('../models/User');
const { createResponse } = require('../middleware/validation');

// 收益分析
const getEarningsAnalysis = async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = 'month', startDate, endDate } = req.query;

    let dateFilter = {};
    const now = new Date();

    // 根据周期设置日期范围
    switch (period) {
      case 'today':
        dateFilter = {
          $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
        };
        break;
      case 'week':
        const weekStart = new Date(now.getTime() - (now.getDay() * 24 * 60 * 60 * 1000));
        dateFilter = {
          $gte: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate()),
          $lt: now
        };
        break;
      case 'month':
        dateFilter = {
          $gte: new Date(now.getFullYear(), now.getMonth(), 1),
          $lt: now
        };
        break;
      case 'year':
        dateFilter = {
          $gte: new Date(now.getFullYear(), 0, 1),
          $lt: now
        };
        break;
      default:
        if (startDate && endDate) {
          dateFilter = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          };
        }
    }

    // 构建查询条件
    const query = { userId, status: 'success' };
    if (Object.keys(dateFilter).length > 0) {
      query.createdAt = dateFilter;
    }

    // 获取收益统计数据
    const [totalAmount, totalCount, appStats, dailyStats] = await Promise.all([
      RedPacketRecord.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      RedPacketRecord.countDocuments(query),
      RedPacketRecord.aggregate([
        { $match: query },
        { $group: { _id: '$app', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } }
      ]),
      RedPacketRecord.aggregate([
        { $match: query },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ])
    ]);

    const analysis = {
      period,
      totalAmount: totalAmount.length > 0 ? totalAmount[0].total : 0,
      totalCount,
      averageAmount: totalCount > 0 ? (totalAmount.length > 0 ? totalAmount[0].total / totalCount : 0).toFixed(2) : 0,
      appStats: appStats.map(stat => ({
        app: stat._id,
        total: stat.total,
        count: stat.count,
        average: (stat.total / stat.count).toFixed(2)
      })),
      dailyStats: dailyStats.map(stat => ({
        date: `${stat._id.year}-${String(stat._id.month).padStart(2, '0')}-${String(stat._id.day).padStart(2, '0')}`,
        total: stat.total,
        count: stat.count
      }))
    };

    return createResponse(res, 200, '获取收益分析成功', analysis);
  } catch (error) {
    console.error('获取收益分析错误:', error);
    return createResponse(res, 500, '服务器内部错误', null, {
      field: 'server',
      message: '获取收益分析失败，请稍后重试'
    });
  }
};

// 数据概览
const getDataOverview = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return createResponse(res, 404, '用户不存在', null, {
        field: 'user',
        message: '未找到用户信息'
      });
    }

    // 获取今日数据
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const [todayRecords, todayAmount] = await Promise.all([
      RedPacketRecord.countDocuments({
        userId,
        status: 'success',
        createdAt: { $gte: todayStart, $lt: todayEnd }
      }),
      RedPacketRecord.aggregate([
        {
          $match: {
            userId,
            status: 'success',
            createdAt: { $gte: todayStart, $lt: todayEnd }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    // 获取本周数据
    const weekStart = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
    const [weekRecords, weekAmount] = await Promise.all([
      RedPacketRecord.countDocuments({
        userId,
        status: 'success',
        createdAt: { $gte: weekStart, $lt: today }
      }),
      RedPacketRecord.aggregate([
        {
          $match: {
            userId,
            status: 'success',
            createdAt: { $gte: weekStart, $lt: today }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    // 获取本月数据
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const [monthRecords, monthAmount] = await Promise.all([
      RedPacketRecord.countDocuments({
        userId,
        status: 'success',
        createdAt: { $gte: monthStart, $lt: today }
      }),
      RedPacketRecord.aggregate([
        {
          $match: {
            userId,
            status: 'success',
            createdAt: { $gte: monthStart, $lt: today }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    // 计算增长率
    const weeklyGrowth = weekAmount.length > 0 ? ((weekAmount[0].total / 7) / (user.totalEarnings / 365) * 100).toFixed(1) : 0;
    const monthlyGrowth = monthAmount.length > 0 ? ((monthAmount[0].total / 30) / (user.totalEarnings / 365) * 100).toFixed(1) : 0;

    const overview = {
      totalEarnings: user.totalEarnings,
      totalRedPackets: user.redPacketCount,
      successRate: user.successRate,
      averageAmount: user.redPacketCount > 0 ? (user.totalEarnings / user.redPacketCount).toFixed(2) : 0,
      highestAmount: 0, // TODO: 从数据库获取最高金额
      lowestAmount: 0,  // TODO: 从数据库获取最低金额
      todayEarnings: todayAmount.length > 0 ? todayAmount[0].total : 0,
      todayRedPackets: todayRecords,
      weeklyGrowth: parseFloat(weeklyGrowth),
      monthlyGrowth: parseFloat(monthlyGrowth)
    };

    return createResponse(res, 200, '获取数据概览成功', overview);
  } catch (error) {
    console.error('获取数据概览错误:', error);
    return createResponse(res, 500, '服务器内部错误', null, {
      field: 'server',
      message: '获取数据概览失败，请稍后重试'
    });
  }
};

// 趋势分析
const getTrendsAnalysis = async (req, res) => {
  try {
    const userId = req.user._id;
    const { days = 30 } = req.query;

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (parseInt(days) * 24 * 60 * 60 * 1000));

    // 获取每日统计数据
    const dailyStats = await RedPacketRecord.aggregate([
      {
        $match: {
          userId,
          status: 'success',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // 获取应用趋势
    const appTrends = await RedPacketRecord.aggregate([
      {
        $match: {
          userId,
          status: 'success',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            app: '$app',
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // 格式化趋势数据
    const trends = {
      period: `${days}天`,
      dailyStats: dailyStats.map(stat => ({
        date: `${stat._id.year}-${String(stat._id.month).padStart(2, '0')}-${String(stat._id.day).padStart(2, '0')}`,
        total: stat.total,
        count: stat.count,
        average: (stat.total / stat.count).toFixed(2)
      })),
      appTrends: appTrends.map(stat => ({
        app: stat._id.app,
        date: `${stat._id.year}-${String(stat._id.month).padStart(2, '0')}-${String(stat._id.day).padStart(2, '0')}`,
        total: stat.total,
        count: stat.count
      }))
    };

    return createResponse(res, 200, '获取趋势分析成功', trends);
  } catch (error) {
    console.error('获取趋势分析错误:', error);
    return createResponse(res, 500, '服务器内部错误', null, {
      field: 'server',
      message: '获取趋势分析失败，请稍后重试'
    });
  }
};

// 数据导出
const exportData = async (req, res) => {
  try {
    const userId = req.user._id;
    const { format = 'csv', startDate, endDate } = req.query;

    // 构建查询条件
    const query = { userId };
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // 获取数据
    const records = await RedPacketRecord.find(query)
      .sort({ createdAt: -1 })
      .lean();

    if (format === 'csv') {
      // 生成CSV格式
      const csvHeaders = '时间,应用,群聊,发送者,金额,消息,状态,响应时间,排名\n';
      const csvData = records.map(record => 
        `${record.createdAt.toISOString()},${record.app},${record.groupName},${record.sender},${record.amount},${record.message || ''},${record.status},${record.responseTime},${record.rank || ''}`
      ).join('\n');

      const csvContent = csvHeaders + csvData;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=redpacket_records_${new Date().toISOString().split('T')[0]}.csv`);
      return res.send(csvContent);
    } else {
      // 返回JSON格式
      return createResponse(res, 200, '导出数据成功', {
        format: 'json',
        total: records.length,
        data: records
      });
    }
  } catch (error) {
    console.error('导出数据错误:', error);
    return createResponse(res, 500, '服务器内部错误', null, {
      field: 'server',
      message: '导出数据失败，请稍后重试'
    });
  }
};

module.exports = {
  getEarningsAnalysis,
  getDataOverview,
  getTrendsAnalysis,
  exportData
};
