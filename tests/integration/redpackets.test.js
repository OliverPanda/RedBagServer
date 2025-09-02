const request = require('supertest');
const app = require('../../app');
const User = require('../../src/models/User');
const RedPacketRecord = require('../../src/models/RedPacketRecord');
const { createTestUser, createTestRedPacketRecord, generateTestToken } = require('../utils/testHelpers');

describe('RedPackets API Integration Tests', () => {
  let authToken;
  let testUser;

  beforeEach(async () => {
    await User.deleteMany({});
    await RedPacketRecord.deleteMany({});
    
    testUser = await createTestUser({ phone: '13800138010' });
    authToken = generateTestToken(testUser._id);
  });

  describe('GET /api/redpackets/records', () => {
    beforeEach(async () => {
      // Create test records
      await createTestRedPacketRecord({ userId: testUser._id, amount: 1.00, app: 'wechat' });
      await createTestRedPacketRecord({ userId: testUser._id, amount: 2.00, app: 'alipay' });
      await createTestRedPacketRecord({ userId: testUser._id, amount: 3.00, app: 'wechat' });
    });

    test('should get red packet records successfully', async () => {
      const response = await request(app)
        .get('/api/redpackets/records')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        code: 200,
        message: '获取红包记录成功',
        data: {
          records: expect.any(Array),
          pagination: {
            page: 1,
            size: 20,
            total: 3,
            totalPages: 1
          }
        }
      });

      expect(response.body.data.records).toHaveLength(3);
    });

    test('should handle pagination correctly', async () => {
      const response = await request(app)
        .get('/api/redpackets/records?page=1&size=2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.pagination).toMatchObject({
        page: 1,
        size: 2,
        total: 3,
        totalPages: 2
      });

      expect(response.body.data.records).toHaveLength(2);
    });

    test('should filter by app type', async () => {
      const response = await request(app)
        .get('/api/redpackets/records?app=wechat')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.records).toHaveLength(2);
      response.body.data.records.forEach(record => {
        expect(record.app).toBe('wechat');
      });
    });

    test('should filter by date range', async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const response = await request(app)
        .get(`/api/redpackets/records?startDate=${yesterday.toISOString()}&endDate=${now.toISOString()}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.records).toHaveLength(3);
    });

    test('should filter by group name', async () => {
      const response = await request(app)
        .get('/api/redpackets/records?group=' + encodeURIComponent('测试群组'))
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.records).toHaveLength(3);
    });

    test('should filter by status', async () => {
      const response = await request(app)
        .get('/api/redpackets/records?status=success')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.records).toHaveLength(3);
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .get('/api/redpackets/records')
        .expect(401);

      expect(response.body).toMatchObject({
        code: 401,
        message: '访问令牌缺失'
      });
    });

    test('should reject invalid token', async () => {
      const response = await request(app)
        .get('/api/redpackets/records')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toMatchObject({
        code: 401,
        message: '访问令牌无效'
      });
    });
  });

  describe('GET /api/redpackets/records/:recordId', () => {
    let testRecord;

    beforeEach(async () => {
      testRecord = await createTestRedPacketRecord({ userId: testUser._id });
    });

    test('should get red packet detail successfully', async () => {
      const response = await request(app)
        .get(`/api/redpackets/${testRecord._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        code: 200,
        message: '获取红包详情成功',
        data: {
          id: testRecord._id.toString(),
          amount: testRecord.amount,
          group: testRecord.groupName,
          sender: testRecord.sender,
          message: testRecord.message,
          status: testRecord.status,
          app: testRecord.app
        }
      });
    });

    test('should return 404 for non-existent record', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .get(`/api/redpackets/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('红包记录不存在');
    });

    test('should not allow access to other user records', async () => {
      const otherUser = await createTestUser({ phone: '13800138001' });
      const otherRecord = await createTestRedPacketRecord({ userId: otherUser._id });

      const response = await request(app)
        .get(`/api/redpackets/${otherRecord._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('红包记录不存在');
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .get(`/api/redpackets/${testRecord._id}`)
        .expect(401);

      expect(response.body).toMatchObject({
        code: 401,
        message: '访问令牌缺失'
      });
    });
  });

  describe('GET /api/redpackets/analytics', () => {
    beforeEach(async () => {
      // Create records with different amounts and dates
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

      await createTestRedPacketRecord({ 
        userId: testUser._id, 
        amount: 1.00, 
        app: 'wechat',
        createdAt: now
      });
      await createTestRedPacketRecord({ 
        userId: testUser._id, 
        amount: 2.00, 
        app: 'alipay',
        createdAt: yesterday
      });
      await createTestRedPacketRecord({ 
        userId: testUser._id, 
        amount: 3.00, 
        app: 'wechat',
        createdAt: twoDaysAgo
      });
    });

    test('should get analytics data successfully', async () => {
      const response = await request(app)
        .get('/api/redpackets/analytics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        code: 200,
        message: '获取统计数据成功',
        data: {
          totalEarnings: 6.00,
          todayEarnings: 1.00,
          totalCount: 3,
          successRate: 100,
          appDistribution: expect.any(Object),
          dailyTrend: expect.any(Array)
        }
      });
    });

    test('should filter analytics by date range', async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const response = await request(app)
        .get(`/api/redpackets/analytics?startDate=${yesterday.toISOString()}&endDate=${now.toISOString()}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.totalCount).toBe(2);
      expect(response.body.data.totalEarnings).toBe(3.00);
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .get('/api/redpackets/analytics')
        .expect(401);

      expect(response.body).toMatchObject({
        code: 401,
        message: '访问令牌缺失'
      });
    });
  });
});
