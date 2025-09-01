const Joi = require('joi');

// 通用响应格式
const createResponse = (res, code, message, data = null, error = null) => {
  const response = {
    code,
    message,
    timestamp: new Date().toISOString()
  };

  if (data !== null) {
    response.data = data;
  }

  if (error !== null) {
    response.error = error;
  }

  return res.status(code).json(response);
};

// 验证中间件工厂函数
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      const errorDetails = error.details[0];
      return createResponse(res, 400, '请求参数错误', null, {
        field: errorDetails.path[0],
        message: errorDetails.message
      });
    }

    // 将验证后的数据赋值给req.body
    req.body = value;
    next();
  };
};

// 验证查询参数中间件
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query);
    
    if (error) {
      const errorDetails = error.details[0];
      return createResponse(res, 400, '查询参数错误', null, {
        field: errorDetails.path[0],
        message: errorDetails.message
      });
    }
    
    req.query = value;
    next();
  };
};

// 验证路径参数中间件
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params);
    
    if (error) {
      const errorDetails = error.details[0];
      return createResponse(res, 400, '路径参数错误', null, {
        field: errorDetails.path[0],
        message: errorDetails.message
      });
    }

    req.params = value;
    next();
  };
};

// 通用验证模式
const commonSchemas = {
  // 分页参数
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    size: Joi.number().integer().min(1).max(100).default(20)
  }),

  // 日期范围
  dateRange: Joi.object({
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().min(Joi.ref('startDate'))
  }),

  // 手机号验证
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required(),

  // 验证码
  code: Joi.string().length(6).pattern(/^\d{6}$/).required(),

  // 用户ID
  userId: Joi.string().hex().length(24).required(),

  // 金额
  amount: Joi.number().positive().precision(2).required()
};

module.exports = {
  validate,
  validateQuery,
  validateParams,
  createResponse,
  commonSchemas
};
