const express = require('express');
const bodyParser = require('body-parser');

const { connectToDatabase, closeDatabaseConnection } = require('./db_connect');
const {
  insertWithPermission,
  deleteWithPermission,
  updateWithPermission,
  deleteManyWithPermission,
  createWithPermission,
  markFavoriteCourse,
  removeFavoriteCourse
} = require('./user_action');
const { loginUser } = require('./login');
const { registerUser } = require('./register');
//const { createCourse } = require('./create_course');
//const { insertCourseData, deleteCourseData, updateCourseData, deleteManyCourseData } = require('./modify_course_data');
const searchParsedKeywords = require('./search_function');

const cors = require('cors');

const app = express();
const port = 3000;

// 定义有效的module值
const validModules = ['all', 'announcement', 'video', 'assignment', 'file', 'module'];

// 检查modules数组中的元素是否有效
const areModulesValid = (modules) => {
  return modules.every(module => validModules.includes(module));
};

app.use(cors());
app.use(bodyParser.json());

let db;
let course_info;

(async function initializeDatabase() {
  db = await connectToDatabase();
  //course_info = db.collection('Course_Inform');
})();

app.post('/register', async (req, res) => {
  try {
      const { username, password, role, identifier } = req.body;

      await registerUser(db, username, password, role, identifier);
      res.status(200).send('User registered successfully');
  } catch (error) {
      res.status(400).send(error.message);
  }
});

app.post('/login', async (req, res) => {
  try {
      const { username, password } = req.body;

      const user = await loginUser(db, username, password);
      res.status(200).send(`Login successful for user: ${user.user_name}`);
  } catch (error) {
      res.status(400).send(error.message);
  }
});

app.post('/create', async (req, res) => {
  try {
    const { userName, courseName, courseUrl, courseId } = req.body;
    //console.log('Received request:', req.body);

    await createWithPermission(db, userName, courseName, courseUrl, courseId);
    res.status(200).json({ message: 'Create successful' }); 
  } catch (error) {
    console.error('Error during course creation:', error);
    res.status(500).json({ error: error.message }); 
  }
});

app.post('/insert', async (req, res) => {
  try {
      const { userName, className, moduleName, data, idField } = req.body;
      await insertWithPermission(db, userName, className, moduleName, data, idField);
      res.status(200).send('Insert successful');
  } catch (error) {
      res.status(500).send(`Error: ${error.message}`);
  }
});

app.post('/update', async (req, res) => {
  try {
      const { userName, className, moduleName, idObject, updateFields } = req.body;
      await updateWithPermission(db, userName, className, moduleName, idObject, updateFields);
      res.status(200).send('Update successful');
  } catch (error) {
      res.status(500).send(`Error: ${error.message}`);
  }
});

app.post('/delete', async (req, res) => {
  try {
      const { userName, className, moduleName, idObject } = req.body;
      await deleteWithPermission(db, userName, className, moduleName, idObject);
      res.status(200).send('Delete successful');
  } catch (error) {
      res.status(500).send(`Error: ${error.message}`);
  }
});

app.post('/deleteMany', async (req, res) => {
  try {
      const { userName, className, moduleName } = req.body;
      await deleteManyWithPermission(db, userName, className, moduleName);
      res.status(200).send('Delete successful');
  } catch (error) {
      res.status(500).send(`Error: ${error.message}`);
  }
});


app.post('/search', async (req, res) => {
  const { keyword, modules } = req.body;
  console.log('Received request:', keyword, modules)

  if (!keyword || !areModulesValid(modules)) {
    return res.status(400).send({ error: 'Invalid request parameters' });
  }

  // 调用之前定义的查询函数
  try {
    const results = await searchParsedKeywords(db, keyword, modules);
    if (results.length > 0) {
      res.status(200).json(results);
    } else {
      res.status(404).json({ message: 'No matching records found' });
    }
  } catch (error) {
    console.error('Error during search', error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

app.post('/addFavorite', async (req, res) => {
  try {
      const db = await connectToDatabase();
      const { userName, courseName } = req.body;
      await markFavoriteCourse(db, userName, courseName);
      res.status(200).send('Course added to favorites');
  } catch (error) {
      res.status(400).send(error.message);
  }
});

app.post('/removeFavorite', async (req, res) => {
  try {
      const db = await connectToDatabase();
      const { userName, courseName } = req.body;
      await removeFavoriteCourse(db, userName, courseName);
      res.status(200).send('Course removed from favorites');
  } catch (error) {
      res.status(400).send(error.message);
  }
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

process.on('SIGINT', async () => {
  await closeDatabaseConnection();
  process.exit(0);
});


