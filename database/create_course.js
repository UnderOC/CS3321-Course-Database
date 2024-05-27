const { connectToDatabase } = require('./db_connect');

// 新增课程文档, 写入课程元数据，初始化其余模块为空列表
async function createCourse(courseInfo) {
    const collection = await connectToDatabase('Course_Inform');
    
    // 检查课程是否已存在
    const existingCourse = await collection.findOne({ course_name: courseInfo.course_name });
    if (existingCourse) {
        throw new Error(`Course with name "${courseInfo.course_name}" already exists in the collection.`);
    }
    
    const newCourse = {
        course_name: courseInfo.course_name,
        course_url: courseInfo.course_url,
        course_id: courseInfo.course_id,
        video: [],
        files: [],
        announcements: [],
        assignments: [],
        modules: []
    };
    
    await collection.insertOne(newCourse);
    console.log(`Course "${courseInfo.course_name}" created successfully.`);
}

module.exports = {
    createCourse
};
