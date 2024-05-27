// 测试导入数据相关函数
const { importDataFromFile, insertUser } = require('./import_user_inform');
const { importCourseData } = require('./import_course_data');

const { MongoClient } = require('mongodb');
const fs = require('fs');

// MongoDB URI 和数据库名称
const uri = 'mongodb://localhost:27017';//这里改成本地mongodb的url
const dbName = 'COURSE_DB';

// 测试函数
const testImportData = async () => {
  const client = new MongoClient(uri);

  try {
    // 连接数据库
    await client.connect();
    console.log('已成功连接到数据库');

    const db = client.db(dbName);
    // 导入课程信息
    //await importCollectionData('Course_Inform', 'mini_dataset3\\40385\\40385@@程序设计原理与方法.json');
    
    // 导入课程文档数据
    //await importCollectionData('Course_Files', 'keyword_extract_result\\48017_keywords.json');

    // 导入 student_inform.json 数据
    await importDataFromFile('student_inform.json', 'Student_Inform');

    // 导入 teacher_inform.json 数据
    await importDataFromFile('teacher_inform.json', 'Teacher_Inform');

    // 单独插入一条学生信息
    await insertUser('Student_Inform', { Sname: 'John', id: '10011' });

    // 单独插入一条教师信息
    await insertUser('Teacher_Inform', { Tname: 'Dr. Jane', id: '54321', class: [] });

  } catch (err) {
    console.error('出现错误:', err);
  } finally {
    // 关闭数据库连接
    await client.close();
  }
};

// 运行测试
testImportData();