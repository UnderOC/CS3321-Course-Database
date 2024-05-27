//importCourseData: 将 JSON 文件中的数据直接导入数据库

// 读取 JSON 文件的辅助函数
function readJSONFile(filepath) {
  const fileContent = fs.readFileSync(filepath, 'utf-8');
  return JSON.parse(fileContent);
}

// 将 JSON 文件中的内容直接导入课程数据
async function importCourseData(collection, filepath) {
  try {
      // 读取 JSON 文件
      const data = readJSONFile(filepath);

      // 如果需要，在导入前清空集合
      // await collection.deleteMany({});

      // 插入数据到集合
      const result = await collection.insertOne(data);
      console.log(`Inserted ${result.insertedCount} documents into ${collectionName}`);
  } catch (err) {
      console.error('An error occurred:', err);
  }
}

module.exports = {
  importCourseData
};