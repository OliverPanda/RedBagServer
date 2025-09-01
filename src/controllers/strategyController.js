const { createResponse } = require('../middleware/validation');

// 获取当前策略
const getCurrentStrategy = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // 这里可以从数据库获取用户的策略配置
    // 暂时返回默认策略
    const strategy = {
      isAutoGrabEnabled: true,
      minAmount: 0.01,
      maxAmount: 1000.00,
      responseDelay: 0.1,
      priorityGroups: ["工作群", "家人群"],
      excludedGroups: ["广告群"],
      timeFilter: {
        enabled: true,
        startTime: "08:00",
        endTime: "23:00"
      },
      advancedSettings: {
        smartRecognition: true,
        antiDetectionMode: true
      }
    };

    return createResponse(res, 200, '获取策略成功', strategy);
  } catch (error) {
    console.error('获取策略错误:', error);
    return createResponse(res, 500, '服务器内部错误', null, {
      field: 'server',
      message: '获取策略失败，请稍后重试'
    });
  }
};

// 更新策略
const updateStrategy = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      isAutoGrabEnabled,
      minAmount,
      maxAmount,
      responseDelay,
      priorityGroups,
      excludedGroups,
      timeFilter,
      advancedSettings
    } = req.body;

    // 验证策略参数
    if (minAmount !== undefined && (minAmount < 0 || minAmount > maxAmount)) {
      return createResponse(res, 400, '最小金额设置无效', null, {
        field: 'minAmount',
        message: '最小金额不能小于0且不能大于最大金额'
      });
    }

    if (maxAmount !== undefined && maxAmount < minAmount) {
      return createResponse(res, 400, '最大金额设置无效', null, {
        field: 'maxAmount',
        message: '最大金额不能小于最小金额'
      });
    }

    if (responseDelay !== undefined && (responseDelay < 0 || responseDelay > 10)) {
      return createResponse(res, 400, '响应延迟设置无效', null, {
        field: 'responseDelay',
        message: '响应延迟必须在0-10秒之间'
      });
    }

    // 这里应该将策略保存到数据库
    // TODO: 实现策略保存逻辑
    
    const updatedStrategy = {
      isAutoGrabEnabled: isAutoGrabEnabled !== undefined ? isAutoGrabEnabled : true,
      minAmount: minAmount !== undefined ? minAmount : 0.01,
      maxAmount: maxAmount !== undefined ? maxAmount : 1000.00,
      responseDelay: responseDelay !== undefined ? responseDelay : 0.1,
      priorityGroups: priorityGroups || ["工作群", "家人群"],
      excludedGroups: excludedGroups || ["广告群"],
      timeFilter: timeFilter || {
        enabled: true,
        startTime: "08:00",
        endTime: "23:00"
      },
      advancedSettings: advancedSettings || {
        smartRecognition: true,
        antiDetectionMode: true
      }
    };

    return createResponse(res, 200, '更新策略成功', updatedStrategy);
  } catch (error) {
    console.error('更新策略错误:', error);
    return createResponse(res, 500, '服务器内部错误', null, {
      field: 'server',
      message: '更新策略失败，请稍后重试'
    });
  }
};

// 获取策略预设
const getStrategyPresets = async (req, res) => {
  try {
    const presets = [
      {
        id: 'aggressive',
        name: '激进模式',
        description: '快速响应，优先抢取所有红包',
        settings: {
          isAutoGrabEnabled: true,
          minAmount: 0.01,
          maxAmount: 10000,
          responseDelay: 0.05,
          priorityGroups: [],
          excludedGroups: [],
          timeFilter: { enabled: false },
          advancedSettings: {
            smartRecognition: false,
            antiDetectionMode: false
          }
        }
      },
      {
        id: 'balanced',
        name: '平衡模式',
        description: '平衡速度和成功率',
        settings: {
          isAutoGrabEnabled: true,
          minAmount: 0.1,
          maxAmount: 1000,
          responseDelay: 0.1,
          priorityGroups: ["工作群", "家人群"],
          excludedGroups: ["广告群"],
          timeFilter: {
            enabled: true,
            startTime: "08:00",
            endTime: "23:00"
          },
          advancedSettings: {
            smartRecognition: true,
            antiDetectionMode: true
          }
        }
      },
      {
        id: 'conservative',
        name: '保守模式',
        description: '只抢取高价值红包，避免风险',
        settings: {
          isAutoGrabEnabled: true,
          minAmount: 1.0,
          maxAmount: 1000,
          responseDelay: 0.2,
          priorityGroups: ["家人群", "好友群"],
          excludedGroups: ["广告群", "陌生群"],
          timeFilter: {
            enabled: true,
            startTime: "09:00",
            endTime: "22:00"
          },
          advancedSettings: {
            smartRecognition: true,
            antiDetectionMode: true
          }
        }
      }
    ];

    return createResponse(res, 200, '获取策略预设成功', presets);
  } catch (error) {
    console.error('获取策略预设错误:', error);
    return createResponse(res, 500, '服务器内部错误', null, {
      field: 'server',
      message: '获取策略预设失败，请稍后重试'
    });
  }
};

// 应用策略预设
const applyStrategyPreset = async (req, res) => {
  try {
    const { presetId } = req.params;
    const userId = req.user._id;

    const presets = [
      {
        id: 'aggressive',
        settings: {
          isAutoGrabEnabled: true,
          minAmount: 0.01,
          maxAmount: 10000,
          responseDelay: 0.05,
          priorityGroups: [],
          excludedGroups: [],
          timeFilter: { enabled: false },
          advancedSettings: {
            smartRecognition: false,
            antiDetectionMode: false
          }
        }
      },
      {
        id: 'balanced',
        settings: {
          isAutoGrabEnabled: true,
          minAmount: 0.1,
          maxAmount: 1000,
          responseDelay: 0.1,
          priorityGroups: ["工作群", "家人群"],
          excludedGroups: ["广告群"],
          timeFilter: {
            enabled: true,
            startTime: "08:00",
            endTime: "23:00"
          },
          advancedSettings: {
            smartRecognition: true,
            antiDetectionMode: true
          }
        }
      },
      {
        id: 'conservative',
        settings: {
          isAutoGrabEnabled: true,
          minAmount: 1.0,
          maxAmount: 1000,
          responseDelay: 0.2,
          priorityGroups: ["家人群", "好友群"],
          excludedGroups: ["广告群", "陌生群"],
          timeFilter: {
            enabled: true,
            startTime: "09:00",
            endTime: "22:00"
          },
          advancedSettings: {
            smartRecognition: true,
            antiDetectionMode: true
          }
        }
      }
    ];

    const preset = presets.find(p => p.id === presetId);
    if (!preset) {
      return createResponse(res, 400, '策略预设不存在', null, {
        field: 'presetId',
        message: '未找到指定的策略预设'
      });
    }

    // 这里应该将预设策略保存到数据库
    // TODO: 实现策略保存逻辑

    return createResponse(res, 200, '应用策略预设成功', preset.settings);
  } catch (error) {
    console.error('应用策略预设错误:', error);
    return createResponse(res, 500, '服务器内部错误', null, {
      field: 'server',
      message: '应用策略预设失败，请稍后重试'
    });
  }
};

module.exports = {
  getCurrentStrategy,
  updateStrategy,
  getStrategyPresets,
  applyStrategyPreset
};
