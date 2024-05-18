// 测试search函数的有效性
const { MongoClient } = require('mongodb');
const searchAllCourse = require('./search_function');

// MongoDB URI 和数据库名称
const uri = 'mongodb://localhost:27017';
const dbName = 'COURSE_DB';

// 测试函数
const testsearchAllCourse = async () => {
  const client = new MongoClient(uri);

  try {
    // 连接数据库
    await client.connect();
    console.log('已成功连接到数据库');

    const db = client.db(dbName);

    // 定义测试输入
    const keyword = '大学物理';
    const modules = ['all'];
    console.log('关键词:', keyword);
    console.log('约束条件:', modules);
    // 执行搜索
    const results = await searchAllCourse(db, keyword, modules);

    // 输出结果
    //console.log('检索结果:', results);
    //console.log('检索结果:', JSON.stringify(results, null, 2));
  } catch (err) {
    console.error('出现错误:', err);
  } finally {
    // 关闭数据库连接
    await client.close();
  }
};

// 运行测试
testsearchAllCourse();
