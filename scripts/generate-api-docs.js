#!/usr/bin/env node

/**
 * API文档生成脚本
 * 用于生成完整的接口文档和Swagger配置
 */

const fs = require('fs');
const path = require('path');

// API接口信息
const apiEndpoints = {
  '用户认证': {
    description: '用户注册、登录、验证码等认证相关接口',
    basePath: '/api/auth',
    endpoints: [
      {
        path: '/send-code',
        method: 'POST',
        summary: '发送验证码',
        description: '向指定手机号发送验证码',
        requestBody: {
          phone: 'string (手机号码)'
        },
        responses: {
          200: '验证码发送成功',
          400: '请求参数错误',
          500: '服务器内部错误'
        }
      },
      {
        path: '/register',
        method: 'POST',
        summary: '用户注册',
        description: '使用手机号和验证码注册新用户',
        requestBody: {
          phone: 'string (手机号码)',
          code: 'string (验证码)',
          nickname: 'string (用户昵称)',
          password: 'string (用户密码)'
        },
        responses: {
          200: '注册成功',
          400: '请求参数错误',
          409: '用户已存在',
          500: '服务器内部错误'
        }
      },
      {
        path: '/login',
        method: 'POST',
        summary: '用户登录',
        description: '支持验证码登录和密码登录两种方式',
        requestBody: {
          phone: 'string (手机号码)',
          code: 'string (验证码) 或 password: string (密码)',
          loginType: 'string (登录类型: code/password)'
        },
        responses: {
          200: '登录成功',
          400: '请求参数错误',
          401: '验证码或密码错误',
          404: '用户不存在',
          500: '服务器内部错误'
        }
      },
      {
        path: '/logout',
        method: 'POST',
        summary: '用户退出',
        description: '用户退出登录，使当前令牌失效',
        security: 'Bearer Token',
        responses: {
          200: '退出成功',
          401: '未授权访问',
          500: '服务器内部错误'
        }
      }
    ]
  },
  '用户管理': {
    description: '用户信息管理、统计等接口',
    basePath: '/api/user',
    endpoints: [
      {
        path: '/profile',
        method: 'GET',
        summary: '获取用户信息',
        description: '获取当前登录用户的详细信息',
        security: 'Bearer Token',
        responses: {
          200: '获取成功',
          401: '未授权访问',
          500: '服务器内部错误'
        }
      },
      {
        path: '/profile',
        method: 'PUT',
        summary: '更新用户信息',
        description: '更新当前登录用户的昵称和头像',
        security: 'Bearer Token',
        requestBody: {
          nickname: 'string (用户昵称, 可选)',
          avatar: 'string (头像URL, 可选)'
        },
        responses: {
          200: '更新成功',
          400: '请求参数错误',
          401: '未授权访问',
          500: '服务器内部错误'
        }
      },
      {
        path: '/stats',
        method: 'GET',
        summary: '获取用户统计数据',
        description: '获取当前登录用户的统计数据',
        security: 'Bearer Token',
        responses: {
          200: '获取成功',
          401: '未授权访问',
          500: '服务器内部错误'
        }
      }
    ]
  },
  '红包监控': {
    description: '应用监听状态、设置管理等接口',
    basePath: '/api/monitoring',
    endpoints: [
      {
        path: '/apps',
        method: 'GET',
        summary: '获取应用监听状态',
        description: '获取所有应用的监听状态和配置信息',
        security: 'Bearer Token',
        responses: {
          200: '获取成功',
          401: '未授权访问',
          500: '服务器内部错误'
        }
      },
      {
        path: '/apps/{appId}/toggle',
        method: 'PUT',
        summary: '切换应用监听状态',
        description: '开启或关闭指定应用的监听',
        security: 'Bearer Token',
        parameters: {
          appId: 'string (应用ID: wechat/alipay/dingtalk/juren)'
        },
        responses: {
          200: '切换成功',
          400: '应用ID无效',
          401: '未授权访问',
          500: '服务器内部错误'
        }
      },
      {
        path: '/apps/{appId}/settings',
        method: 'PUT',
        summary: '更新应用设置',
        description: '更新指定应用的监听设置',
        security: 'Bearer Token',
        parameters: {
          appId: 'string (应用ID)'
        },
        requestBody: {
          settings: {
            autoGrab: 'boolean (是否自动抢红包)',
            minAmount: 'number (最小金额)',
            maxAmount: 'number (最大金额)',
            responseDelay: 'number (响应延迟)'
          }
        },
        responses: {
          200: '更新成功',
          400: '应用ID无效',
          401: '未授权访问',
          500: '服务器内部错误'
        }
      },
      {
        path: '/start',
        method: 'POST',
        summary: '开始监听',
        description: '开启所有应用的监听',
        security: 'Bearer Token',
        responses: {
          200: '开始监听成功',
          401: '未授权访问',
          500: '服务器内部错误'
        }
      },
      {
        path: '/stop',
        method: 'POST',
        summary: '停止监听',
        description: '停止所有应用的监听',
        security: 'Bearer Token',
        responses: {
          200: '停止监听成功',
          401: '未授权访问',
          500: '服务器内部错误'
        }
      },
      {
        path: '/reset-today',
        method: 'POST',
        summary: '重置今日统计',
        description: '重置所有应用的今日统计数据',
        security: 'Bearer Token',
        responses: {
          200: '重置成功',
          401: '未授权访问',
          500: '服务器内部错误'
        }
      }
    ]
  },
  '红包记录': {
    description: '红包记录查询、统计等接口',
    basePath: '/api/redpackets',
    endpoints: [
      {
        path: '/records',
        method: 'GET',
        summary: '获取抢红包记录',
        description: '分页获取用户的抢红包记录',
        security: 'Bearer Token',
        queryParameters: {
          page: 'number (页码, 默认1)',
          size: 'number (每页大小, 默认20)',
          startDate: 'string (开始日期, YYYY-MM-DD)',
          endDate: 'string (结束日期, YYYY-MM-DD)',
          app: 'string (应用类型)',
          group: 'string (群聊名称)',
          status: 'string (状态: success/failed)'
        },
        responses: {
          200: '获取成功',
          401: '未授权访问',
          500: '服务器内部错误'
        }
      },
      {
        path: '/{recordId}',
        method: 'GET',
        summary: '获取红包详情',
        description: '获取指定红包记录的详细信息',
        security: 'Bearer Token',
        parameters: {
          recordId: 'string (记录ID)'
        },
        responses: {
          200: '获取成功',
          404: '记录不存在',
          401: '未授权访问',
          500: '服务器内部错误'
        }
      },
      {
        path: '/stats',
        method: 'GET',
        summary: '获取统计数据',
        description: '获取红包相关的统计数据',
        security: 'Bearer Token',
        queryParameters: {
          period: 'string (统计周期: today/week/month/year)',
          startDate: 'string (开始日期)',
          endDate: 'string (结束日期)'
        },
        responses: {
          200: '获取成功',
          401: '未授权访问',
          500: '服务器内部错误'
        }
      },
      {
        path: '/add',
        method: 'POST',
        summary: '添加红包记录',
        description: '模拟抢红包成功，添加红包记录',
        security: 'Bearer Token',
        requestBody: {
          app: 'string (应用类型)',
          groupName: 'string (群聊名称)',
          groupId: 'string (群聊ID)',
          sender: 'string (发送者)',
          amount: 'number (红包金额)',
          message: 'string (红包消息, 可选)',
          responseTime: 'number (响应时间, 可选)',
          rank: 'number (排名, 可选)'
        },
        responses: {
          200: '添加成功',
          400: '请求参数错误',
          401: '未授权访问',
          500: '服务器内部错误'
        }
      }
    ]
  },
  '策略设置': {
    description: '抢红包策略配置和管理接口',
    basePath: '/api/strategy',
    endpoints: [
      {
        path: '/current',
        method: 'GET',
        summary: '获取当前策略',
        description: '获取用户当前的抢红包策略配置',
        security: 'Bearer Token',
        responses: {
          200: '获取成功',
          401: '未授权访问',
          500: '服务器内部错误'
        }
      },
      {
        path: '/update',
        method: 'PUT',
        summary: '更新策略',
        description: '更新用户的抢红包策略配置',
        security: 'Bearer Token',
        requestBody: {
          isAutoGrabEnabled: 'boolean (是否启用自动抢红包)',
          minAmount: 'number (最小金额)',
          maxAmount: 'number (最大金额)',
          responseDelay: 'number (响应延迟)',
          priorityGroups: 'array (优先群聊)',
          excludedGroups: 'array (排除群聊)',
          timeFilter: 'object (时间过滤)',
          advancedSettings: 'object (高级设置)'
        },
        responses: {
          200: '更新成功',
          400: '请求参数错误',
          401: '未授权访问',
          500: '服务器内部错误'
        }
      },
      {
        path: '/presets',
        method: 'GET',
        summary: '获取策略预设',
        description: '获取系统提供的策略预设模板',
        security: 'Bearer Token',
        responses: {
          200: '获取成功',
          401: '未授权访问',
          500: '服务器内部错误'
        }
      },
      {
        path: '/presets/{presetId}/apply',
        method: 'POST',
        summary: '应用策略预设',
        description: '应用指定的策略预设模板',
        security: 'Bearer Token',
        parameters: {
          presetId: 'string (预设ID: aggressive/balanced/conservative)'
        },
        responses: {
          200: '应用成功',
          400: '预设不存在',
          401: '未授权访问',
          500: '服务器内部错误'
        }
      }
    ]
  },
  '数据分析': {
    description: '收益分析、趋势分析等数据统计接口',
    basePath: '/api/analytics',
    endpoints: [
      {
        path: '/earnings',
        method: 'GET',
        summary: '收益分析',
        description: '获取用户的收益分析数据',
        security: 'Bearer Token',
        queryParameters: {
          period: 'string (分析周期: today/week/month/year)',
          startDate: 'string (开始日期)',
          endDate: 'string (结束日期)'
        },
        responses: {
          200: '获取成功',
          401: '未授权访问',
          500: '服务器内部错误'
        }
      },
      {
        path: '/overview',
        method: 'GET',
        summary: '数据概览',
        description: '获取用户数据的整体概览',
        security: 'Bearer Token',
        responses: {
          200: '获取成功',
          401: '未授权访问',
          500: '服务器内部错误'
        }
      },
      {
        path: '/trends',
        method: 'GET',
        summary: '趋势分析',
        description: '获取用户数据的趋势分析',
        security: 'Bearer Token',
        queryParameters: {
          days: 'number (分析天数, 默认30)'
        },
        responses: {
          200: '获取成功',
          401: '未授权访问',
          500: '服务器内部错误'
        }
      },
      {
        path: '/export',
        method: 'GET',
        summary: '数据导出',
        description: '导出用户的红包记录数据',
        security: 'Bearer Token',
        queryParameters: {
          format: 'string (导出格式: csv/json, 默认csv)',
          startDate: 'string (开始日期)',
          endDate: 'string (结束日期)'
        },
        responses: {
          200: '导出成功',
          401: '未授权访问',
          500: '服务器内部错误'
        }
      }
    ]
  }
};

// 生成Markdown格式的API文档
function generateMarkdownDocs() {
  let markdown = `# 🧧 自动抢红包应用 API 接口文档

## 📋 接口概览

本API提供完整的自动抢红包应用后端服务，包含以下功能模块：

- **用户认证** - 用户注册、登录、验证码等认证相关接口
- **用户管理** - 用户信息管理、统计等接口
- **红包监控** - 应用监听状态、设置管理等接口
- **红包记录** - 红包记录查询、统计等接口
- **策略设置** - 抢红包策略配置和管理接口
- **数据分析** - 收益分析、趋势分析等数据统计接口

## 🔐 认证方式

所有需要认证的接口都使用 **Bearer Token** 认证方式：

\`\`\`http
Authorization: Bearer <your_jwt_token>
\`\`\`

## 📊 响应格式

所有接口都使用统一的响应格式：

\`\`\`json
{
  "code": 200,
  "message": "操作成功",
  "data": {},
  "timestamp": "2024-01-01T00:00:00.000Z"
}
\`\`\`

## 📚 接口详情

`;

  // 遍历所有API模块
  Object.entries(apiEndpoints).forEach(([moduleName, moduleInfo]) => {
    markdown += `### ${moduleName}\n\n`;
    markdown += `${moduleInfo.description}\n\n`;
    markdown += `**基础路径:** \`${moduleInfo.basePath}\`\n\n`;

    // 遍历模块下的所有接口
    moduleInfo.endpoints.forEach(endpoint => {
      markdown += `#### ${endpoint.method} ${endpoint.path}\n\n`;
      markdown += `**描述:** ${endpoint.description}\n\n`;
      markdown += `**摘要:** ${endpoint.summary}\n\n`;

      if (endpoint.security) {
        markdown += `**认证:** ${endpoint.security}\n\n`;
      }

      if (endpoint.parameters) {
        markdown += `**路径参数:**\n`;
        Object.entries(endpoint.parameters).forEach(([key, desc]) => {
          markdown += `- \`${key}\`: ${desc}\n`;
        });
        markdown += '\n';
      }

      if (endpoint.queryParameters) {
        markdown += `**查询参数:**\n`;
        Object.entries(endpoint.queryParameters).forEach(([key, desc]) => {
          markdown += `- \`${key}\`: ${desc}\n`;
        });
        markdown += '\n';
      }

      if (endpoint.requestBody) {
        markdown += `**请求体:**\n`;
        if (typeof endpoint.requestBody === 'object') {
          Object.entries(endpoint.requestBody).forEach(([key, desc]) => {
            markdown += `- \`${key}\`: ${desc}\n`;
          });
        } else {
          markdown += `${endpoint.requestBody}\n`;
        }
        markdown += '\n';
      }

      markdown += `**响应状态:**\n`;
      Object.entries(endpoint.responses).forEach(([code, desc]) => {
        markdown += `- \`${code}\`: ${desc}\n`;
      });
      markdown += '\n---\n\n';
    });
  });

  markdown += `## 🌐 在线文档

访问 [Swagger UI](/api-docs) 查看交互式API文档。

## 📞 技术支持

如有问题，请联系技术支持团队。

---

*最后更新时间: ${new Date().toLocaleString('zh-CN')}*
`;

  return markdown;
}

// 生成API统计信息
function generateApiStats() {
  let totalEndpoints = 0;
  let totalModules = Object.keys(apiEndpoints).length;

  Object.values(apiEndpoints).forEach(module => {
    totalEndpoints += module.endpoints.length;
  });

  return {
    totalModules,
    totalEndpoints,
    modules: Object.keys(apiEndpoints)
  };
}

// 主函数
function main() {
  console.log('🚀 开始生成API文档...');

  // 生成Markdown文档
  const markdown = generateMarkdownDocs();
  
  // 确保scripts目录存在
  const scriptsDir = path.join(__dirname);
  if (!fs.existsSync(scriptsDir)) {
    fs.mkdirSync(scriptsDir, { recursive: true });
  }

  // 写入Markdown文档
  const docsPath = path.join(__dirname, '..', 'API_DOCS.md');
  fs.writeFileSync(docsPath, markdown, 'utf8');
  console.log(`✅ Markdown文档已生成: ${docsPath}`);

  // 生成统计信息
  const stats = generateApiStats();
  console.log('\n📊 API接口统计:');
  console.log(`- 模块数量: ${stats.totalModules}`);
  console.log(`- 接口数量: ${stats.totalEndpoints}`);
  console.log(`- 模块列表: ${stats.modules.join(', ')}`);

  console.log('\n🎉 API文档生成完成！');
  console.log(`📖 查看文档: ${docsPath}`);
  console.log('🌐 在线文档: http://localhost:3000/api-docs');
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  generateMarkdownDocs,
  generateApiStats,
  apiEndpoints
};
