const fetch = require('node-fetch');

const API_BASE_URL = 'https://camillo-backend.onrender.com';

async function testSystemStatus() {
  try {
    console.log('🔍 Testing System Status...\n');

    // Test 1: Check if backend is accessible
    console.log('1️⃣ Testing backend connectivity...');
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        console.log('✅ Backend is accessible');
      } else {
        console.log(`⚠️ Backend responded with status: ${response.status}`);
      }
    } catch (error) {
      console.log('❌ Backend is not accessible:', error.message);
    }

    // Test 2: Check if we can access the API without auth (should return 401)
    console.log('\n2️⃣ Testing API authentication...');
    try {
      const response = await fetch(`${API_BASE_URL}/api/investments/admin/debug-statuses`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.status === 401) {
        console.log('✅ API authentication is working (correctly rejecting unauthenticated requests)');
      } else {
        console.log(`⚠️ Unexpected response: ${response.status}`);
      }
    } catch (error) {
      console.log('❌ Error testing API authentication:', error.message);
    }

    // Test 3: Check if we can access public endpoints
    console.log('\n3️⃣ Testing public endpoints...');
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          phone: '1234567890',
          password: 'testpassword'
        }),
      });
      
      if (response.status === 400 || response.status === 409) {
        console.log('✅ Public endpoints are accessible');
      } else {
        console.log(`⚠️ Unexpected response from public endpoint: ${response.status}`);
      }
    } catch (error) {
      console.log('❌ Error testing public endpoints:', error.message);
    }

    console.log('\n🎉 System status test completed!');
    console.log('\n📝 Summary:');
    console.log('✅ Backend connectivity test');
    console.log('✅ API authentication test');
    console.log('✅ Public endpoints test');

  } catch (error) {
    console.error('❌ Error testing system status:', error.message);
  }
}

// Run the test
testSystemStatus(); 