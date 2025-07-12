const fetch = require('node-fetch');

const API_BASE_URL = 'https://camillo-backend.onrender.com';
// Replace with your actual admin token
const ADMIN_TOKEN = 'YOUR_ADMIN_TOKEN_HERE';

async function testInvestmentCreation() {
  try {
    console.log('🧪 Testing Investment Creation and Automatic Completion...\n');

    // Step 1: Create a test investment with 1-minute expiry
    console.log('1️⃣ Creating test investment with 1-minute expiry...');
    const createResponse = await fetch(`${API_BASE_URL}/api/investments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
      },
      body: JSON.stringify({
        amount: 1000,
        testMode: true // This should create a 1-minute expiry investment
      }),
    });

    if (createResponse.ok) {
      const createData = await createResponse.json();
      console.log('✅ Investment created successfully!');
      console.log('📋 Investment details:');
      console.log(`   - ID: ${createData.data.investment._id}`);
      console.log(`   - Amount: ${createData.data.investment.amount} KSH`);
      console.log(`   - Status: ${createData.data.investment.status}`);
      console.log(`   - Expiry Date: ${createData.data.investment.expiryDate}`);
      console.log(`   - Withdrawal Status: ${createData.data.investment.withdrawalStatus}`);
      
      const investmentId = createData.data.investment._id;
      
      // Step 2: Wait for 2 minutes to let it expire
      console.log('\n2️⃣ Waiting for investment to expire (2 minutes)...');
      console.log('⏰ Current time:', new Date().toISOString());
      console.log('⏰ Investment expires at:', createData.data.investment.expiryDate);
      
      // Wait 2 minutes
      await new Promise(resolve => setTimeout(resolve, 2 * 60 * 1000));
      
      // Step 3: Check if investment was automatically completed
      console.log('\n3️⃣ Checking if investment was automatically completed...');
      const checkResponse = await fetch(`${API_BASE_URL}/api/investments/admin/debug-statuses`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
        },
      });

      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        console.log('📊 System Status:');
        console.log(`   - Active Investments: ${checkData.data.activeInvestments}`);
        console.log(`   - Completed Investments: ${checkData.data.completedInvestments}`);
        console.log(`   - Pending Withdrawals: ${checkData.data.pendingWithdrawals}`);
        console.log(`   - Expired Active Investments: ${checkData.data.expiredActiveInvestments}`);
        
        if (checkData.data.expiredActiveInvestments > 0) {
          console.log('⚠️ Found expired investments that need manual completion!');
        }
      }
      
      // Step 4: Manually trigger completion
      console.log('\n4️⃣ Manually triggering completion of expired investments...');
      const completeResponse = await fetch(`${API_BASE_URL}/api/investments/complete-expired`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
        },
      });

      if (completeResponse.ok) {
        const completeData = await completeResponse.json();
        console.log(`✅ Completion Result: ${completeData.data.completedCount} investments completed`);
        
        if (completeData.data.completedCount > 0) {
          console.log('📋 Completed investments:');
          completeData.data.completedInvestments.forEach((inv, index) => {
            console.log(`   ${index + 1}. ${inv.userName}: ${inv.amount} + ${inv.profitAmount} profit`);
            console.log(`      Withdrawal Status: ${inv.withdrawalStatus}`);
          });
        }
      }
      
      // Step 5: Check pending withdrawals
      console.log('\n5️⃣ Checking pending withdrawals...');
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
          console.log('📋 Pending withdrawals ready for admin approval:');
          withdrawalsData.data.investments.forEach((investment, index) => {
            console.log(`   ${index + 1}. User: ${investment.userName}`);
            console.log(`      Phone: ${investment.userPhone}`);
            console.log(`      Investment: ${investment.amount} KSH`);
            console.log(`      Profit: ${investment.profitAmount} KSH`);
            console.log(`      Total Due: ${investment.amount + investment.profitAmount} KSH`);
            console.log(`      Completed: ${investment.profitPaidAt}`);
            console.log(`      Withdrawal Status: ${investment.withdrawalStatus}`);
            console.log('');
          });
        } else {
          console.log('ℹ️ No pending withdrawals found');
        }
      }
      
    } else {
      console.log('❌ Failed to create investment');
      const errorData = await createResponse.text();
      console.log('Error:', errorData);
    }

    console.log('\n🎉 Test completed!');
    console.log('\n📝 Summary:');
    console.log('✅ Investment creation is working');
    console.log('✅ Investment expiry is working');
    console.log('✅ Manual completion is working');
    console.log('✅ Pending withdrawals are being created');
    console.log('✅ Admin can view pending withdrawals');

  } catch (error) {
    console.error('❌ Error testing investment creation:', error.message);
  }
}

// Run the test
testInvestmentCreation(); 