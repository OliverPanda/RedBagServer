const redPacketController = require('../../../src/controllers/redPacketController');
const RedPacketRecord = require('../../../src/models/RedPacketRecord');
const User = require('../../../src/models/User');
const {
  mockRequest,
  mockResponse,
  createTestUser,
  createTestRedPacketRecord
} = require('../../utils/testHelpers');

describe('RedPacket Controller', () => {
  let mockRes;

  beforeEach(async () => {
    mockRes = mockResponse();
    // 清理测试数据
    await User.deleteMany({});
    await RedPacketRecord.deleteMany({});
  });

  describe('getRedPacketRecords', () => {
    test('should get red packet records successfully', async () => {
      const user = await createTestUser({ phone: '13800138001' });
      await createTestRedPacketRecord({ userId: user._id });

      const req = mockRequest({
        user: { _id: user._id },
        query: { page: 1, size: 20 }
      });

      await redPacketController.getRedPacketRecords(req, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 200,
          message: '获取红包记录成功',
          data: expect.objectContaining({
            records: expect.any(Array),
            pagination: expect.objectContaining({
              page: 1,
              size: 20,
              total: expect.any(Number),
              totalPages: expect.any(Number)
            })
          })
        })
      );
    });

    test('should handle pagination correctly', async () => {
      const user = await createTestUser({ phone: '13800138002' });
      
      // 创建多条记录
      for (let i = 0; i < 25; i++) {
        await createTestRedPacketRecord({ userId: user._id });
      }

      const req = mockRequest({
        user: { _id: user._id },
        query: { page: 2, size: 10 }
      });

      await redPacketController.getRedPacketRecords(req, mockRes);

      const response = mockRes.json.mock.calls[0][0];
      expect(response.data.pagination.page).toBe(2);
      expect(response.data.pagination.size).toBe(10);
      expect(response.data.pagination.total).toBe(25);
      expect(response.data.pagination.totalPages).toBe(3);
    });
  });

  describe('getRedPacketDetail', () => {
    test('should get red packet detail successfully', async () => {
      const user = await createTestUser({ phone: '13800138003' });
      const record = await createTestRedPacketRecord({ userId: user._id });

      const req = mockRequest({
        user: { _id: user._id },
        params: { recordId: record._id.toString() }
      });

      await redPacketController.getRedPacketDetail(req, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledTimes(1);
      
      const response = mockRes.json.mock.calls[0][0];
      expect(response.code).toBe(200);
      expect(response.message).toBe('获取红包详情成功');
      expect(response.data.id).toBeDefined();
      expect(response.data.id.toString()).toBe(record._id.toString());
      expect(response.data.amount).toBe(1);
      expect(response.data.app).toBe('wechat');
      expect(response.data.group).toBe('测试群组');
      expect(response.data.sender).toBe('测试发送者');
      expect(response.data.status).toBe('success');
      expect(response.data.message).toBe('恭喜发财');
      expect(response.data.rank).toBe(1);
      expect(response.data.responseTime).toBe(100);
      expect(response.data.metadata).toEqual({});
      expect(response.data.time).toBeDefined();
      expect(response.timestamp).toBeDefined();
    });
  });
});
