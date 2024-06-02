const axios = require('axios');

const baseURL = 'http://localhost:3000';

// Helper function to perform a POST request
async function postRequest(url, data) {
  try {
    const response = await axios.post(`${baseURL}${url}`, data);
    console.log(`Response from ${url}:`, response.data);
  } catch (error) {
    console.error(`Error from ${url}:`, error.response ? error.response.data : error.message);
  }
}

// Test cases
async function runTests() {
  // Register a user
  await postRequest('/register', {
    username: 'student002',
    password: 'password123',
    role: 'student',
    identifier: '10003'
  });

  // Login a user
  await postRequest('/login', {
    username: 'student002',
    password: 'password123'
  });

  // Create a course
  await postRequest('/create', {
    userName: 'teacher003',
    courseName: '大学英语',
    courseUrl: 'http://example.com',
    courseId: '10001'
  });
  
  // Insert data into a module
  await postRequest('/insert', {
    userName: 'teacher001',
    className: '程序设计原理与方法',
    moduleName: ['announcements'],
    data: { ann_id: '10001', ann_title: '新公告', ann_message: '这是一个新公告' },
    idField: {}
  });

  // Update data in a module
  await postRequest('/update', {
    userName: 'teacher001',
    className: '程序设计原理与方法',
    moduleName: ['announcements'],
    idObject: { ann_id: '10001' },
    updateFields: {  ann_title: '更新公告', ann_message: '更新了公告' }
  });

  // Delete data from a module
  await postRequest('/delete', {
    userName: 'teacher001',
    className: '程序设计原理与方法',
    moduleName: ['announcements'],
    idObject: { ann_id: '10001' }
  });

  // Search for a keyword
  await postRequest('/search', {
    keyword: '大学物理',
    modules: ['all']
  });

  // Add a favorite course
  await postRequest('/addFavorite', {
    userName: 'teacher001',
    courseName: '大学英语'
  });

  // Remove a favorite course
  await postRequest('/removeFavorite', {
    userName: 'teacher001',
    courseName: '大学英语'
  });
}

// Run the tests
runTests();
