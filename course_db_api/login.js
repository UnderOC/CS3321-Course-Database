//loginUser: 使用用户名和密码进行登录，没有注册则要求先注册
const bcrypt = require('bcrypt');

async function loginUser(db, username, password) {
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
}

module.exports = {
    loginUser
};
