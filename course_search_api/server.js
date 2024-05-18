const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const searchParsedKeywords = require('./search_function');

const app = express();
const port = 3001;
const uri = 'mongodb://localhost:27017'; // 这里改成本地mongodb的url
const dbName = 'COURSE_DB';

// 定义有效的module值
const validModules = ['all', 'announcement', 'video', 'assignment', 'file', 'module'];

// 检查modules数组中的元素是否有效
const areModulesValid = (modules) => {
  return modules.every(module => validModules.includes(module));
};

app.use(bodyParser.json());

const startServer = async () => {
  const client = new MongoClient(uri);

  try {
    // 连接数据库
    await client.connect();
    console.log('已成功连接到数据库');

    const db = client.db(dbName);

    // 搜索接口
    app.post('/search', async (req, res) => {
      const { keyword, modules } = req.body;

      if (!keyword || !areModulesValid(modules)) {
        return res.status(400).send({ error: 'Invalid request parameters' });
      }

      // 调用之前定义的查询函数
      try {
        const results = await searchParsedKeywords(db, keyword, modules);
        if (results.length > 0) {
          res.status(200).json(results);
        } else {
          res.status(404).json({ message: 'No matching records found' });
        }
      } catch (error) {
        console.error('Error during search', error);
        res.status(500).send({ error: 'Internal Server Error' });
      }
    });

    // 启动服务器
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.error('Database connection failed', err);
  }
};

// 启动服务器和数据库连接
startServer();
