const authController = require('../../../src/controllers/authController');
const User = require('../../../src/models/User');
const jwt = require('jsonwebtoken');
const {
  mockRequest,
  mockResponse,
  mockNext,
  createTestUser,
  validateSuccessResponse,
  validateErrorResponse
} = require('../../utils/testHelpers');

// Mock JWT
jest.mock('jsonwebtoken');
jwt.sign.mockReturnValue('mock-jwt-token');

describe('Auth Controller', () => {
  let mockRes;

  beforeEach(async () => {
    mockRes = mockResponse();
    jest.clearAllMocks();
    // 清理测试数据
    await User.deleteMany({});
  });

  afterEach(async () => {
    // 测试后清理数据
    await User.deleteMany({});
  });

  describe('sendVerificationCode', () => {
    test('should send verification code successfully with valid data', async () => {
      const req = mockRequest({
        body: {
          phone: '13800138000',
          type: 'register'
        }
      });

      await authController.sendVerificationCode(req, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 200,
          message: '验证码发送成功',
          data: expect.objectContaining({
            expiresIn: 300,
            message: expect.stringContaining('验证码已发送')
          })
        })
      );
    });

    test('should reject invalid phone format', async () => {
      const req = mockRequest({
        body: {
          phone: '12345678901', // 无效格式
          type: 'register'
        }
      });

      await authController.sendVerificationCode(req, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 400,
          message: '手机号格式不正确',
          error: expect.objectContaining({
            field: 'phone',
            message: '请输入正确的手机号码'
          })
        })
      );
    });

    test('should reject invalid verification code type', async () => {
      const req = mockRequest({
        body: {
          phone: '13800138000',
          type: 'invalid_type'
        }
      });

      await authController.sendVerificationCode(req, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 400,
          message: '验证码类型不正确',
          error: expect.objectContaining({
            field: 'type',
            message: '验证码类型必须是 register、login 或 reset 之一'
          })
        })
      );
    });
  });

  describe('register', () => {
    test('should register user successfully with valid data', async () => {
      const req = mockRequest({
        body: {
          phone: '13800138000',
          code: '123456',
          nickname: '测试用户',
          password: 'test123456'
        }
      });

      await authController.register(req, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledTimes(1);
      
      const response = mockRes.json.mock.calls[0][0];
      expect(response.code).toBe(200);
      expect(response.message).toBe('注册成功');
      expect(response.data.phone).toBe('13800138000');
      expect(response.data.nickname).toBe('测试用户');
      expect(response.data.token).toBe('mock-jwt-token');
      expect(response.data.userId).toBeDefined();
      expect(response.data.expiresIn).toBe('1h');
      expect(response.timestamp).toBeDefined();
    });

    test('should reject invalid verification code', async () => {
      const req = mockRequest({
        body: {
          phone: '13800138000',
          code: '000000', // 错误的验证码
          nickname: '测试用户'
        }
      });

      await authController.register(req, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 400,
          message: '验证码错误',
          error: expect.objectContaining({
            field: 'code',
            message: '验证码不正确或已过期'
          })
        })
      );
    });

    test('should reject duplicate phone number', async () => {
      // 先创建一个用户
      await createTestUser({ phone: '13800138000' });

      const req = mockRequest({
        body: {
          phone: '13800138000',
          code: '123456',
          nickname: '另一个用户'
        }
      });

      await authController.register(req, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 400,
          message: '手机号已注册',
          error: expect.objectContaining({
            field: 'phone',
            message: '该手机号已被注册，请直接登录'
          })
        })
      );
    });

    test('should register user without password', async () => {
      const req = mockRequest({
        body: {
          phone: '13800138001',
          code: '123456',
          nickname: '无密码用户'
        }
      });

      await authController.register(req, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledTimes(1);
      
      const response = mockRes.json.mock.calls[0][0];
      expect(response.code).toBe(200);
      expect(response.message).toBe('注册成功');
      expect(response.data.phone).toBe('13800138001');
      expect(response.data.nickname).toBe('无密码用户');
      expect(response.data.token).toBe('mock-jwt-token');
      expect(response.data.userId).toBeDefined();
      expect(response.data.expiresIn).toBe('1h');
      expect(response.timestamp).toBeDefined();
    });
  });

  describe('login', () => {
    test('should login user successfully with valid credentials', async () => {
      const password = 'test123456';
      const user = await createTestUser({ 
        phone: '13800138002',
        password: password
      });

      const req = mockRequest({
        body: {
          phone: '13800138002',
          password: password,
          loginType: 'password'
        }
      });

      await authController.login(req, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledTimes(1);
      
      const response = mockRes.json.mock.calls[0][0];
      expect(response.code).toBe(200);
      expect(response.message).toBe('登录成功');
      expect(response.data.phone).toBe('13800138002');
      expect(response.data.nickname).toBe('测试用户');
      expect(response.data.token).toBe('mock-jwt-token');
      expect(response.data.userId).toBeDefined();
      expect(response.data.expiresIn).toBe('1h');
      expect(response.timestamp).toBeDefined();
    });

    test('should reject login with invalid phone', async () => {
      const req = mockRequest({
        body: {
          phone: '13800138003',
          password: 'test123456',
          loginType: 'password'
        }
      });

      await authController.login(req, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 400,
          message: '用户不存在',
          error: expect.objectContaining({
            field: 'phone',
            message: '该手机号未注册，请先注册'
          }),
          timestamp: expect.any(String)
        })
      );
    });

    test('should reject login with wrong password', async () => {
      await createTestUser({ 
        phone: '13800138004',
        password: 'correctpassword'
      });

      const req = mockRequest({
        body: {
          phone: '13800138004',
          password: 'wrongpassword',
          loginType: 'password'
        }
      });

      await authController.login(req, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 400,
          message: '密码错误',
          error: expect.objectContaining({
            field: 'password',
            message: '密码不正确'
          }),
          timestamp: expect.any(String)
        })
      );
    });
  });


});
