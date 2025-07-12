const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function createCompletedInvestment() {
  try {
    console.log('🧪 Creating a completed investment for testing...');
    
    // First, login as admin to get token
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@camillo.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    
    // Get a user to create investment for
    const usersResponse = await axios.get(`${API_BASE_URL}/investments/search-users/700000000`, { headers });
    const users = usersResponse.data.data.users;
    
    if (users.length === 0) {
      console.log('❌ No users found');
      return;
    }
    
    const user = users[0];
    console.log('👤 Using user:', user.name);
    
    // Create a completed investment manually by updating an existing one
    const allInvestmentsResponse = await axios.get(`${API_BASE_URL}/investments`, { headers });
    const allInvestments = allInvestmentsResponse.data.data.investments;
    
    if (allInvestments.length === 0) {
      console.log('❌ No investments found to update');
      return;
    }
    
    // Find an active investment to complete
    const activeInvestment = allInvestments.find(inv => inv.status === 'active');
    
    if (!activeInvestment) {
      console.log('❌ No active investments found');
      return;
    }
    
    console.log('🔄 Updating investment:', activeInvestment._id);
    
    // Update the investment to completed status with profitPaidAt set to now
    const updateResponse = await axios.patch(`${API_BASE_URL}/investments/${activeInvestment._id}/status`, {
      status: 'completed'
    }, { headers });
    
    // Manually set profitPaidAt to now
    const now = new Date();
    const manualUpdate = await axios.patch(`${API_BASE_URL}/investments/${activeInvestment._id}/status`, {
      status: 'completed',
      profitPaidAt: now.toISOString()
    }, { headers });
    
    console.log('✅ Investment completed with profitPaidAt:', now.toISOString());
    
    // Test the completed investments endpoint
    console.log('🧪 Testing completed investments endpoint...');
    const completedResponse = await axios.get(`${API_BASE_URL}/investments/admin/completed-investments`, { headers });
    console.log('✅ Total completed investments:', completedResponse.data.data.investments.length);
    
    // Test with a recent date
    const recentDate = new Date(Date.now() - 1 * 60 * 60 * 1000); // 1 hour ago
    const recentResponse = await axios.get(`${API_BASE_URL}/investments/admin/completed-investments?since=${recentDate.toISOString()}`, { headers });
    console.log('🆕 Completed investments in last hour:', recentResponse.data.data.investments.length);
    
    console.log('🎉 Test completed! The notification should now appear.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

createCompletedInvestment(); 