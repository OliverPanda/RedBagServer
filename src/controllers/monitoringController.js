const MonitoringApp = require('../models/MonitoringApp');
const RedPacketRecord = require('../models/RedPacketRecord');
const User = require('../models/User');
const { createResponse } = require('../middleware/validation');
const config = require('../config/config');

// 获取应用监听状态
const getAppsMonitoringStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // 获取用户的所有应用监听状态
    const apps = await MonitoringApp.find({ userId });
    
    // 构建应用状态列表
    const appsStatus = Object.keys(config.apps).map(appId => {
      const app = apps.find(a => a.appId === appId);
      const appInfo = config.apps[appId];
      
      if (app) {
        return {
          id: appId,
          name: appInfo.name,
          icon: appInfo.icon,
          isMonitoring: app.isMonitoring,
          lastRedPacket: app.lastRedPacket,
          todayCount: app.todayCount,
          totalEarnings: app.totalEarnings,
          settings: app.settings
        };
      } else {
        // 如果用户还没有配置该应用，创建默认配置
        return {
          id: appId,
          name: appInfo.name,
          icon: appInfo.icon,
          isMonitoring: false,
          lastRedPacket: null,
          todayCount: 0,
          totalEarnings: 0,
          settings: {
            autoGrab: true,
            minAmount: 0.01,
            maxAmount: 1000,
            responseDelay: 0.1
          }
        };
      }
    });

    return createResponse(res, 200, '获取应用监听状态成功', appsStatus);
  } catch (error) {
    console.error('获取应用监听状态错误:', error);
    return createResponse(res, 500, '服务器内部错误', null, {
      field: 'server',
      message: '获取应用监听状态失败，请稍后重试'
    });
  }
};

// 切换应用监听状态
const toggleAppMonitoring = async (req, res) => {
  try {
    const { appId } = req.params;
    const userId = req.user._id;

    // 验证应用ID
    if (!config.apps[appId]) {
      return createResponse(res, 400, '应用ID无效', null, {
        field: 'appId',
        message: '不支持的应用类型'
      });
    }

    // 查找或创建应用配置
    let app = await MonitoringApp.findOne({ userId, appId });
    
    if (!app) {
      app = new MonitoringApp({
        userId,
        appId,
        isMonitoring: true,
        settings: {
          autoGrab: true,
          minAmount: 0.01,
          maxAmount: 1000,
          responseDelay: 0.1
        }
      });
    } else {
      app.isMonitoring = !app.isMonitoring;
    }

    await app.save();

    return createResponse(res, 200, `${app.isMonitoring ? '开启' : '关闭'}监听成功`, {
      id: appId,
      name: config.apps[appId].name,
      icon: config.apps[appId].icon,
      isMonitoring: app.isMonitoring
    });
  } catch (error) {
    console.error('切换应用监听状态错误:', error);
    return createResponse(res, 500, '服务器内部错误', null, {
      field: 'server',
      message: '切换监听状态失败，请稍后重试'
    });
  }
};

// 更新应用设置
const updateAppSettings = async (req, res) => {
  try {
    const { appId } = req.params;
    const { settings } = req.body;
    const userId = req.user._id;

    // 验证应用ID
    if (!config.apps[appId]) {
      return createResponse(res, 400, '应用ID无效', null, {
        field: 'appId',
        message: '不支持的应用类型'
      });
    }

    // 查找或创建应用配置
    let app = await MonitoringApp.findOne({ userId, appId });
    
    if (!app) {
      app = new MonitoringApp({
        userId,
        appId,
        isMonitoring: true
      });
    }

    // 更新设置
    if (settings) {
      if (settings.autoGrab !== undefined) app.settings.autoGrab = settings.autoGrab;
      if (settings.minAmount !== undefined) app.settings.minAmount = settings.minAmount;
      if (settings.maxAmount !== undefined) app.settings.maxAmount = settings.maxAmount;
      if (settings.responseDelay !== undefined) app.settings.responseDelay = settings.responseDelay;
    }

    await app.save();

    return createResponse(res, 200, '更新应用设置成功', {
      id: appId,
      name: config.apps[appId].name,
      icon: config.apps[appId].icon,
      isMonitoring: app.isMonitoring,
      settings: app.settings
    });
  } catch (error) {
    console.error('更新应用设置错误:', error);
    return createResponse(res, 500, '服务器内部错误', null, {
      field: 'server',
      message: '更新应用设置失败，请稍后重试'
    });
  }
};

// 开始监听
const startMonitoring = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // 更新所有应用的监听状态为开启
    await MonitoringApp.updateMany(
      { userId },
      { isMonitoring: true }
    );

    return createResponse(res, 200, '开始监听成功', {
      message: '所有应用已开始监听'
    });
  } catch (error) {
    console.error('开始监听错误:', error);
    return createResponse(res, 500, '服务器内部错误', null, {
      field: 'server',
      message: '开始监听失败，请稍后重试'
    });
  }
};

// 停止监听
const stopMonitoring = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // 更新所有应用的监听状态为关闭
    await MonitoringApp.updateMany(
      { userId },
      { isMonitoring: false }
    );

    return createResponse(res, 200, '停止监听成功', {
      message: '所有应用已停止监听'
    });
  } catch (error) {
    console.error('停止监听错误:', error);
    return createResponse(res, 500, '服务器内部错误', null, {
      field: 'server',
      message: '停止监听失败，请稍后重试'
    });
  }
};

// 重置今日统计
const resetTodayStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // 重置所有应用的今日统计
    await MonitoringApp.updateMany(
      { userId },
      { 
        todayCount: 0,
        $unset: { lastRedPacket: 1 }
      }
    );

    // 重置用户的今日收益
    await User.findByIdAndUpdate(userId, { todayEarnings: 0 });

    return createResponse(res, 200, '重置今日统计成功', {
      message: '今日统计数据已重置'
    });
  } catch (error) {
    console.error('重置今日统计错误:', error);
    return createResponse(res, 500, '服务器内部错误', null, {
      field: 'server',
      message: '重置今日统计失败，请稍后重试'
    });
  }
};

module.exports = {
  getAppsMonitoringStatus,
  toggleAppMonitoring,
  updateAppSettings,
  startMonitoring,
  stopMonitoring,
  resetTodayStats
};
