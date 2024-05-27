const { MongoClient } = require('mongodb');

async function viewCourses() {
    const client = new MongoClient('mongodb://localhost:27017', { useUnifiedTopology: true });
    try {
        await client.connect();
        const db = client.db('yourDatabase');
        const teacherCollection = db.collection('Teacher_Inform');

        const courses = await teacherCollection.find({}).toArray();
        console.log('Courses:', courses);
        return courses;
    } finally {
        await client.close();
    }
}

async function favoriteCourse(username, courseId) {
    const client = new MongoClient('mongodb://localhost:27017', { useUnifiedTopology: true });
    try {
        await client.connect();
        const db = client.db('yourDatabase');
        const usersCollection = db.collection('Users_Inform');

        const user = await usersCollection.findOne({ username });
        if (!user || user.role !== 'student') {
            throw new Error('Access denied');
        }

        await usersCollection.updateOne(
            { username },
            { $addToSet: { favoriteCourses: courseId } }
        );

        console.log('Course favorited successfully');
    } finally {
        await client.close();
    }
}

// Example usage
viewCourses().catch(console.error);
favoriteCourse('jane_doe', 'C123').catch(console.error);
