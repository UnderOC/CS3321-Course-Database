const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const dbName = 'COURSE_DB';
const collectionName = 'Users_Inform';

const client = new MongoClient(url);

async function initializeCollection() {
  try {
    await client.connect();
    console.log('Connected successfully to MongoDB server.');

    const database = client.db(dbName);
    const collections = await database.listCollections({ name: collectionName }).toArray();

    if (collections.length === 0) {
      await database.createCollection(collectionName);
      console.log(`Collection "${collectionName}" created.`);
    }
  } finally {
    await client.close();
  }
}

initializeCollection().catch(console.error);

async function register(username, password) {
  if (!username || !password) {
    throw new Error('Username and password are required.');
  }

  try {
    await client.connect();
    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    const user = await collection.findOne({ username });

    if (user) {
      throw new Error('Username already registered.');
    }

    const newUser = {
      username,
      password,
      isTeacher: false,
    };

    await collection.insertOne(newUser);
    return 'User registered successfully.';
  } catch (error) {
    throw new Error('Internal server error: ' + error.message);
  } finally {
    await client.close();
  }
}

async function login(username, password) {
  if (!username || !password) {
    throw new Error('Username and password are required.');
  }

  try {
    await client.connect();
    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    const user = await collection.findOne({ username });

    if (!user || user.password !== password) {
      throw new Error('Incorrect username or password.');
    }

    return {
      message: 'Login successful.',
      isTeacher: user.isTeacher,
    };
  } catch (error) {
    throw new Error('Internal server error: ' + error.message);
  } finally {
    await client.close();
  }
}

// Example usage
(async () => {
  try {
    console.log(await register('newuser', 'password123'));
  } catch (error) {
    console.error(error.message);
  }

  try {
    const loginResult = await login('newuser', 'password123');
    console.log(loginResult);
  } catch (error) {
    console.error(error.message);
  }
})();
