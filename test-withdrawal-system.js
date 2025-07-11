const fetch = require('node-fetch');

async function testWithdrawalSystem() {
  try {
    console.log('Testing automatic withdrawal system...');
    
    // Test 1: Check if there are any completed investments with pending withdrawals
    const response = await fetch('https://camillo-backend.onrender.com/api/investments/admin/pending-withdrawals', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_ADMIN_TOKEN_HERE', // Replace with actual admin token
      },
    });
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Pending withdrawals found:', data.data.investments.length);
      
      if (data.data.investments.length > 0) {
        console.log('✅ Pending withdrawals are working!');
        data.data.investments.forEach((investment, index) => {
          console.log(`${index + 1}. User: ${investment.userName}, Amount: ${investment.amount}, Profit: ${investment.profitAmount}, Total Due: ${investment.amount + investment.profitAmount}`);
        });
      } else {
        console.log('ℹ️ No pending withdrawals found (this is normal if no investments have completed yet)');
      }
    } else {
      const errorData = await response.text();
      console.log('❌ Error response:', errorData);
    }
    
  } catch (error) {
    console.error('❌ Error testing withdrawal system:', error.message);
  }
}

testWithdrawalSystem(); 