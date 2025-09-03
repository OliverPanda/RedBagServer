const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');
const { createResponse } = require('../middleware/validation');
const { generateAccessToken, generateRefreshToken } = require('../middleware/tokenRefresh');

// 生成JWT令牌（保持向后兼容）
const generateToken = (userId) => {
  return generateAccessToken(userId);
};

// 发送验证码
const sendVerificationCode = async (req, res) => {
  try {
    const { phone, type } = req.body;

    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return createResponse(res, 400, '手机号格式不正确', null, {
        field: 'phone',
        message: '请输入正确的手机号码'
      });
    }

    // 验证验证码类型
    const validTypes = ['register', 'login', 'reset'];
    if (!validTypes.includes(type)) {
      return createResponse(res, 400, '验证码类型不正确', null, {
        field: 'type',
        message: '验证码类型必须是 register、login 或 reset 之一'
      });
    }

    // TODO: 集成短信服务发送验证码
    // 这里模拟发送验证码，实际项目中需要集成真实的短信服务
    
    // 生成6位随机验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 将验证码存储到Redis或内存中（设置5分钟过期）
    // TODO: 实现验证码存储和验证逻辑
    
    console.log(`向手机号 ${phone} 发送验证码: ${code} (类型: ${type})`);

    return createResponse(res, 200, '验证码发送成功', {
      expiresIn: 300,
      message: '验证码已发送到您的手机，5分钟内有效'
    });

  } catch (error) {
    console.error('发送验证码错误:', error);
    return createResponse(res, 500, '服务器内部错误', null, {
      field: 'server',
      message: '发送验证码失败，请稍后重试'
    });
  }
};

// 用户注册
const register = async (req, res) => {
  try {
    const { phone, code, nickname, password } = req.body;

    // 验证验证码（实际项目中需要从Redis或数据库验证）
    // TODO: 实现验证码验证逻辑
    if (code !== '123456') { // 临时使用固定验证码
      return createResponse(res, 400, '验证码错误', null, {
        field: 'code',
        message: '验证码不正确或已过期'
      });
    }

    // 检查手机号是否已注册
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return createResponse(res, 400, '手机号已注册', null, {
        field: 'phone',
        message: '该手机号已被注册，请直接登录'
      });
    }

    // 创建新用户
    const userData = {
      phone,
      nickname: nickname || `用户${phone.slice(-4)}`
    };

    // 如果提供了密码，则添加密码字段
    if (password) {
      userData.password = password;
    }

    const user = new User(userData);
    await user.save();

    // 生成JWT令牌
    const token = generateToken(user._id);

    // 更新最后登录时间
    user.lastLoginAt = new Date();
    await user.save();

    // 生成刷新token
    const refreshToken = generateRefreshToken(user._id);

    return createResponse(res, 200, '注册成功', {
      userId: user._id,
      phone: user.phone,
      nickname: user.nickname,
      token,
      refreshToken,
      expiresIn: config.jwt.expiresIn
    });

  } catch (error) {
    console.error('用户注册错误:', error);
    
    if (error.code === 11000) {
      return createResponse(res, 400, '手机号已注册', null, {
        field: 'phone',
        message: '该手机号已被注册，请直接登录'
      });
    }

    return createResponse(res, 500, '服务器内部错误', null, {
      field: 'server',
      message: '注册失败，请稍后重试'
    });
  }
};

// 用户登录
const login = async (req, res) => {
  try {
    const { phone, code, password, loginType } = req.body;

    // 验证登录类型
    if (!['code', 'password'].includes(loginType)) {
      return createResponse(res, 400, '登录类型不正确', null, {
        field: 'loginType',
        message: '登录类型必须是 code 或 password'
      });
    }

    // 查找用户
    const user = await User.findOne({ phone });
    if (!user) {
      return createResponse(res, 400, '用户不存在', null, {
        field: 'phone',
        message: '该手机号未注册，请先注册'
      });
    }

    if (!user.isActive) {
      return createResponse(res, 403, '账户已被禁用', null, {
        field: 'account',
        message: '您的账户已被禁用，请联系管理员'
        });
    }

    let isValidLogin = false;

    if (loginType === 'code') {
      // 验证码登录
      if (!code) {
        return createResponse(res, 400, '验证码不能为空', null, {
          field: 'code',
          message: '请输入验证码'
        });
      }

      // TODO: 验证验证码
      if (code !== '123456') { // 临时使用固定验证码
        return createResponse(res, 400, '验证码错误', null, {
          field: 'code',
          message: '验证码不正确或已过期'
        });
      }

      isValidLogin = true;
    } else if (loginType === 'password') {
      // 密码登录
      if (!password) {
        return createResponse(res, 400, '密码不能为空', null, {
          field: 'password',
          message: '请输入密码'
        });
      }

      if (!user.password) {
        return createResponse(res, 400, '该账户未设置密码', null, {
          field: 'password',
          message: '该账户未设置密码，请使用验证码登录'
        });
      }

      // 验证密码
      isValidLogin = await user.comparePassword(password);
      if (!isValidLogin) {
        return createResponse(res, 400, '密码错误', null, {
          field: 'password',
          message: '密码不正确'
        });
      }
    }

    if (!isValidLogin) {
      return createResponse(res, 400, '登录验证失败', null, {
        field: 'login',
        message: '登录验证失败，请检查输入信息'
      });
    }

    // 生成JWT令牌
    const token = generateToken(user._id);

    // 更新最后登录时间
    user.lastLoginAt = new Date();
    await user.save();

    // 生成刷新token
    const refreshToken = generateRefreshToken(user._id);

    return createResponse(res, 200, '登录成功', {
      userId: user._id,
      phone: user.phone,
      nickname: user.nickname,
      token,
      refreshToken,
      expiresIn: config.jwt.expiresIn
    });

  } catch (error) {
    console.error('用户登录错误:', error);
    return createResponse(res, 500, '服务器内部错误', null, {
      field: 'server',
      message: '登录失败，请稍后重试'
    });
  }
};

// 用户退出登录
const logout = async (req, res) => {
  try {
    // TODO: 实现令牌黑名单机制
    // 可以将令牌添加到Redis黑名单中
    
    return createResponse(res, 200, '退出登录成功');
  } catch (error) {
    console.error('退出登录错误:', error);
    return createResponse(res, 500, '服务器内部错误', null, {
      field: 'server',
      message: '退出登录失败，请稍后重试'
    });
  }
};

module.exports = {
  sendVerificationCode,
  register,
  login,
  logout
};
