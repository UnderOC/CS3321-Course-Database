const express = require('express');
const bodyParser = require('body-parser');
const { connectToDatabase, closeDatabaseConnection } = require('./db_connect');
const { insertCourseData, deleteCourseData, updateCourseData } = require('./modify_course_data');

//const { MongoClient } = require('mongodb');
const searchParsedKeywords = require('./search_function');
const cors = require('cors');

const app = express();
const port = 3001;
//const uri = 'mongodb://localhost:27017'; // 这里改成本地mongodb的url
//const dbName = 'COURSE_DB';

// 定义有效的module值
const validModules = ['all', 'announcement', 'video', 'assignment', 'file', 'module'];

// 检查modules数组中的元素是否有效
const areModulesValid = (modules) => {
  return modules.every(module => validModules.includes(module));
};

app.use(cors());
app.use(bodyParser.json());

let db;
let course_info;

(async function initializeDatabase() {
  db = await connectToDatabase();
  course_info = db.collection('Course_Inform');
})();

app.post('/insert', async (req, res) => {
  try {
      const { className, moduleName, data, idField } = req.body;
      await insertCourseData(course_info, className, moduleName, data, idField);
      res.status(200).send('Insert successful');
  } catch (error) {
      res.status(500).send(`Error: ${error.message}`);
  }
});

app.post('/update', async (req, res) => {
  try {
      const { className, moduleName, index, updateData } = req.body;
      await updateCourseData(course_info, className, moduleName, index, updateData);
      res.status(200).send('Update successful');
  } catch (error) {
      res.status(500).send(`Error: ${error.message}`);
  }
});

app.post('/delete', async (req, res) => {
  try {
      const { className, moduleName, index } = req.body;
      await deleteCourseData(course_info, className, moduleName, index);
      res.status(200).send('Delete successful');
  } catch (error) {
      res.status(500).send(`Error: ${error.message}`);
  }
});

    // 搜索接口
app.post('/search', async (req, res) => {
  const { keyword, modules } = req.body;
  console.log('Received request:', keyword, modules)

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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

process.on('SIGINT', async () => {
  await closeDatabaseConnection();
  process.exit(0);
});


