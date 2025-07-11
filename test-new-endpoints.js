const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test the new endpoints
async function testNewEndpoints() {
  try {
    console.log('Testing new admin endpoints...\n');

    // Test 1: Get user deposits
    console.log('1. Testing GET /investments/admin/user-deposits');
    try {
      const userDepositsResponse = await axios.get(`${BASE_URL}/investments/admin/user-deposits`);
      console.log('✅ User deposits endpoint working');
      console.log('   Response:', userDepositsResponse.data);
    } catch (error) {
      console.log('❌ User deposits endpoint failed:', error.response?.data || error.message);
    }

    // Test 2: Get total investments
    console.log('\n2. Testing GET /investments/admin/total-investments');
    try {
      const totalInvestmentsResponse = await axios.get(`${BASE_URL}/investments/admin/total-investments`);
      console.log('✅ Total investments endpoint working');
      console.log('   Response:', totalInvestmentsResponse.data);
    } catch (error) {
      console.log('❌ Total investments endpoint failed:', error.response?.data || error.message);
    }

    // Test 3: Get pending withdrawals
    console.log('\n3. Testing GET /investments/admin/pending-withdrawals');
    try {
      const pendingWithdrawalsResponse = await axios.get(`${BASE_URL}/investments/admin/pending-withdrawals`);
      console.log('✅ Pending withdrawals endpoint working');
      console.log('   Response:', pendingWithdrawalsResponse.data);
    } catch (error) {
      console.log('❌ Pending withdrawals endpoint failed:', error.response?.data || error.message);
    }

    console.log('\n🎉 All tests completed!');

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the tests
testNewEndpoints(); 