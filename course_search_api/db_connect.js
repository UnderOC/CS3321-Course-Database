const { MongoClient } = require('mongodb');

// MongoDB 连接 URI
const uri = 'mongodb://localhost:27017';

// 数据库和集合名称
const dbName = 'COURSE_DB';
const collectionName = 'Course_Inform';

let client;

async function connectToDatabase() {
    if (!client) {
        client = new MongoClient(uri);
        await client.connect();
    }
    return client.db(dbName).collection(collectionName);
}

async function closeDatabaseConnection() {
    if (client) {
        await client.close();
        client = null;
    }
}

module.exports = {
    connectToDatabase,
    closeDatabaseConnection
};
