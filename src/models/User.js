const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: /^1[3-9]\d{9}$/
  },
  nickname: {
    type: String,
    trim: true,
    maxlength: 50
  },
  avatar: {
    type: String,
    default: ''
  },
  password: {
    type: String,
    minlength: 6
  },
  totalEarnings: {
    type: Number,
    default: 0,
    min: 0
  },
  todayEarnings: {
    type: Number,
    default: 0,
    min: 0
  },
  redPacketCount: {
    type: Number,
    default: 0,
    min: 0
  },
  successRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLoginAt: {
    type: Date
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

// 密码加密中间件
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 验证密码方法
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// 更新今日收益
userSchema.methods.updateTodayEarnings = function(amount) {
  this.todayEarnings += amount;
  this.totalEarnings += amount;
  this.redPacketCount += 1;
  return this.save();
};

// 重置今日收益
userSchema.methods.resetTodayEarnings = function() {
  this.todayEarnings = 0;
  return this.save();
};

// 计算成功率
userSchema.methods.calculateSuccessRate = function(successCount, totalCount) {
  if (totalCount === 0) {
    this.successRate = 0;
  } else {
    this.successRate = Math.round((successCount / totalCount) * 100 * 10) / 10;
  }
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
