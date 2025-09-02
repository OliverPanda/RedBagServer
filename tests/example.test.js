/**
 * 示例测试文件 - 演示如何编写测试
 * 这个文件展示了基本的测试结构和常用断言
 */

describe('示例测试套件', () => {
  // 在所有测试开始前运行一次
  beforeAll(() => {
    console.log('🚀 开始运行示例测试');
  });

  // 在每个测试开始前运行
  beforeEach(() => {
    console.log('📝 准备运行测试...');
  });

  // 在每个测试结束后运行
  afterEach(() => {
    console.log('✅ 测试完成');
  });

  // 在所有测试结束后运行一次
  afterAll(() => {
    console.log('🎉 所有示例测试完成');
  });

  describe('基础断言测试', () => {
    test('应该正确进行相等性比较', () => {
      expect(2 + 2).toBe(4);
      expect('hello' + ' world').toBe('hello world');
      expect([1, 2, 3]).toEqual([1, 2, 3]);
    });

    test('应该正确进行类型检查', () => {
      expect(typeof 'string').toBe('string');
      expect(typeof 42).toBe('number');
      expect(typeof true).toBe('boolean');
      expect(typeof {}).toBe('object');
      expect(typeof []).toBe('object'); // 注意：数组在JS中也是对象
    });

    test('应该正确进行真值检查', () => {
      expect(true).toBeTruthy();
      expect(false).toBeFalsy();
      expect(0).toBeFalsy();
      expect('').toBeFalsy();
      expect(null).toBeFalsy();
      expect(undefined).toBeFalsy();
    });
  });

  describe('数组和对象测试', () => {
    test('应该正确测试数组', () => {
      const fruits = ['apple', 'banana', 'orange'];
      
      expect(fruits).toHaveLength(3);
      expect(fruits).toContain('banana');
      expect(fruits[0]).toBe('apple');
      expect(Array.isArray(fruits)).toBe(true);
    });

    test('应该正确测试对象', () => {
      const person = {
        name: '张三',
        age: 25,
        city: '北京'
      };

      expect(person).toHaveProperty('name');
      expect(person.name).toBe('张三');
      expect(person.age).toBeGreaterThan(20);
      expect(person.age).toBeLessThan(30);
    });
  });

  describe('异步测试', () => {
    test('应该正确处理Promise', async () => {
      const asyncFunction = () => {
        return new Promise((resolve) => {
          setTimeout(() => resolve('success'), 100);
        });
      };

      const result = await asyncFunction();
      expect(result).toBe('success');
    });

    test('应该正确处理异步错误', async () => {
      const asyncErrorFunction = () => {
        return new Promise((resolve, reject) => {
          setTimeout(() => reject(new Error('test error')), 100);
        });
      };

      await expect(asyncErrorFunction()).rejects.toThrow('test error');
    });
  });

  describe('异常测试', () => {
    test('应该正确捕获异常', () => {
      const throwError = () => {
        throw new Error('这是一个测试错误');
      };

      expect(throwError).toThrow();
      expect(throwError).toThrow('这是一个测试错误');
      expect(throwError).toThrow(Error);
    });

    test('应该正确处理不抛异常的代码', () => {
      const noError = () => {
        return 'no error';
      };

      expect(noError).not.toThrow();
    });
  });

  describe('正则表达式测试', () => {
    test('应该正确匹配正则表达式', () => {
      const phoneRegex = /^1[3-9]\d{9}$/;
      
      expect('13800138000').toMatch(phoneRegex);
      expect('12345678901').not.toMatch(phoneRegex);
      expect('1380013800').not.toMatch(phoneRegex);
      expect('138001380000').not.toMatch(phoneRegex);
    });
  });

  describe('数值比较测试', () => {
    test('应该正确进行数值比较', () => {
      const value = 10;
      
      expect(value).toBeGreaterThan(5);
      expect(value).toBeLessThan(20);
      expect(value).toBeGreaterThanOrEqual(10);
      expect(value).toBeLessThanOrEqual(10);
      expect(value).toBeCloseTo(10.1, 0); // 允许0位小数的误差
    });
  });

  describe('模拟函数测试', () => {
    test('应该正确使用模拟函数', () => {
      const mockFunction = jest.fn();
      
      mockFunction('test');
      mockFunction('another test');
      
      expect(mockFunction).toHaveBeenCalledTimes(2);
      expect(mockFunction).toHaveBeenCalledWith('test');
      expect(mockFunction).toHaveBeenCalledWith('another test');
    });

    test('应该正确模拟返回值', () => {
      const mockFunction = jest.fn().mockReturnValue('mocked value');
      
      const result = mockFunction();
      
      expect(result).toBe('mocked value');
      expect(mockFunction).toHaveBeenCalledTimes(1);
    });
  });

  describe('条件测试', () => {
    test('应该根据条件跳过测试', () => {
      const shouldSkip = process.env.SKIP_TEST === 'true';
      
      if (shouldSkip) {
        expect(true).toBe(false);
      } else {
        expect(true).toBe(true);
      }
    });

    test('应该根据条件运行特定测试', () => {
      const isProduction = process.env.NODE_ENV === 'production';
      
      if (isProduction) {
        expect(process.env.NODE_ENV).toBe('production');
      } else {
        expect(process.env.NODE_ENV).not.toBe('production');
      }
    });
  });
});

// 测试超时设置示例
describe('超时测试示例', () => {
  test('应该正确处理长时间运行的操作', async () => {
    // 模拟一个需要时间的操作
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(true).toBe(true);
  }, 5000); // 5秒超时
});

// 测试分组和嵌套示例
describe('高级测试结构', () => {
  describe('用户管理', () => {
    describe('创建用户', () => {
      test('应该创建有效用户', () => {
        expect(true).toBe(true);
      });

      test('应该拒绝无效数据', () => {
        expect(true).toBe(true);
      });
    });

    describe('更新用户', () => {
      test('应该更新用户信息', () => {
        expect(true).toBe(true);
      });

      test('应该验证更新权限', () => {
        expect(true).toBe(true);
      });
    });
  });

  describe('红包管理', () => {
    describe('发送红包', () => {
      test('应该成功发送红包', () => {
        expect(true).toBe(true);
      });

      test('应该验证余额', () => {
        expect(true).toBe(true);
      });
    });

    describe('抢红包', () => {
      test('应该成功抢到红包', () => {
        expect(true).toBe(true);
      });

      test('应该处理并发情况', () => {
        expect(true).toBe(true);
      });
    });
  });
});
