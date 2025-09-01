const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '🧧 自动抢红包应用 API',
      version: '1.0.0',
      description: '基于Express.js + MongoDB的智能自动抢红包应用后端服务API文档',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: '开发环境'
      },
      {
        url: 'https://yourdomain.com',
        description: '生产环境'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: '在请求头中添加: Authorization: Bearer <token>'
        }
      },
      schemas: {
        // 通用响应格式
        ApiResponse: {
          type: 'object',
          properties: {
            code: {
              type: 'integer',
              description: '响应状态码',
              example: 200
            },
            message: {
              type: 'string',
              description: '响应消息',
              example: '操作成功'
            },
            data: {
              description: '响应数据'
            },
            error: {
              type: 'object',
              properties: {
                field: {
                  type: 'string',
                  description: '错误字段'
                },
                message: {
                  type: 'string',
                  description: '错误消息'
                }
              }
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: '响应时间戳'
            }
          }
        },
        // 分页响应格式
        PaginatedResponse: {
          type: 'object',
          properties: {
            records: {
              type: 'array',
              description: '数据记录列表'
            },
            pagination: {
              type: 'object',
              properties: {
                page: {
                  type: 'integer',
                  description: '当前页码'
                },
                size: {
                  type: 'integer',
                  description: '每页大小'
                },
                total: {
                  type: 'integer',
                  description: '总记录数'
                },
                totalPages: {
                  type: 'integer',
                  description: '总页数'
                }
              }
            }
          }
        },
        // 用户模型
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: '用户ID'
            },
            phone: {
              type: 'string',
              description: '手机号（脱敏）',
              example: '138****8888'
            },
            nickname: {
              type: 'string',
              description: '昵称',
              example: '用户昵称'
            },
            avatar: {
              type: 'string',
              description: '头像URL',
              example: 'https://example.com/avatar.jpg'
            },
            totalEarnings: {
              type: 'number',
              description: '总收益',
              example: 100.50
            },
            todayEarnings: {
              type: 'number',
              description: '今日收益',
              example: 25.80
            },
            redPacketCount: {
              type: 'integer',
              description: '红包数量',
              example: 50
            },
            successRate: {
              type: 'number',
              description: '成功率',
              example: 85.5
            }
          }
        },
        // 红包记录模型
        RedPacketRecord: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: '记录ID'
            },
            amount: {
              type: 'number',
              description: '红包金额',
              example: 8.88
            },
            time: {
              type: 'string',
              format: 'date-time',
              description: '抢红包时间'
            },
            group: {
              type: 'string',
              description: '群聊名称',
              example: '工作群'
            },
            sender: {
              type: 'string',
              description: '发送者',
              example: '张三'
            },
            message: {
              type: 'string',
              description: '红包消息',
              example: '恭喜发财'
            },
            status: {
              type: 'string',
              enum: ['success', 'failed'],
              description: '抢红包状态'
            },
            app: {
              type: 'string',
              enum: ['wechat', 'alipay', 'dingtalk', 'juren'],
              description: '应用类型'
            },
            responseTime: {
              type: 'number',
              description: '响应时间（秒）',
              example: 0.15
            },
            rank: {
              type: 'integer',
              description: '抢红包排名',
              example: 3
            }
          }
        },
        // 监控应用模型
        MonitoringApp: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: '应用ID',
              example: 'wechat'
            },
            name: {
              type: 'string',
              description: '应用名称',
              example: '微信'
            },
            icon: {
              type: 'string',
              description: '应用图标',
              example: '💬'
            },
            isMonitoring: {
              type: 'boolean',
              description: '是否正在监听',
              example: true
            },
            lastRedPacket: {
              type: 'object',
              description: '最后一个红包信息',
              nullable: true
            },
            todayCount: {
              type: 'integer',
              description: '今日红包数量',
              example: 15
            },
            totalEarnings: {
              type: 'number',
              description: '总收益',
              example: 200.50
            },
            settings: {
              type: 'object',
              properties: {
                autoGrab: {
                  type: 'boolean',
                  description: '是否自动抢红包',
                  example: true
                },
                minAmount: {
                  type: 'number',
                  description: '最小金额',
                  example: 0.01
                },
                maxAmount: {
                  type: 'number',
                  description: '最大金额',
                  example: 1000
                },
                responseDelay: {
                  type: 'number',
                  description: '响应延迟（秒）',
                  example: 0.1
                }
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
    './src/models/*.js'
  ]
};

const specs = swaggerJsdoc(options);

module.exports = specs;
