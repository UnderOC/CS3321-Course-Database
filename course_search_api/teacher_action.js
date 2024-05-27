const { MongoClient } = require('mongodb');

async function modifyCourse(username, action, courseData) {
    const client = new MongoClient('mongodb://localhost:27017', { useUnifiedTopology: true });
    try {
        await client.connect();
        const db = client.db('COURSE_DB');
        const usersCollection = db.collection('Users_Inform');
        const teacherCollection = db.collection('Teacher_Inform');
        const actionCollection = db.collection('Action_Records');

        const user = await usersCollection.findOne({ username });
        if (!user || user.role !== 'teacher') {
            throw new Error('Access denied');
        }

        if (action === 'add') {
            await teacherCollection.updateOne(
                { staffId: user.identifier },
                { $push: { courses: courseData } }
            );
        } else if (action === 'remove') {
            await teacherCollection.updateOne(
                { staffId: user.identifier },
                { $pull: { courses: courseData } }
            );
        } else {
            throw new Error('Invalid action');
        }

        console.log('Course modified successfully');
    } finally {
        await client.close();
    }
}


// Example usage
modifyCourse('john_doe', 'add', { courseId: 'C123', courseName: 'Math 101' }).catch(console.error);
