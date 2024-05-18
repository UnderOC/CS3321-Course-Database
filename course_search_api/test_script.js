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

testSearchAPI();
