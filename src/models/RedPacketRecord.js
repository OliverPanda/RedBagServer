const mongoose = require('mongoose');

const redPacketRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  app: {
    type: String,
    required: true,
    enum: ['wechat', 'alipay', 'dingtalk', 'juren']
  },
  groupName: {
    type: String,
    required: true,
    trim: true
  },
  groupId: {
    type: String,
    required: true
  },
  sender: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01
  },
  message: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    required: true,
    enum: ['success', 'failed'],
    default: 'success'
  },
  responseTime: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  rank: {
    type: Number,
    min: 1
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 创建索引
redPacketRecordSchema.index({ userId: 1, createdAt: -1 });
redPacketRecordSchema.index({ app: 1, status: 1 });
redPacketRecordSchema.index({ createdAt: -1 });
redPacketRecordSchema.index({ groupId: 1, app: 1 });

module.exports = mongoose.model('RedPacketRecord', redPacketRecordSchema);
