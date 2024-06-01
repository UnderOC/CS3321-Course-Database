const fetch = require('node-fetch');

const testCreateAPI = async () => {
  const response = await fetch('http://localhost:3000/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        courseName: '英语', 
        courseUrl: 'https://oc.sjtu.edu.cn/courses/11111', 
        courseId: '111'
    })
  });
  if (response.ok) {
    const data = await response.json();
    console.log('Response:', data);
  } else {
    console.log('Error:', response.status, response.statusText);
  }
};

const testSearchAPI = async () => {
  const response = await fetch('http://localhost:3000/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      keyword: '大学物理',
      modules: ['all']
    })
  });

  if (response.ok) {
    const data = await response.json();
    console.log('Response:', data);
  } else {
    console.log('Error:', response.status, response.statusText);
  }
};

const testInsertAPI = async () => {
  const response = await fetch('http://localhost:3000/insert', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      className: '大学英语',
      moduleName: ['announcements'],
      data: { ann_id: '10001', ann_title: '新公告', ann_message: '这是一个新公告' },
      idField: {}
    })
  });

  if (response.ok) {
    const data = await response.text();
    console.log('Insert Response:', data);
  } else {
    console.log('Insert Error:', response.status, response.statusText);
  }
};

const testUpdateAPI = async () => {
  const response = await fetch('http://localhost:3000/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      className: '大学英语',
      moduleName: ['announcements'],
      idObject: {ann_id : '10001'}, 
      updateFields: { ann_title: '更新公告',  ann_message: '更新了公告' }
    })
  });

  if (response.ok) {
    const data = await response.text();
    console.log('Update Response:', data);
  } else {
    console.log('Update Error:', response.status, response.statusText);
  }
};

const testDeleteAPI = async () => {
  const response = await fetch('http://localhost:3000/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      className: '大学英语',
      moduleName: ['announcements'],
      idObject: {ann_id : '10001'}
    })
  });

  if (response.ok) {
    const data = await response.text();
    console.log('Delete Response:', data);
  } else {
    console.log('Delete Error:', response.status, response.statusText);
  }
};


// 将所有测试函数调用放在一个 async 函数中
const runTests = async () => {
  await testCreateAPI();
  await testSearchAPI();
  await testInsertAPI();
  await testUpdateAPI();
  await testDeleteAPI();
};

// 运行测试函数
runTests().catch(err => console.error(err));