// 测试用户操作相关函数
const { registerUser } = require('./register');
const { loginUser } = require('./login');
const { connectToDatabase, closeDatabaseConnection } = require('./db_connect');
const  {
  insertWithPermission,
  deleteWithPermission,
  updateWithPermission,
  deleteManyWithPermission,
  createWithPermission,
  markFavoriteCourse,
  removeFavoriteCourse
} = require('./user_action');

// MongoDB URI 和数据库名称
const uri = 'mongodb://localhost:27017';//这里改成本地mongodb的url
const dbName = 'COURSE_DB';

// 测试函数
const testUserAction = async () => {;

  try {
    const db = await connectToDatabase();

    // 教师用户注册
    //await registerUser(db, 'teacher001', 'password123', 'teacher', '200001');
    //await registerUser(db, 'teacher002', 'password456', 'teacher', '200002');
    //await registerUser(db, 'teacher003', 'password789', 'teacher', '200004');
    // 学生用户注册
    await registerUser(db, 'student0001', 'password456', 'student', '10001');

    // 教师用户登录
    //await loginUser(db, 'teacher001', 'password123');
    //await loginUser(db, 'teacher002', 'password456')

    //await insertWithPermission(db, 'teacher001', '程序设计原理与方法', ['announcements'], { ann_id: '10001', ann_title: '新公告', ann_message: '这是一个新公告' }, {});

    //await insertWithPermission(db, 'teacher002', '程序设计原理与方法', ['announcements'], { ann_id: '10001', ann_title: '新公告', ann_message: '这是一个新公告' }, {});

    //await updateWithPermission(db, 'teacher001', '程序设计原理与方法', ['announcements'], { ann_id: '10001' }, { ann_title: '更新公告', ann_message: '新的公告'});

    //await deleteWithPermission(db, 'teacher001', '程序设计原理与方法', ['announcements'], { ann_id: '10001' });

    //await createWithPermission(db, 'teacher001', '英语（1）', 'http://localhost', '10001');

    //await createWithPermission(db, 'teacher003', '大学英语', 'http://localhost', '10001');

    //await markFavoriteCourse(db, 'student005', '程序设计原理与方法');
    //await markFavoriteCourse(db, 'teacher003', '程序设计原理与方法');
    //await markFavoriteCourse(db, 'teacher004', '程序设计原理与方法');

    //await markFavoriteCourse(db, 'teacher003', '程序设计实践');
    //await removeFavoriteCourse(db, 'teacher002', '程序设计原理与方法');


  } catch (err) {
    console.error('出现错误:', err);
  } finally {
    // 关闭数据库连接
    await closeDatabaseConnection();
  }
};

// 运行测试
testUserAction();