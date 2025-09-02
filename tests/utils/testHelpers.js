const jwt = require('jsonwebtoken');
const User = require('../../src/models/User');
const RedPacketRecord = require('../../src/models/RedPacketRecord');
const MonitoringApp = require('../../src/models/MonitoringApp');

// 生成测试用的JWT令牌
const generateTestToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// 创建测试用户
const createTestUser = async (userData = {}) => {
  const defaultUser = {
    phone: '13800138000',
    nickname: '测试用户',
    password: 'test123456',
    totalEarnings: 0,
    todayEarnings: 0,
    redPacketCount: 0,
    successRate: 0,
    isActive: true
  };

  const user = new User({ ...defaultUser, ...userData });
  await user.save();
  return user;
};

// 创建测试红包记录
const createTestRedPacketRecord = async (recordData = {}) => {
  let user;
  
  // 如果提供了userId，使用提供的userId；否则创建新用户
  if (recordData.userId) {
    user = { _id: recordData.userId };
  } else {
    user = await createTestUser();
  }
  
  const defaultRecord = {
    userId: user._id,
    amount: 1.00,
    groupName: '测试群组',
    groupId: 'test_group_001',
    sender: '测试发送者',
    message: '恭喜发财',
    status: 'success',
    app: 'wechat',
    responseTime: 100,
    rank: 1
  };

  const record = new RedPacketRecord({ ...defaultRecord, ...recordData });
  await record.save();
  return record;
};

// 创建测试监控应用
const createTestMonitoringApp = async (appData = {}) => {
  const user = await createTestUser();
  
  const defaultApp = {
    userId: user._id,
    name: '测试应用',
    type: 'wechat',
    isActive: true,
    settings: {
      autoGrab: true,
      delay: 100,
      keywords: ['红包', '恭喜发财']
    }
  };

  const app = new MonitoringApp({ ...defaultApp, ...appData });
  await app.save();
  return app;
};

// 模拟请求对象
const mockRequest = (data = {}) => {
  return {
    body: data.body || {},
    query: data.query || {},
    params: data.params || {},
    user: data.user || null,
    headers: data.headers || {},
    ...data
  };
};

// 模拟响应对象
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

// 模拟下一个中间件函数
const mockNext = jest.fn();

// 清理测试数据
const cleanupTestData = async () => {
  await User.deleteMany({});
  await RedPacketRecord.deleteMany({});
  await MonitoringApp.deleteMany({});
};

// 验证响应格式
const validateResponseFormat = (response) => {
  expect(response).toHaveProperty('code');
  expect(response).toHaveProperty('message');
  expect(response).toHaveProperty('timestamp');
  expect(typeof response.code).toBe('number');
  expect(typeof response.message).toBe('string');
  expect(typeof response.timestamp).toBe('string');
};

// 验证错误响应
const validateErrorResponse = (response, expectedCode, expectedMessage) => {
  validateResponseFormat(response);
  expect(response.code).toBe(expectedCode);
  expect(response.message).toBe(expectedMessage);
  expect(response).toHaveProperty('error');
};

// 验证成功响应
const validateSuccessResponse = (response, expectedCode, expectedMessage) => {
  validateResponseFormat(response);
  expect(response.code).toBe(expectedCode);
  expect(response.message).toBe(expectedMessage);
  expect(response).toHaveProperty('data');
};

module.exports = {
  generateTestToken,
  createTestUser,
  createTestRedPacketRecord,
  createTestMonitoringApp,
  mockRequest,
  mockResponse,
  mockNext,
  cleanupTestData,
  validateResponseFormat,
  validateErrorResponse,
  validateSuccessResponse
};
