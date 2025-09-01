const RedPacketRecord = require('../models/RedPacketRecord');
const User = require('../models/User');
const MonitoringApp = require('../models/MonitoringApp');
const { createResponse } = require('../middleware/validation');

// 获取抢红包记录
const getRedPacketRecords = async (req, res) => {
  try {
    const userId = req.user._id;
    const { 
      page = 1, 
      size = 20, 
      startDate, 
      endDate, 
      app, 
      group, 
      status 
    } = req.query;

    // 构建查询条件
    const query = { userId };
    
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (app) {
      query.app = app;
    }
    
    if (group) {
      query.groupName = { $regex: group, $options: 'i' };
    }
    
    if (status) {
      query.status = status;
    }

    // 计算分页
    const skip = (page - 1) * size;
    
    // 获取记录和总数
    const [records, total] = await Promise.all([
      RedPacketRecord.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(size))
        .lean(),
      RedPacketRecord.countDocuments(query)
    ]);

    // 格式化记录数据
    const formattedRecords = records.map(record => ({
      id: record._id,
      amount: record.amount,
      time: record.createdAt,
      group: record.groupName,
      sender: record.sender,
      message: record.message,
      status: record.status,
      app: record.app,
      responseTime: record.responseTime,
      rank: record.rank
    }));

    return createResponse(res, 200, '获取红包记录成功', {
      records: formattedRecords,
      pagination: {
        page: parseInt(page),
        size: parseInt(size),
        total,
        totalPages: Math.ceil(total / size)
      }
    });
  } catch (error) {
    console.error('获取红包记录错误:', error);
    return createResponse(res, 500, '服务器内部错误', null, {
      field: 'server',
      message: '获取红包记录失败，请稍后重试'
    });
  }
};

// 获取红包详情
const getRedPacketDetail = async (req, res) => {
  try {
    const { recordId } = req.params;
    const userId = req.user._id;

    const record = await RedPacketRecord.findOne({ _id: recordId, userId });
    
    if (!record) {
      return createResponse(res, 404, '红包记录不存在', null, {
        field: 'recordId',
        message: '未找到指定的红包记录'
      });
    }

    const detail = {
      id: record._id,
      amount: record.amount,
      time: record.createdAt,
      group: record.groupName,
      sender: record.sender,
      message: record.message,
      status: record.status,
      app: record.app,
      responseTime: record.responseTime,
      rank: record.rank,
      metadata: record.metadata
    };

    return createResponse(res, 200, '获取红包详情成功', detail);
  } catch (error) {
    console.error('获取红包详情错误:', error);
    return createResponse(res, 500, '服务器内部错误', null, {
      field: 'server',
      message: '获取红包详情失败，请稍后重试'
    });
  }
};

// 获取统计数据
const getRedPacketStats = async (req, res) => {
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
    const query = { userId };
    if (Object.keys(dateFilter).length > 0) {
      query.createdAt = dateFilter;
    }

    // 获取统计数据
    const [totalRecords, successRecords, totalAmount, appStats, groupStats] = await Promise.all([
      RedPacketRecord.countDocuments(query),
      RedPacketRecord.countDocuments({ ...query, status: 'success' }),
      RedPacketRecord.aggregate([
        { $match: { ...query, status: 'success' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      RedPacketRecord.aggregate([
        { $match: query },
        { $group: { _id: '$app', count: { $sum: 1 }, amount: { $sum: '$amount' } } }
      ]),
      RedPacketRecord.aggregate([
        { $match: query },
        { $group: { _id: '$groupName', count: { $sum: 1 }, amount: { $sum: '$amount' } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    const stats = {
      totalRecords,
      successRecords,
      failedRecords: totalRecords - successRecords,
      successRate: totalRecords > 0 ? ((successRecords / totalRecords) * 100).toFixed(1) : 0,
      totalAmount: totalAmount.length > 0 ? totalAmount[0].total : 0,
      averageAmount: successRecords > 0 ? (totalAmount.length > 0 ? totalAmount[0].total / successRecords : 0).toFixed(2) : 0,
      appStats: appStats.map(stat => ({
        app: stat._id,
        count: stat.count,
        amount: stat.amount
      })),
      topGroups: groupStats.map(stat => ({
        group: stat._id,
        count: stat.count,
        amount: stat.amount
      }))
    };

    return createResponse(res, 200, '获取统计数据成功', stats);
  } catch (error) {
    console.error('获取统计数据错误:', error);
    return createResponse(res, 500, '服务器内部错误', null, {
      field: 'server',
      message: '获取统计数据失败，请稍后重试'
    });
  }
};

// 添加红包记录（模拟抢红包成功）
const addRedPacketRecord = async (req, res) => {
  try {
    const userId = req.user._id;
    const { app, groupName, groupId, sender, amount, message, responseTime, rank } = req.body;

    // 创建红包记录
    const record = new RedPacketRecord({
      userId,
      app,
      groupName,
      groupId,
      sender,
      amount,
      message: message || '',
      status: 'success',
      responseTime: responseTime || 0,
      rank
    });

    await record.save();

    // 更新用户统计
    const user = await User.findById(userId);
    if (user) {
      await user.updateTodayEarnings(amount);
    }

    // 更新应用统计
    const monitoringApp = await MonitoringApp.findOne({ userId, appId: app });
    if (monitoringApp) {
      await monitoringApp.updateLastRedPacket({
        id: record._id,
        amount,
        groupName,
        sender,
        timestamp: record.createdAt
      });
    }

    return createResponse(res, 200, '添加红包记录成功', {
      id: record._id,
      amount: record.amount,
      time: record.createdAt
    });
  } catch (error) {
    console.error('添加红包记录错误:', error);
    return createResponse(res, 500, '服务器内部错误', null, {
      field: 'server',
      message: '添加红包记录失败，请稍后重试'
    });
  }
};

module.exports = {
  getRedPacketRecords,
  getRedPacketDetail,
  getRedPacketStats,
  addRedPacketRecord
};
