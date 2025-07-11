const fetch = require('node-fetch');

async function testCORS() {
  const url = 'https://camillo-backend.onrender.com/api/auth/login';
  
  try {
    // Test preflight request
    console.log('Testing preflight request...');
    const preflightResponse = await fetch(url, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log('Preflight response status:', preflightResponse.status);
    console.log('Preflight headers:', Object.fromEntries(preflightResponse.headers.entries()));
    
    // Test actual request
    console.log('\nTesting actual request...');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword'
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.text();
      console.log('Response body:', data);
    } else {
      console.log('Request failed');
    }
    
  } catch (error) {
    console.error('Error testing CORS:', error);
  }
}

testCORS(); 