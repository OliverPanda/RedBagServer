const request = require('supertest');
const app = require('../../app');
const User = require('../../src/models/User');
const { createTestUser, generateTestToken } = require('../utils/testHelpers');

describe('Auth API Integration Tests', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/send-code', () => {
    test('should send verification code successfully', async () => {
      const response = await request(app)
        .post('/api/auth/send-code')
        .send({
          phone: '13800138000',
          type: 'register'
        })
        .expect(200);

      expect(response.body).toMatchObject({
        code: 200,
        message: '验证码发送成功',
        data: {
          expiresIn: 300,
          message: expect.stringContaining('验证码已发送')
        }
      });
    });

    test('should reject invalid phone format', async () => {
      const response = await request(app)
        .post('/api/auth/send-code')
        .send({
          phone: '12345678901',
          type: 'register'
        })
        .expect(400);

      expect(response.body).toMatchObject({
        code: 400,
        message: '请求参数错误',
        error: {
          field: 'phone',
          message: '手机号格式不正确'
        }
      });
    });

    test('should reject invalid verification code type', async () => {
      const response = await request(app)
        .post('/api/auth/send-code')
        .send({
          phone: '13800138000',
          type: 'invalid_type'
        })
        .expect(400);

      expect(response.body).toMatchObject({
        code: 400,
        message: '请求参数错误',
        error: {
          field: 'type',
          message: '验证码类型必须是 register、login 或 reset 之一'
        }
      });
    });
  });

  describe('POST /api/auth/register', () => {
    test('should register user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          phone: '13800138000',
          code: '123456',
          nickname: '测试用户',
          password: 'test123456'
        })
        .expect(200);

      expect(response.body).toMatchObject({
        code: 200,
        message: '注册成功',
        data: {
          token: expect.any(String)
        }
      });

      // Verify user was created in database
      const user = await User.findOne({ phone: '13800138000' });
      expect(user).toBeTruthy();
      expect(user.nickname).toBe('测试用户');
      expect(user.password).not.toBe('test123456'); // Should be hashed
    });

    test('should reject duplicate phone number', async () => {
      // Create first user
      await createTestUser({ phone: '13800138000' });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          phone: '13800138000',
          code: '123456',
          nickname: '另一个用户'
        })
        .expect(400);

      expect(response.body).toMatchObject({
        code: 400,
        message: '手机号已注册',
        error: {
          field: 'phone',
          message: '该手机号已被注册，请直接登录'
        }
      });
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await createTestUser({
        phone: '13800138000',
        password: 'test123456'
      });
    });

    test('should login user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phone: '13800138000',
          password: 'test123456',
          loginType: 'password'
        })
        .expect(200);

      expect(response.body).toMatchObject({
        code: 200,
        message: '登录成功',
        data: {
          phone: '13800138000',
          token: expect.any(String),
          userId: expect.any(String),
          expiresIn: expect.any(String)
        }
      });
    });

    test('should reject login with wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phone: '13800138000',
          password: 'wrongpassword',
          loginType: 'password'
        })
        .expect(400);

      expect(response.body).toMatchObject({
        code: 400,
        message: '密码错误',
        error: {
          field: 'password',
          message: '密码不正确'
        }
      });
    });
  });
});
