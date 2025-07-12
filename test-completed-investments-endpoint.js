const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testCompletedInvestmentsEndpoint() {
  try {
    console.log('🧪 Testing completed investments endpoint...');
    
    // First, login as admin to get token
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@camillo.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    
    // Test getting all completed investments
    console.log('📊 Testing get all completed investments...');
    const allCompletedResponse = await axios.get(`${API_BASE_URL}/investments/admin/completed-investments`, { headers });
    console.log('✅ All completed investments:', allCompletedResponse.data.data.investments.length);
    
    // Test getting completed investments since a specific date
    const sinceDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    console.log('📊 Testing get completed investments since:', sinceDate.toISOString());
    const sinceResponse = await axios.get(`${API_BASE_URL}/investments/admin/completed-investments?since=${sinceDate.toISOString()}`, { headers });
    console.log('✅ Completed investments since yesterday:', sinceResponse.data.data.investments.length);
    
    console.log('🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testCompletedInvestmentsEndpoint(); 