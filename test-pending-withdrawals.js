const fetch = require('node-fetch');

const API_BASE_URL = 'https://camillo-backend.onrender.com';
// Replace with your actual admin token
const ADMIN_TOKEN = 'YOUR_ADMIN_TOKEN_HERE';

async function testPendingWithdrawals() {
  try {
    console.log('🧪 Testing Pending Withdrawals System...\n');

    // Test 1: Check debug statuses
    console.log('1️⃣ Checking investment statuses...');
    const debugResponse = await fetch(`${API_BASE_URL}/api/investments/admin/debug-statuses`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
      },
    });

    if (debugResponse.ok) {
      const debugData = await debugResponse.json();
      console.log('✅ Debug data:', debugData.data);
      
      if (debugData.data.expiredActiveInvestments > 0) {
        console.log(`⚠️ Found ${debugData.data.expiredActiveInvestments} expired investments that need completion!`);
      }
    } else {
      console.log('❌ Failed to get debug data');
    }

    // Test 2: Manually complete expired investments
    console.log('\n2️⃣ Manually completing expired investments...');
    const completeResponse = await fetch(`${API_BASE_URL}/api/investments/complete-expired`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
      },
    });

    if (completeResponse.ok) {
      const completeData = await completeResponse.json();
      console.log('✅ Completion result:', completeData.data);
    } else {
      console.log('❌ Failed to complete expired investments');
    }

    // Test 3: Check pending withdrawals
    console.log('\n3️⃣ Checking pending withdrawals...');
    const withdrawalsResponse = await fetch(`${API_BASE_URL}/api/investments/admin/pending-withdrawals`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
      },
    });

    if (withdrawalsResponse.ok) {
      const withdrawalsData = await withdrawalsResponse.json();
      console.log(`✅ Found ${withdrawalsData.data.investments.length} pending withdrawals`);
      
      if (withdrawalsData.data.investments.length > 0) {
        console.log('📋 Pending withdrawals:');
        withdrawalsData.data.investments.forEach((investment, index) => {
          console.log(`   ${index + 1}. User: ${investment.userName}, Amount: ${investment.amount}, Profit: ${investment.profitAmount}, Total: ${investment.amount + investment.profitAmount}`);
        });
      }
    } else {
      console.log('❌ Failed to get pending withdrawals');
    }

    // Test 4: Check if scheduled task is working
    console.log('\n4️⃣ Checking if scheduled task is working...');
    console.log('ℹ️ The server should automatically complete expired investments every 5 minutes.');
    console.log('ℹ️ You can also manually trigger completion using the "Complete Expired" button in admin dashboard.');

  } catch (error) {
    console.error('❌ Error testing pending withdrawals:', error.message);
  }
}

// Run the test
testPendingWithdrawals(); 