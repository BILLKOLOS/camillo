const fetch = require('node-fetch');

const API_BASE_URL = 'https://camillo-backend.onrender.com';
// Replace with your actual user token (not admin token)
const USER_TOKEN = 'YOUR_USER_TOKEN_HERE';

async function createTestInvestment() {
  try {
    console.log('🧪 Creating test investment for automatic withdrawal testing...\n');

    // Create a test investment that expires in 1 minute
    const investmentResponse = await fetch(`${API_BASE_URL}/api/investments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${USER_TOKEN}`,
      },
      body: JSON.stringify({
        amount: 1000, // 1000 KSH test investment
        testMode: true // This will make it expire in 1 minute
      }),
    });

    if (investmentResponse.ok) {
      const investmentData = await investmentResponse.json();
      console.log('✅ Test investment created successfully!');
      console.log('📋 Investment Details:');
      console.log(`   - Amount: ${investmentData.data.investment.amount} KSH`);
      console.log(`   - Expected Profit: ${investmentData.data.investment.profitAmount} KSH`);
      console.log(`   - Total Due: ${investmentData.data.investment.amount + investmentData.data.investment.profitAmount} KSH`);
      console.log(`   - Expires At: ${investmentData.data.investment.expiryDate}`);
      console.log(`   - Status: ${investmentData.data.investment.status}`);
      
      console.log('\n⏰ This investment will automatically expire in 1 minute.');
      console.log('🔄 After expiration, it will automatically appear in pending withdrawals.');
      console.log('📊 You can check the admin dashboard to see the pending withdrawal.');
      
      return investmentData.data.investment;
    } else {
      const errorData = await investmentResponse.text();
      console.log('❌ Failed to create test investment:', errorData);
    }
  } catch (error) {
    console.error('❌ Error creating test investment:', error.message);
  }
}

// Run the test
createTestInvestment(); 