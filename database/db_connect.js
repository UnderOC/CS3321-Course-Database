const { MongoClient } = require('mongodb');

// MongoDB 连接 URI
const uri = 'mongodb://localhost:27017';

// 数据库和集合名称
const dbName = 'COURSE_DB';

let client;

async function connectToDatabase(collectionName) {
    if (!client) {
        client = new MongoClient(uri);
        await client.connect();
    }
    console.log('Connected to MongoDB');
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
