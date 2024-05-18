const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');

// MongoDB URL
const url = 'mongodb://localhost:27017';
// 数据库名
const dbName = 'COURSE_DB';

// 读取 JSON 文件并转换为 JavaScript 对象
function readJSONFile(filepath) {
  const contents = fs.readFileSync(filepath, 'utf8');
  return JSON.parse(contents);
}

// 导入数据到集合
async function importCollectionData(collectionName, filepath) {
  const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    console.log('Connected correctly to server');
    const db = client.db(dbName);

    // 读取 JSON 数据
    const data = readJSONFile(filepath);

    // 如果需要，在导入前清空集合
    //await db.collection(collectionName).deleteMany({});

    // 插入数据到集合
    const result = await db.collection(collectionName).insertOne(data);
    console.log(`Inserted ${result.insertedCount} documents into ${collectionName}`);
  } catch (err) {
    console.error('An error occurred:', err);
  } finally {
    await client.close();
  }
}

// 使用函数批量导入每个集合的数据
importCollectionData('Course_Inform', 'mini_dataset3\\40385\\40385@@程序设计原理与方法.json');
importCollectionData('Course_Inform', 'mini_dataset3\\44009\\44009@@大学物理（荣誉）（1）.json');
importCollectionData('Course_Inform', 'mini_dataset3\\45782\\45782@@程序设计实践.json');
importCollectionData('Course_Inform', 'mini_dataset3\\48017\\48017@@大学物理（荣誉）（2）.json');
importCollectionData('Course_Inform', 'mini_dataset3\\60290\\60290@@操作系统.json');
importCollectionData('Course_Files', 'keyword_extract_result\\60290_keywords.json');
importCollectionData('Course_Files', 'keyword_extract_result\\44009_keywords.json');
importCollectionData('Course_Files', 'keyword_extract_result\\48017_keywords.json');
//importCollectionData('Teacher_Inform', 'path/to/teachers.json');

