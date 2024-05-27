const { connectToDatabase } = require('./db_connect');
const fs = require('fs');
const path = require('path');

// 从 JSON 文件批量导入数据到集合
async function importDataFromFile(filePath, collectionName) {
    try {
        const collection = await connectToDatabase(collectionName);

        const fileContent = fs.readFileSync(path.resolve(__dirname, filePath), 'utf-8');
        const documents = JSON.parse(fileContent);

        await collection.insertMany(documents);
        console.log(`${documents.length} documents inserted into ${collectionName}`);
    } catch (err) {
        console.error('Error importing data: ', err);
    }
}

// 单独插入一条用户信息到集合
async function insertUser(collectionName, userInfo) {
    try {
        const collection = await connectToDatabase(collectionName);

        // 检查是否存在相同的id
        const existingUser = await collection.findOne({ id: userInfo.id });
        if (existingUser) {
            throw new Error('User already exists.');
        }

        await collection.insertOne(userInfo);
        console.log('User information inserted:', userInfo);
    } catch (err) {
        console.error('Error inserting user information:', err.message);
    }
}

module.exports = {
    importDataFromFile,
    insertUser
};
