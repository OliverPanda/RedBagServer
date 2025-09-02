const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongod;

// 在所有测试开始前启动内存数据库
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

// 每个测试后清理数据库
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});

// 所有测试结束后关闭连接
afterAll(async () => {
  await mongoose.connection.close();
  await mongod.stop();
});

// 全局测试超时设置
jest.setTimeout(30000);

// 模拟环境变量
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '1h';
process.env.REDIS_URL = 'redis://localhost:6379';

// 抑制控制台输出（可选）
if (process.env.NODE_ENV === 'test') {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
}
