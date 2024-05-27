// 测试用户操作相关函数
const { registerUser } = require('./register');
const { loginUser } = require('./login');

const { MongoClient } = require('mongodb');

// MongoDB URI 和数据库名称
const uri = 'mongodb://localhost:27017';//这里改成本地mongodb的url
const dbName = 'COURSE_DB';

// 测试函数
const testUserAction = async () => {
  const client = new MongoClient(uri);

  try {
    // 连接数据库
    await client.connect();
    console.log('已成功连接到数据库');

    // 教师用户注册
    await registerUser('teacher001', 'password123', 'teacher', '200001').catch(console.error);

    // 学生用户注册
    await registerUser('student001', 'password456', 'student', '10001').catch(console.error);

    // 教师用户登录
    await loginUser('teacher001', 'password123').catch(console.error);

  } catch (err) {
    console.error('出现错误:', err);
  } finally {
    // 关闭数据库连接
    await client.close();
  }
};

// 运行测试
testUserAction();