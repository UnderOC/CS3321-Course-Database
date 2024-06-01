const { createCourse } = require('./create_course');
const { insertCourseData, deleteCourseData, updateCourseData, deleteManyCourseData } = require('./modify_course_data');

async function checkCoursePermission(db, username, courseName) {
        const usersCollection = db.collection('Users_Inform');
        const coursesCollection = db.collection('Course_Inform');
        const teacherCollection = db.collection('Teacher_Inform');

        // 查找用户信息
        const user = await usersCollection.findOne({ user_name: username });
        if (!user) {
            throw new Error('User not found');
        }

        // 如果用户是学生，拒绝请求
        if (user.role === 'student') {
            return false;
        }

        // 查找课程信息
        const course = await coursesCollection.findOne({ course_name: courseName });
        if (!course) {
            throw new Error('Course not found');
        }

        // 检查教师是否有对课程进行修改的权限
        const teacher = await teacherCollection.findOne({id : user.id});
        //console.log(teacher);
        const hasPermission = teacher.class.includes(courseName);

        return hasPermission;
    }

async function logUserAction(db, username, action, details) {
    const usersCollection = db.collection('Users_Inform');
    await usersCollection.updateOne({ user_name: username }, { $push: { recentActions: { action, details, date: new Date() } } });
}

async function insertWithPermission(db, userName, className, moduleName, data, idField) {
    const hasPermission = await checkCoursePermission(db, userName, className);
    if (!hasPermission){
        throw new Error("Insert permission denied");
    }

    const collection = db.collection('Course_Inform');
    await insertCourseData(collection, className, moduleName, data, idField);

    let action = "insert";
    let details = {};
    details['className'] = className;
    details['moduleName'] = moduleName;
    details['data'] = data;
    details['idField'] = idField;
    await logUserAction(db, userName, action, details);
}

async function deleteWithPermission(db, userName, className, moduleName, idObject) {
    const hasPermission = await checkCoursePermission(db, userName, className);
    if (!hasPermission){
        throw new Error("Delete permission denied");
    }

    const collection = db.collection('Course_Inform');
    await deleteCourseData(collection, className, moduleName, idObject);

    let action = "delete";
    let details = {};
    details['className'] = className;
    details['moduleName'] = moduleName;
    details['idObject'] = idObject;
    await logUserAction(db, userName, action, details);
}

async function updateWithPermission(db, userName, className, moduleName, idObject, updateFields) {
    const hasPermission = await checkCoursePermission(db, userName, className);
    if (!hasPermission){
        throw new Error("Update permission denied");
    }

    const collection = db.collection('Course_Inform');
    await updateCourseData(collection, className, moduleName, idObject, updateFields);

    let action = "update";
    let details = {};
    details['className'] = className;
    details['moduleName'] = moduleName;
    details['idObject'] = idObject;
    details['updateFields'] = updateFields;
    await logUserAction(db, userName, action, details);
}

async function deleteManyWithPermission(db, userName, className, moduleName) {
    const hasPermission = await checkCoursePermission(db, userName, className);
    if (!hasPermission){
        throw new Error("Delete permission denied");
    }

    const collection = db.collection('Course_Inform');
    await deleteManyCourseData(collection, className, moduleName);

    let action = "deleteMany";
    let details = {};
    details['className'] = className;
    details['moduleName'] = moduleName;
    await logUserAction(userName, action, details);
}

async function createWithPermission(db, userName, courseName, courseUrl, courseId){
    const usersCollection = db.collection('Users_Inform');
    const coursesCollection = db.collection('Course_Inform');
    const teacherCollection = db.collection('Teacher_Inform');

    const user = await usersCollection.findOne({ user_name:userName });
    if (!user) {
        throw new Error('User not found');
    }
    if (user.role === 'student') {
        return false;
    }

    // 检查教师是否有对课程进行修改的权限
    const teacher = await teacherCollection.findOne({id : user.id});
    //console.log(teacher);
    const hasPermission = teacher.class.includes(courseName);
    if (!hasPermission) {
        throw new Error("Create permission denied");
    }

    await createCourse(coursesCollection, courseName, courseUrl, courseId);

    let action = "createCourse";
    let details = {};
    details['courseName'] = courseName;
    details['courseUrl'] = courseUrl;
    details['courseId'] = courseId;
    await logUserAction(db, userName, action, details);
}

async function markFavoriteCourse(db, userName, courseName) {
    
    const usersCollection = db.collection('Users_Inform');
    const coursesCollection = db.collection('Course_Inform');

    const course = await coursesCollection.findOne({course_name: courseName});
    //console.log(course);

    if (!course) {
        throw new Error("Course does not exist");
    }
    //console.log(usersCollection);
    const user = await usersCollection.findOne({user_name: userName});
    //console.log(user);
    if (user) {
        //console.log(user.likedCourses, Array.isArray(user.likedCourses));

        if (user.likedCourses && Array.isArray(user.likedCourses)) {
            const hasFavoured = user.likedCourses.includes(courseName);
            if (hasFavoured){
                throw new Error('Course already favored');
            }
            await usersCollection.updateOne({ user_name: userName }, { $addToSet: { likedCourses: courseName } });
            console.log('Favored courses updated');
        }
        else {
            await usersCollection.updateOne({ user_name: userName }, { $addToSet: { likedCourses: courseName } });
            console.log('Create likedCourses and Favored courses updated');
        }
    } else {
        throw new Error('User not found');
    }
}

async function removeFavoriteCourse(db, userName, courseName) {
    
    const usersCollection = db.collection('Users_Inform');
    const coursesCollection = db.collection('Course_Inform');

    const course = await coursesCollection.findOne({course_name: courseName});
    //console.log(course);

    if (!course) {
        throw new Error("Course does not exist");
    }
    //console.log(usersCollection);
    const user = await usersCollection.findOne({user_name: userName});
    //console.log(user);
    if (user) {
        //console.log(user.likedCourses, Array.isArray(user.likedCourses));

        if (user.likedCourses && Array.isArray(user.likedCourses)) {
            const hasFavoured = user.likedCourses.includes(courseName);
            if (hasFavoured){
                await usersCollection.updateOne(
                    { user_name: userName },
                    { $pull: { likedCourses: courseName } }
                );
                console.log('Course removed from favorites');
            }
            else {
                throw new Error('Course has not been favored');
            }
        }
        else {
            throw new Error('No favor history yet')
        }
    } else {
        throw new Error('User not found');
    }
}


module.exports = {
    insertWithPermission,
    deleteWithPermission,
    updateWithPermission,
    deleteManyWithPermission,
    createWithPermission,
    markFavoriteCourse,
    removeFavoriteCourse
}