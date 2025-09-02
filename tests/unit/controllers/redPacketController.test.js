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
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 200,
          message: '获取红包详情成功',
          data: expect.objectContaining({
            id: record._id.toString(),
            amount: expect.any(Number),
            app: expect.any(String),
            group: expect.any(String),
            sender: expect.any(String),
            status: expect.any(String),
            message: expect.any(String),
            rank: expect.any(Number),
            responseTime: expect.any(Number),
            metadata: expect.any(Object),
            time: expect.any(String)
          }),
          timestamp: expect.any(String)
        })
      );
    });
  });
});
