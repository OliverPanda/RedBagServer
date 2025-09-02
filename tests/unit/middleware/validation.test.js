const { validate, validateQuery, validateParams, createResponse } = require('../../../src/middleware/validation');
const Joi = require('joi');

describe('Validation Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      body: {},
      query: {},
      params: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
  });

  describe('createResponse', () => {
    test('should create success response with data', () => {
      const response = createResponse(mockRes, 200, 'Success', { id: 1 });
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        code: 200,
        message: 'Success',
        data: { id: 1 },
        timestamp: expect.any(String)
      });
    });

    test('should create error response with error details', () => {
      const error = { field: 'email', message: 'Invalid email' };
      const response = createResponse(mockRes, 400, 'Bad Request', null, error);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        code: 400,
        message: 'Bad Request',
        error: error,
        timestamp: expect.any(String)
      });
    });
  });

  describe('validate middleware', () => {
    const testSchema = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required()
    });

    test('should pass validation for valid data', () => {
      mockReq.body = {
        name: 'Test User',
        email: 'test@example.com'
      };

      const middleware = validate(testSchema);
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.body).toEqual({
        name: 'Test User',
        email: 'test@example.com'
      });
    });

    test('should return error for invalid data', () => {
      mockReq.body = {
        name: 'Test User'
        // missing email
      };

      const middleware = validate(testSchema);
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        code: 400,
        message: '请求参数错误',
        error: {
          field: 'email',
          message: '"email" is required'
        },
        timestamp: expect.any(String)
      });
    });
  });
});
