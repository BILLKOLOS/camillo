const fetch = require('node-fetch');

async function testManualDeposit() {
  try {
    console.log('Testing manual deposit endpoint...');
    
    // First, let's try to get a token (you'll need to replace with a valid token)
    const response = await fetch('https://camillo-backend.onrender.com/api/manual-deposits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE', // Replace with actual token
      },
      body: JSON.stringify({ amount: 5000 }),
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    const data = await response.text();
    console.log('Response body:', data);
    
  } catch (error) {
    console.error('Error testing manual deposit:', error);
  }
}

testManualDeposit(); 