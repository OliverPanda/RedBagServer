#!/usr/bin/env node

/**
 * 环境配置加载器
 * 用于根据 NODE_ENV 加载相应的环境配置文件
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// 获取环境类型
const env = process.env.NODE_ENV || 'development';

// 环境配置文件映射
const envFiles = {
  development: 'env.development',
  test: 'env.test',
  production: 'env.production'
};

// 获取项目根目录
const projectRoot = path.resolve(__dirname, '..');

// 加载环境配置文件
function loadEnvFile() {
  const envFile = envFiles[env];
  
  if (!envFile) {
    console.warn(`⚠️  未知的环境类型: ${env}，使用默认配置`);
    return;
  }

  const envFilePath = path.join(projectRoot, envFile);
  
  if (!fs.existsSync(envFilePath)) {
    console.warn(`⚠️  环境配置文件不存在: ${envFilePath}`);
    console.warn(`💡 请复制 env.example 为 ${envFile} 并根据需要修改`);
    return;
  }

  try {
    // 加载环境变量
    const result = dotenv.config({ path: envFilePath });
    
    if (result.error) {
      console.error(`❌ 加载环境配置文件失败: ${result.error.message}`);
      return;
    }

    console.log(`✅ 已加载 ${env} 环境配置: ${envFilePath}`);
    
    // 显示关键配置信息
    showConfigInfo();
    
  } catch (error) {
    console.error(`❌ 加载环境配置文件时发生错误: ${error.message}`);
  }
}

// 显示配置信息
function showConfigInfo() {
  const config = {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    MONGODB_URI: process.env.MONGODB_URI ? '已设置' : '未设置',
    REDIS_URL: process.env.REDIS_URL ? '已设置' : '未设置',
    JWT_SECRET: process.env.JWT_SECRET ? '已设置' : '未设置',
    LOG_LEVEL: process.env.LOG_LEVEL
  };

  console.log('\n📋 当前环境配置:');
  console.log('─'.repeat(50));
  
  Object.entries(config).forEach(([key, value]) => {
    console.log(`${key.padEnd(20)}: ${value}`);
  });
  
  console.log('─'.repeat(50));
}

// 验证必需的环境变量
function validateRequiredEnvVars() {
  const requiredVars = [
    'NODE_ENV',
    'PORT',
    'JWT_SECRET'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(`⚠️  缺少必需的环境变量: ${missingVars.join(', ')}`);
    return false;
  }

  // 生产环境特殊验证
  if (env === 'production') {
    const productionVars = [
      'MONGODB_URI',
      'REDIS_URL',
      'SMS_API_KEY',
      'SMS_API_SECRET'
    ];

    const missingProductionVars = productionVars.filter(varName => !process.env[varName]);
    
    if (missingProductionVars.length > 0) {
      console.warn(`⚠️  生产环境缺少重要配置: ${missingProductionVars.join(', ')}`);
    }
  }

  return true;
}

// 主函数
function main() {
  console.log(`🚀 正在加载 ${env} 环境配置...\n`);
  
  // 加载环境配置文件
  loadEnvFile();
  
  // 验证环境变量
  const isValid = validateRequiredEnvVars();
  
  if (isValid) {
    console.log('\n✅ 环境配置加载完成！');
  } else {
    console.log('\n⚠️  环境配置存在问题，请检查上述警告信息');
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  loadEnvFile,
  validateRequiredEnvVars
};
