const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validate } = require('../middleware/validation');
const Joi = require('joi');

/**
 * @swagger
 * tags:
 *   name: 用户认证
 *   description: 用户注册、登录、验证码等认证相关接口
 */

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

/**
 * @swagger
 * /api/auth/send-code:
 *   post:
 *     summary: 发送验证码
 *     description: 向指定手机号发送验证码
 *     tags: [用户认证]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *                 pattern: '^1[3-9]\\d{9}$'
 *                 description: 手机号码
 *                 example: '13800138000'
 *     responses:
 *       200:
 *         description: 验证码发送成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         message:
 *                           type: string
 *                           example: '验证码已发送'
 *                         expireTime:
 *                           type: integer
 *                           example: 300
 *       400:
 *         description: 请求参数错误
 *       500:
 *         description: 服务器内部错误
 */
// 发送验证码
router.post('/send-code', validate(sendCodeSchema), authController.sendVerificationCode);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: 用户注册
 *     description: 使用手机号和验证码注册新用户
 *     tags: [用户认证]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - code
 *               - nickname
 *               - password
 *             properties:
 *               phone:
 *                 type: string
 *                 pattern: '^1[3-9]\\d{9}$'
 *                 description: 手机号码
 *                 example: '13800138000'
 *               code:
 *                 type: string
 *                 description: 验证码
 *                 example: '123456'
 *               nickname:
 *                 type: string
 *                 maxLength: 50
 *                 description: 用户昵称
 *                 example: '用户昵称'
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: 用户密码
 *                 example: '123456'
 *     responses:
 *       200:
 *         description: 注册成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         token:
 *                           type: string
 *                           description: JWT访问令牌
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *       400:
 *         description: 请求参数错误
 *       409:
 *         description: 用户已存在
 *       500:
 *         description: 服务器内部错误
 */
// 用户注册
router.post('/register', validate(registerSchema), authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: 用户登录
 *     description: 支持验证码登录和密码登录两种方式
 *     tags: [用户认证]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 required: [phone, code]
 *                 properties:
 *                   phone:
 *                     type: string
 *                     pattern: '^1[3-9]\\d{9}$'
 *                     description: 手机号码
 *                     example: '13800138000'
 *                   code:
 *                     type: string
 *                     description: 验证码
 *                     example: '123456'
 *                   loginType:
 *                     type: string
 *                     enum: [code]
 *                     description: 登录类型
 *                     example: 'code'
 *               - type: object
 *                 required: [phone, password]
 *                 properties:
 *                   phone:
 *                     type: string
 *                     pattern: '^1[3-9]\\d{9}$'
 *                     description: 手机号码
 *                     example: '13800138000'
 *                   password:
 *                     type: string
 *                     description: 用户密码
 *                     example: '123456'
 *                   loginType:
 *                     type: string
 *                     enum: [password]
 *                     description: 登录类型
 *                     example: 'password'
 *     responses:
 *       200:
 *         description: 登录成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         token:
 *                           type: string
 *                           description: JWT访问令牌
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 验证码或密码错误
 *       404:
 *         description: 用户不存在
 *       500:
 *         description: 服务器内部错误
 */
// 用户登录
router.post('/login', validate(loginSchema), authController.login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: 用户退出
 *     description: 用户退出登录，使当前令牌失效
 *     tags: [用户认证]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 退出成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         message:
 *                           type: string
 *                           example: '退出成功'
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
// 用户退出登录
router.post('/logout', authController.logout);

module.exports = router;
