const { createCourse } = require('./create_course');
const { connectToDatabase, closeDatabaseConnection } = require('./db_connect');
const { insertCourseData, deleteCourseData, updateCourseData } = require('./modify_course_data');


(async function () {
    try {
        db = await connectToDatabase();
        const course_info = db.collection('Course_Inform');
        const user_info = db.collection('Users_Inform');
        const student_info = db.collection('Student_Inform');
        const teacher_info = db.collection('Teacher_Inform');

        // 在 Course_Inform 集合中新建一个课程文档
        //await createCourse(course_info, { course_name: '大学英语', course_url: 'https://oc.sjtu.edu.cn/courses/11111', course_id: '11111'});

        // 在 announcement 模块中新增一个 announcement
        //await insertCourseData(course_info, '大学英语', ['announcements'], { ann_id: 10001, ann_title: '新公告', ann_message: '这是一个新公告' }, {});

        // 在 files 中插入一个新文件
        //await insertCourseData(course_info, '大学物理（荣誉）（1）', ['files'], {file_id: '123', file_url: 'http://www.baidu.com'}, {});
      
        // 在 files 的子属性 file_folder 中插入一个字符串
        await insertCourseData(course_info, '大学物理（荣誉）（1）', ['files', 'file_folder'], '新的文件夹', { file_id: '123' });
        
        // 修改 index 为0的 announcement 的信息内容
        await updateCourseData(course_info, '大学英语', ['announcements'], [0],  { ann_message: '更新了公告'});

        // 删除 index 为0的 announcement
        await deleteCourseData(course_info, '大学英语', ['announcements'], [0]);

    } finally {
        // 确保关闭数据库连接
        await closeDatabaseConnection();
    }
})();
