const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

async function registerUser(username, password, role, identifier) {
    const client = new MongoClient('mongodb://localhost:27017');
    try {
        await client.connect();
        const db = client.db('COURSE_DB');
        const usersCollection = db.collection('Users_Inform');
        const teacherCollection = db.collection('Teacher_Inform');
        const studentCollection = db.collection('Student_Inform');

        const userExists = await usersCollection.findOne({ user_name: username });
        if (userExists) {
            throw new Error('User already exists');
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

        const hashedPassword = await bcrypt.hash(password, 10);
        await usersCollection.insertOne({
            "user_name": username,
            "password": hashedPassword,
            "role": role,
            "id": identifier 
        });

        console.log('User registered successfully');
    } finally {
        await client.close();
    }
}

module.exports = {
    registerUser
};



