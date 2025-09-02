const User = require('../../../src/models/User');
const bcrypt = require('bcryptjs');

describe('User Model', () => {
  describe('Schema Validation', () => {
    test('should create a valid user with required fields', async () => {
      const userData = {
        phone: '13800138000',
        nickname: '测试用户'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.phone).toBe(userData.phone);
      expect(savedUser.nickname).toBe(userData.nickname);
      expect(savedUser.totalEarnings).toBe(0);
      expect(savedUser.todayEarnings).toBe(0);
      expect(savedUser.redPacketCount).toBe(0);
      expect(savedUser.successRate).toBe(0);
      expect(savedUser.isActive).toBe(true);
      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
    });

    test('should require phone field', async () => {
      const user = new User({ nickname: '测试用户' });
      
      try {
        await user.save();
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.errors.phone).toBeDefined();
      }
    });

    test('should validate phone format', async () => {
      const user = new User({ 
        phone: '12345678901', // 无效格式
        nickname: '测试用户' 
      });
      
      try {
        await user.save();
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.errors.phone).toBeDefined();
      }
    });

    test('should enforce unique phone constraint', async () => {
      const userData = {
        phone: '13800138000',
        nickname: '测试用户1'
      };

      await new User(userData).save();

      const duplicateUser = new User({
        phone: '13800138000',
        nickname: '测试用户2'
      });

      try {
        await duplicateUser.save();
        fail('Should have thrown duplicate key error');
      } catch (error) {
        expect(error.code).toBe(11000);
      }
    });

    test('should limit nickname length', async () => {
      const longNickname = 'a'.repeat(51); // 超过50字符限制
      const user = new User({
        phone: '13800138001',
        nickname: longNickname
      });

      try {
        await user.save();
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.errors.nickname).toBeDefined();
      }
    });

    test('should enforce password minimum length', async () => {
      const user = new User({
        phone: '13800138002',
        nickname: '测试用户',
        password: '12345' // 少于6字符
      });

      try {
        await user.save();
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.errors.password).toBeDefined();
      }
    });

    test('should enforce non-negative values for numeric fields', async () => {
      const user = new User({
        phone: '13800138003',
        nickname: '测试用户',
        totalEarnings: -100,
        todayEarnings: -50,
        redPacketCount: -1,
        successRate: -10
      });

      try {
        await user.save();
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.errors.totalEarnings).toBeDefined();
        expect(error.errors.todayEarnings).toBeDefined();
        expect(error.errors.redPacketCount).toBeDefined();
        expect(error.errors.successRate).toBeDefined();
      }
    });

    test('should enforce success rate maximum value', async () => {
      const user = new User({
        phone: '13800138004',
        nickname: '测试用户',
        successRate: 150 // 超过100%
      });

      try {
        await user.save();
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.errors.successRate).toBeDefined();
      }
    });
  });

  describe('Password Hashing', () => {
    test('should hash password before saving', async () => {
      const userData = {
        phone: '13800138005',
        nickname: '测试用户',
        password: 'testpassword123'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.password).not.toBe(userData.password);
      expect(savedUser.password).toMatch(/^\$2[aby]\$\d{1,2}\$[./A-Za-z0-9]{53}$/);
    });

    test('should not hash password if unchanged', async () => {
      const user = new User({
        phone: '13800138006',
        nickname: '测试用户',
        password: 'testpassword123'
      });

      const savedUser = await user.save();
      const originalHash = savedUser.password;

      // 修改非密码字段
      savedUser.nickname = '新昵称';
      await savedUser.save();

      expect(savedUser.password).toBe(originalHash);
    });

    test('should hash new password when updated', async () => {
      const user = new User({
        phone: '13800138007',
        nickname: '测试用户',
        password: 'oldpassword123'
      });

      const savedUser = await user.save();
      const originalHash = savedUser.password;

      // 修改密码
      savedUser.password = 'newpassword123';
      await savedUser.save();

      expect(savedUser.password).not.toBe(originalHash);
      expect(savedUser.password).not.toBe('newpassword123');
    });
  });

  describe('Instance Methods', () => {
    test('should compare password correctly', async () => {
      const user = new User({
        phone: '13800138008',
        nickname: '测试用户',
        password: 'testpassword123'
      });

      await user.save();

      const isCorrect = await user.comparePassword('testpassword123');
      const isWrong = await user.comparePassword('wrongpassword');

      expect(isCorrect).toBe(true);
      expect(isWrong).toBe(false);
    });

    test('should update today earnings correctly', async () => {
      const user = new User({
        phone: '13800138009',
        nickname: '测试用户',
        totalEarnings: 100,
        todayEarnings: 50,
        redPacketCount: 5
      });

      await user.save();

      await user.updateTodayEarnings(25);

      expect(user.totalEarnings).toBe(125);
      expect(user.todayEarnings).toBe(75);
      expect(user.redPacketCount).toBe(6);
    });

    test('should reset today earnings correctly', async () => {
      const user = new User({
        phone: '13800138010',
        nickname: '测试用户',
        todayEarnings: 100
      });

      await user.save();

      await user.resetTodayEarnings();

      expect(user.todayEarnings).toBe(0);
    });

    test('should calculate success rate correctly', async () => {
      const user = new User({
        phone: '13800138011',
        nickname: '测试用户',
        successRate: 0
      });

      await user.save();

      // 测试成功率为0的情况
      await user.calculateSuccessRate(0, 0);
      expect(user.successRate).toBe(0);

      // 测试成功率为50%的情况
      await user.calculateSuccessRate(5, 10);
      expect(user.successRate).toBe(50);

      // 测试成功率为33.3%的情况（四舍五入到一位小数）
      await user.calculateSuccessRate(1, 3);
      expect(user.successRate).toBe(33.3);
    });
  });

  describe('Timestamps', () => {
    test('should set timestamps automatically', async () => {
      const user = new User({
        phone: '13800138012',
        nickname: '测试用户'
      });

      const now = new Date();
      await user.save();

      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
      expect(user.createdAt.getTime()).toBeCloseTo(now.getTime(), -2);
      expect(user.updatedAt.getTime()).toBeCloseTo(now.getTime(), -2);
    });

    test('should update updatedAt on save', async () => {
      const user = new User({
        phone: '13800138013',
        nickname: '测试用户'
      });

      await user.save();
      const originalUpdatedAt = user.updatedAt;

      // 等待一小段时间确保时间戳不同
      await new Promise(resolve => setTimeout(resolve, 10));

      user.nickname = '新昵称';
      await user.save();

      expect(user.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
});
