const fetch = require('node-fetch');

async function testEndpoint() {
  try {
    console.log('Testing manual deposit endpoint accessibility...');
    
    // Test without authentication first
    const response = await fetch('https://camillo-backend.onrender.com/api/manual-deposits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount: 5000 }),
    });
    
    console.log('Response status:', response.status);
    const data = await response.text();
    console.log('Response body:', data);
    
    // This should return 401 (unauthorized) which means the endpoint is working
    if (response.status === 401) {
      console.log('✅ Endpoint is accessible and properly rejecting unauthorized requests');
    } else {
      console.log('❌ Unexpected response status:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Error testing endpoint:', error.message);
  }
}

testEndpoint(); 