const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

async function loginUser(username, password) {
    const client = new MongoClient('mongodb://localhost:27017');
    try {
        await client.connect();
        const db = client.db('COURSE_DB');
        const usersCollection = db.collection('Users_Inform');

        const user = await usersCollection.findOne({ user_name: username });
        if (!user) {
            throw new Error('User not found, please register first');
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            throw new Error('Invalid password');
        }

        console.log('Login successful');
        return user;
    } finally {
        await client.close();
    }
}

module.exports = {
    loginUser
};
