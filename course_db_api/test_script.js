const fetch = require('node-fetch');

const testSearchAPI = async () => {
  const response = await fetch('http://localhost:3001/search', {
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
  const response = await fetch('http://localhost:3001/insert', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      className: '大学物理（荣誉）（1）',
      moduleName: ['files', 'file_folder'],
      data: '新的文件夹',
      idField: { file_id: '123' }
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
  const response = await fetch('http://localhost:3001/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      className: '大学英语',
      moduleName: ['announcements'],
      index: [0],
      updateData: { ann_message: '更新了公告' }
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
  const response = await fetch('http://localhost:3001/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      className: '大学英语',
      moduleName: ['announcements'],
      index: [0]
    })
  });

  if (response.ok) {
    const data = await response.text();
    console.log('Delete Response:', data);
  } else {
    console.log('Delete Error:', response.status, response.statusText);
  }
};

testSearchAPI();
testInsertAPI();
testUpdateAPI();
testDeleteAPI();
