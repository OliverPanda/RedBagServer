#!/usr/bin/env node

/**
 * 环境配置管理脚本
 * 用于快速设置不同环境的配置文件
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 创建命令行交互接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 获取项目根目录
const projectRoot = path.resolve(__dirname, '..');

// 环境配置模板
const envTemplates = {
  development: {
    name: '开发环境',
    description: '本地开发环境配置',
    port: 3000,
    database: 'mongodb://localhost:27017/redbag_dev',
    redis: 'redis://localhost:6379',
    jwtSecret: 'dev_jwt_secret_key_for_development_only',
    logLevel: 'debug'
  },
  test: {
    name: '测试环境',
    description: '测试环境配置',
    port: 3001,
    database: 'mongodb://localhost:27017/redbag_test',
    redis: 'redis://localhost:6379',
    jwtSecret: 'test-secret-key-for-testing-only',
    logLevel: 'warn'
  },
  production: {
    name: '生产环境',
    description: '生产环境配置',
    port: 3000,
    database: 'mongodb://username:password@your-mongodb-host:27017/redbag_production',
    redis: 'redis://username:password@your-redis-host:6379',
    jwtSecret: 'your_production_jwt_secret_key_must_be_at_least_64_characters_long_and_random',
    logLevel: 'info'
  }
};

// 询问用户输入
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// 生成环境配置文件内容
function generateEnvContent(env, customConfig = {}) {
  const template = envTemplates[env];
  const config = { ...template, ...customConfig };

  return `# ========================================
# ${template.name}配置文件
# ========================================
# 此文件用于${template.description}

# ========================================
# 基础环境配置
# ========================================
NODE_ENV=${env}
PORT=${config.port}

# ========================================
# 数据库配置
# ========================================
MONGODB_URI=${config.database}

# MongoDB 连接选项
MONGODB_OPTIONS_USE_NEW_URL_PARSER=true
MONGODB_OPTIONS_USE_UNIFIED_TOPOLOGY=true

# ========================================
# Redis 配置
# ========================================
REDIS_URL=${config.redis}
REDIS_PASSWORD=

# ========================================
# JWT 配置
# ========================================
JWT_SECRET=${config.jwtSecret}
JWT_EXPIRES_IN=7200

# ========================================
# 短信服务配置
# ========================================
SMS_API_KEY=your_sms_api_key
SMS_API_SECRET=your_sms_api_secret

# ========================================
# 推送通知配置
# ========================================
PUSH_NOTIFICATION_KEY=your_push_key

# ========================================
# 文件上传配置
# ========================================
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# ========================================
# 限流配置
# ========================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ========================================
# 日志配置
# ========================================
LOG_LEVEL=${config.logLevel}
LOG_FILE_PATH=./logs

# ========================================
# 安全配置
# ========================================
CORS_ORIGIN=http://localhost:${config.port}
SESSION_SECRET=your_session_secret_key

# ========================================
# 监控配置
# ========================================
HEALTH_CHECK_ENABLED=true
HEALTH_CHECK_PORT=${config.port + 1}

# ========================================
# 开发工具配置
# ========================================
SWAGGER_ENABLED=${env === 'development'}
DEBUG=${env === 'development'}

# ========================================
# 环境专用配置
# ========================================
# 请根据实际需要修改以上配置
`;
}

// 创建环境配置文件
function createEnvFile(env, customConfig = {}) {
  const envFileName = `env.${env}`;
  const envFilePath = path.join(projectRoot, envFileName);
  
  try {
    const content = generateEnvContent(env, customConfig);
    fs.writeFileSync(envFilePath, content, 'utf8');
    
    console.log(`✅ 已创建 ${envFileName} 文件`);
    return true;
  } catch (error) {
    console.error(`❌ 创建 ${envFileName} 文件失败: ${error.message}`);
    return false;
  }
}

// 显示环境配置选项
function showEnvOptions() {
  console.log('\n📋 可用的环境配置:');
  console.log('─'.repeat(60));
  
  Object.entries(envTemplates).forEach(([key, template]) => {
    console.log(`${key.padEnd(15)}: ${template.name} - ${template.description}`);
  });
  
  console.log('─'.repeat(60));
}

// 交互式配置创建
async function interactiveSetup() {
  console.log('🚀 环境配置设置向导\n');
  
  showEnvOptions();
  
  // 选择环境
  const env = await askQuestion('\n请选择要配置的环境 (development/test/production): ');
  
  if (!envTemplates[env]) {
    console.log('❌ 无效的环境类型，请选择 development、test 或 production');
    rl.close();
    return;
  }

  console.log(`\n📝 正在配置 ${envTemplates[env].name}...\n`);

  // 自定义配置
  const customConfig = {};
  
  if (env === 'production') {
    console.log('⚠️  生产环境配置需要特别注意安全性！\n');
    
    const customPort = await askQuestion(`端口号 (默认: ${envTemplates[env].port}): `);
    if (customPort) customConfig.port = parseInt(customPort);
    
    const customDb = await askQuestion(`MongoDB 连接字符串 (默认: ${envTemplates[env].database}): `);
    if (customDb) customConfig.database = customDb;
    
    const customRedis = await askQuestion(`Redis 连接字符串 (默认: ${envTemplates[env].redis}): `);
    if (customRedis) customConfig.redis = customRedis;
    
    const customJwtSecret = await askQuestion('JWT 密钥 (建议至少64位随机字符): ');
    if (customJwtSecret) customConfig.jwtSecret = customJwtSecret;
  }

  // 创建配置文件
  const success = createEnvFile(env, customConfig);
  
  if (success) {
    console.log(`\n🎉 ${envTemplates[env].name} 配置完成！`);
    console.log(`📁 配置文件: env.${env}`);
    console.log('\n💡 下一步:');
    console.log(`   1. 检查并修改 env.${env} 文件中的配置`);
    console.log('   2. 运行 npm run start:dev 启动开发服务器');
    console.log('   3. 运行 npm test 执行测试');
  }
}

// 批量创建所有环境配置
function createAllEnvFiles() {
  console.log('🚀 正在创建所有环境配置文件...\n');
  
  let successCount = 0;
  const totalCount = Object.keys(envTemplates).length;
  
  Object.keys(envTemplates).forEach(env => {
    if (createEnvFile(env)) {
      successCount++;
    }
  });
  
  console.log(`\n📊 创建结果: ${successCount}/${totalCount} 个文件创建成功`);
  
  if (successCount === totalCount) {
    console.log('\n🎉 所有环境配置文件创建完成！');
    console.log('\n💡 下一步:');
    console.log('   1. 检查并修改各环境配置文件');
    console.log('   2. 根据实际环境修改数据库连接等信息');
    console.log('   3. 生产环境务必修改所有默认密钥！');
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--all') || args.includes('-a')) {
    createAllEnvFiles();
  } else if (args.includes('--help') || args.includes('-h')) {
    console.log('环境配置管理脚本\n');
    console.log('用法:');
    console.log('  node scripts/setup-env.js          # 交互式配置');
    console.log('  node scripts/setup-env.js --all    # 创建所有环境配置');
    console.log('  node scripts/setup-env.js --help   # 显示帮助信息');
  } else {
    await interactiveSetup();
  }
  
  rl.close();
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  createEnvFile,
  generateEnvContent,
  envTemplates
};
