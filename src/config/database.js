const mongoose = require('mongoose');
const config = require('./config');

// 连接MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongodb.uri, config.mongodb.options);
    console.log(`✅ MongoDB 连接成功: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB 连接失败: ${error.message}`);
    process.exit(1);
  }
};

// 断开MongoDB连接
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB 连接已断开');
  } catch (error) {
    console.error(`❌ MongoDB 断开连接失败: ${error.message}`);
  }
};

module.exports = {
  connectDB,
  disconnectDB
};
