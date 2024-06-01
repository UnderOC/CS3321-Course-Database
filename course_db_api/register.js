//registerUser: 使用用户名，密码注册，确定身份并使用id进行身份验证
const bcrypt = require('bcrypt');

async function registerUser(db, username, password, role, identifier) {
        const usersCollection = db.collection('Users_Inform');
        const teacherCollection = db.collection('Teacher_Inform');
        const studentCollection = db.collection('Student_Inform');

        const userExists = await usersCollection.findOne({ user_name: username });
        if (userExists) {
            throw new Error('User name already exists');
        }

        if (role === 'teacher') {
            const teacherExists = await teacherCollection.findOne({ id: identifier });
            if (!teacherExists) {
                throw new Error('Invalid staff ID');
            }
        } else if (role === 'student') {
            const studentExists = await studentCollection.findOne({ id: identifier });
            if (!studentExists) {
                throw new Error('Invalid student ID');
            }
        } else {
            throw new Error('Invalid role');
        }
        
        const hasRegisterd = await usersCollection.findOne({ id: identifier});
        if (hasRegisterd){
            throw new Error('Already registered, please login');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await usersCollection.insertOne({
            "user_name": username,
            "password": hashedPassword,
            "role": role,
            "id": identifier 
        });

        console.log('User registered successfully');
}

module.exports = {
    registerUser
};



