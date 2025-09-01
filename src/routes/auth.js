const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validate } = require('../middleware/validation');
const Joi = require('joi');

// 验证码发送验证模式
const sendCodeSchema = Joi.object({
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required().messages({
    'string.pattern.base': '手机号格式不正确',
    'any.required': '手机号不能为空'
  }),
  type: Joi.string().valid('register', 'login', 'reset').required().messages({
    'any.only': '验证码类型必须是 register、login 或 reset 之一',
    'any.required': '验证码类型不能为空'
  })
});

// 用户注册验证模式
const registerSchema = Joi.object({
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required().messages({
    'string.pattern.base': '手机号格式不正确',
    'any.required': '手机号不能为空'
  }),
  code: Joi.string().length(6).pattern(/^\d{6}$/).required().messages({
    'string.pattern.base': '验证码格式不正确',
    'string.length': '验证码必须是6位数字',
    'any.required': '验证码不能为空'
  }),
  nickname: Joi.string().max(50).optional().messages({
    'string.max': '昵称不能超过50个字符'
  }),
  password: Joi.string().min(6).optional().messages({
    'string.min': '密码不能少于6个字符'
  })
});

// 用户登录验证模式
const loginSchema = Joi.object({
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required().messages({
    'string.pattern.base': '手机号格式不正确',
    'any.required': '手机号不能为空'
  }),
  code: Joi.string().length(6).pattern(/^\d{6}$/).when('loginType', {
    is: 'code',
    then: Joi.required(),
    otherwise: Joi.optional()
  }).messages({
    'string.pattern.base': '验证码格式不正确',
    'string.length': '验证码必须是6位数字',
    'any.required': '验证码不能为空'
  }),
  password: Joi.string().when('loginType', {
    is: 'password',
    then: Joi.required(),
    otherwise: Joi.optional()
    }).messages({
    'any.required': '密码不能为空'
  }),
  loginType: Joi.string().valid('code', 'password').required().messages({
    'any.only': '登录类型必须是 code 或 password',
    'any.required': '登录类型不能为空'
  })
});

// 发送验证码
router.post('/send-code', validate(sendCodeSchema), authController.sendVerificationCode);

// 用户注册
router.post('/register', validate(registerSchema), authController.register);

// 用户登录
router.post('/login', validate(loginSchema), authController.login);

// 用户退出登录
router.post('/logout', authController.logout);

module.exports = router;
