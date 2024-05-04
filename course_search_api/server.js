const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const searchCourses = require('./search_function');

const app = express();
const port = 3000;
const uri = "mongodb://localhost:27017";

app.use(bodyParser.json());

MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
    if (err) {
        console.error('Database connection failed', err);
        return;
    }
    console.log("Connected to MongoDB");
    const db = client.db("COURSE_DB");

    // 搜索接口
    app.post('/search', async (req, res) => {
        //这里假设请求结构为{"keyword": 待查找关键词，“constraints”: 一组约束条件，数组形式}
        const { keyword, constraints} = req.body;
        // 调用之前定义的查询函数
        const results = await searchCourses(db, keyword,constraints); // 假设这是你实现的查询函数
        if (results.length > 0) {
            res.status(200).json(results);
        } else {
            res.status(404).json({ message: 'No matching records found' });
        }
    });

    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
});

function searchCourses(db, keyword) {
    // 这里包含你的搜索逻辑
    return db.collection('Course_Inform').find({ $text: { $search: keyword } }).toArray();
}
