const mongoose = require('mongoose');

const monitoringAppSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appId: {
    type: String,
    required: true,
    enum: ['wechat', 'alipay', 'dingtalk', 'juren']
  },
  isMonitoring: {
    type: Boolean,
    default: true
  },
  lastRedPacket: {
    id: String,
    amount: Number,
    groupName: String,
    sender: String,
    timestamp: Date
  },
  todayCount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalEarnings: {
    type: Number,
    default: 0,
    min: 0
  },
  settings: {
    autoGrab: {
      type: Boolean,
      default: true
    },
    minAmount: {
      type: Number,
      default: 0.01,
      min: 0
    },
    maxAmount: {
      type: Number,
      default: 1000,
      min: 0
    },
    responseDelay: {
      type: Number,
      default: 0.1,
      min: 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 创建复合唯一索引
monitoringAppSchema.index({ userId: 1, appId: 1 }, { unique: true });

// 更新今日红包数量
monitoringAppSchema.methods.updateTodayCount = function() {
  this.todayCount += 1;
  return this.save();
};

// 重置今日红包数量
monitoringAppSchema.methods.resetTodayCount = function() {
  this.todayCount = 0;
  return this.save();
};

// 更新最后红包信息
monitoringAppSchema.methods.updateLastRedPacket = function(redPacketInfo) {
  this.lastRedPacket = redPacketInfo;
  this.todayCount += 1;
  this.totalEarnings += redPacketInfo.amount;
  return this.save();
};

module.exports = mongoose.model('MonitoringApp', monitoringAppSchema);
