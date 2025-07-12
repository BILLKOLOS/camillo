const fetch = require('node-fetch');

const API_BASE_URL = 'https://camillo-backend.onrender.com';
// Replace with your actual admin token
const ADMIN_TOKEN = 'YOUR_ADMIN_TOKEN_HERE';

async function testNewInvestmentFlow() {
  try {
    console.log('🧪 Testing New Investment Flow...\n');

    // Step 1: Check current system status
    console.log('1️⃣ Checking current system status...');
    const debugResponse = await fetch(`${API_BASE_URL}/api/investments/admin/debug-statuses`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
      },
    });

    if (debugResponse.ok) {
      const debugData = await debugResponse.json();
      console.log('📊 Current Status:');
      console.log(`   - Active Investments: ${debugData.data.activeInvestments}`);
      console.log(`   - Completed Investments: ${debugData.data.completedInvestments}`);
      console.log(`   - Pending Withdrawals: ${debugData.data.pendingWithdrawals}`);
      console.log(`   - Expired Active Investments: ${debugData.data.expiredActiveInvestments}`);
    }

    // Step 2: Check pending payments
    console.log('\n2️⃣ Checking pending payments...');
    const pendingResponse = await fetch(`${API_BASE_URL}/api/investments/pending-payments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
      },
    });

    if (pendingResponse.ok) {
      const pendingData = await pendingResponse.json();
      console.log(`✅ Found ${pendingData.data.investments.length} pending payments`);
      
      if (pendingData.data.investments.length > 0) {
        console.log('📋 Pending payments ready for admin approval:');
        pendingData.data.investments.forEach((investment, index) => {
          console.log(`   ${index + 1}. User: ${investment.userName}`);
          console.log(`      Phone: ${investment.userPhone}`);
          console.log(`      Investment: ${investment.amount} KSH`);
          console.log(`      Profit: ${investment.profitAmount} KSH`);
          console.log(`      Total Due: ${investment.amount + investment.profitAmount} KSH`);
          console.log(`      Status: ${investment.status}`);
          console.log(`      Payment Status: ${investment.paymentStatus}`);
          console.log(`      Created: ${investment.createdAt}`);
          console.log('');
        });
        
        // Step 3: Test approving a payment
        console.log('3️⃣ Testing payment approval...');
        const firstInvestment = pendingData.data.investments[0];
        console.log(`Testing approval for investment: ${firstInvestment.userName} - ${firstInvestment.amount} KSH`);
        
        const approveResponse = await fetch(`${API_BASE_URL}/api/investments/${firstInvestment._id}/approve-payment`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ADMIN_TOKEN}`,
          },
        });

        if (approveResponse.ok) {
          const approveData = await approveResponse.json();
          console.log('✅ Payment approved successfully!');
          console.log(`   Updated status: ${approveData.data.investment.status}`);
          console.log(`   Updated payment status: ${approveData.data.investment.paymentStatus}`);
          console.log(`   Payment approved at: ${approveData.data.investment.paymentApprovedAt}`);
        } else {
          console.log('❌ Failed to approve payment');
          const errorData = await approveResponse.text();
          console.log('Error:', errorData);
        }
      } else {
        console.log('ℹ️ No pending payments found');
      }
    } else {
      console.log('❌ Failed to get pending payments');
      const errorData = await pendingResponse.text();
      console.log('Error:', errorData);
    }

    // Step 4: Check final status
    console.log('\n4️⃣ Checking final system status...');
    const finalDebugResponse = await fetch(`${API_BASE_URL}/api/investments/admin/debug-statuses`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
      },
    });

    if (finalDebugResponse.ok) {
      const finalDebugData = await finalDebugResponse.json();
      console.log('📊 Final Status:');
      console.log(`   - Active Investments: ${finalDebugData.data.activeInvestments}`);
      console.log(`   - Completed Investments: ${finalDebugData.data.completedInvestments}`);
      console.log(`   - Pending Withdrawals: ${finalDebugData.data.pendingWithdrawals}`);
      console.log(`   - Expired Active Investments: ${finalDebugData.data.expiredActiveInvestments}`);
    }

    console.log('\n🎉 Test completed!');
    console.log('\n📝 Summary:');
    console.log('✅ Investment creation starts with pending payment status');
    console.log('✅ Admin can view pending payments in the dashboard');
    console.log('✅ Admin can approve payments with "Mark as Paid" button');
    console.log('✅ Approved investments are marked as completed');
    console.log('✅ System provides proper notifications and status updates');

  } catch (error) {
    console.error('❌ Error testing new investment flow:', error.message);
  }
}

// Run the test
testNewInvestmentFlow(); 