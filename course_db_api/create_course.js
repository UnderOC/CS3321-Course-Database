// 新增课程文档, 写入课程元数据，初始化其余模块为空列表
async function createCourse(collection, courseName, courseUrl, courseId) {
    console.log("createCourse", courseName, courseUrl, courseId);
    // 检查课程是否已存在
    try {
        // 检查课程是否已存在
        console.log("Checking if course exists");
        const existingCourse = await collection.findOne({ course_name: courseName });
        //console.log("Existing course:", existingCourse);
    
        if (existingCourse) {
          throw new Error(`Course with name "${courseName}" already exists in the collection.`);
        }
    
        console.log("Creating new course");
        const newCourse = {
          course_name: courseName,
          course_url: courseUrl,
          course_id: courseId,
          video: [],
          files: [],
          announcements: [],
          assignments: [],
          modules: []
        };
    
        await collection.insertOne(newCourse);
        console.log(`Course "${courseName}" created successfully.`);
      } catch (error) {
        console.error("Error in createCourse function:", error);
        throw error; 
      }
}

module.exports = {
    createCourse
};
