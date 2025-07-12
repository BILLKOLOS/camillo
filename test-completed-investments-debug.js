const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function debugCompletedInvestments() {
  try {
    console.log('🧪 Debugging completed investments notification system...');
    
    // First, login as admin to get token
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@camillo.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    
    // Check all investments
    console.log('📊 Checking all investments...');
    const allInvestmentsResponse = await axios.get(`${API_BASE_URL}/investments`, { headers });
    const allInvestments = allInvestmentsResponse.data.data.investments;
    
    console.log('📈 Total investments:', allInvestments.length);
    
    // Count by status
    const statusCounts = {};
    allInvestments.forEach(inv => {
      statusCounts[inv.status] = (statusCounts[inv.status] || 0) + 1;
    });
    console.log('📊 Investment status counts:', statusCounts);
    
    // Check completed investments
    console.log('✅ Checking completed investments...');
    const completedResponse = await axios.get(`${API_BASE_URL}/investments/admin/completed-investments`, { headers });
    const completedInvestments = completedResponse.data.data.investments;
    console.log('✅ Total completed investments:', completedInvestments.length);
    
    if (completedInvestments.length > 0) {
      console.log('📅 Latest completed investment:', {
        id: completedInvestments[0]._id,
        userName: completedInvestments[0].userName,
        amount: completedInvestments[0].amount,
        profitPaidAt: completedInvestments[0].profitPaidAt,
        status: completedInvestments[0].status
      });
    }
    
    // Test with a recent date (last 24 hours)
    const recentDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    console.log('🕐 Testing with date since:', recentDate.toISOString());
    const recentResponse = await axios.get(`${API_BASE_URL}/investments/admin/completed-investments?since=${recentDate.toISOString()}`, { headers });
    console.log('🆕 Completed investments in last 24 hours:', recentResponse.data.data.investments.length);
    
    // Test with a very old date to see all completed
    const oldDate = new Date('2020-01-01');
    console.log('🕐 Testing with date since:', oldDate.toISOString());
    const oldResponse = await axios.get(`${API_BASE_URL}/investments/admin/completed-investments?since=${oldDate.toISOString()}`, { headers });
    console.log('🆕 All completed investments since 2020:', oldResponse.data.data.investments.length);
    
    // Check if there are any investments that should be completed but aren't
    const activeInvestments = allInvestments.filter(inv => inv.status === 'active');
    console.log('🔄 Active investments:', activeInvestments.length);
    
    if (activeInvestments.length > 0) {
      console.log('⏰ Active investments with expiry dates:');
      activeInvestments.forEach(inv => {
        console.log(`  - ${inv.userName}: ${inv.amount} KSH, expires: ${inv.expiryDate}, status: ${inv.status}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.response?.data || error.message);
  }
}

debugCompletedInvestments(); 