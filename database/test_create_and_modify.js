const { addCourseInfo, deleteCourseInfo, updateCourseInfo } = require('./modify_function');
const { createCourse } = require('./create_course');
const { connectToDatabase, closeDatabaseConnection } = require('./db_connect');

(async function () {
    try {
        // 创建新课程文档示例
        await createCourse({
            course_name: '大学英语',
            course_url: 'https://oc.sjtu.edu.cn/courses/11111',
            course_id: '11111'
        });

        // 增加直接模块的信息示例
        await addCourseInfo(
            '大学英语',
            'announcements',
            { ann_id: null, ann_title: '新公告', ann_message: '这是一个新公告' }
        );

        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        // 确保关闭数据库连接
        await closeDatabaseConnection();
    }
})();
