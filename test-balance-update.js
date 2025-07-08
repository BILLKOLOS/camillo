const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testBalanceUpdate() {
  try {
    console.log('🧪 Testing Admin Balance Update with Automatic Investment and Profit...\n');

    // 1. First, let's get all users to find a test client
    console.log('1️⃣ Getting all users...');
    const usersResponse = await axios.get(`${API_BASE_URL}/mpesa-bot/users`);
    const users = usersResponse.data.data.users;
    
    // Find a client (non-admin user)
    const testUser = users.find(user => user.role === 'client');
    
    if (!testUser) {
      console.log('❌ No client users found. Please create a client user first.');
      return;
    }

    console.log(`✅ Found test user: ${testUser.name} (${testUser.phone})`);
    console.log(`   Current balance: ${testUser.balance} KSH`);

    // 2. Update the user's balance (add 5000 KSH)
    console.log('\n2️⃣ Updating user balance...');
    const newBalance = testUser.balance + 5000;
    
    const updateResponse = await axios.patch(`${API_BASE_URL}/investments/user/${testUser.id}/balance`, {
      balance: newBalance
    });

    const updatedUser = updateResponse.data.data.user;
    console.log(`✅ Balance updated successfully!`);
    console.log(`   New balance: ${updatedUser.balance} KSH`);
    console.log(`   Expected: ${newBalance + (5000 * 0.6)} KSH (5000 + 3000 profit)`);

    // 3. Check if investment was created
    console.log('\n3️⃣ Checking for created investment...');
    const investmentsResponse = await axios.get(`${API_BASE_URL}/investments`);
    const investments = investmentsResponse.data.data.investments;
    
    const userInvestments = investments.filter(inv => inv.userId === testUser.id);
    const latestInvestment = userInvestments[0]; // Most recent investment
    
    if (latestInvestment) {
      console.log(`✅ Investment found:`);
      console.log(`   Amount: ${latestInvestment.amount} KSH`);
      console.log(`   Expected Profit: ${latestInvestment.profitAmount} KSH`);
      console.log(`   Status: ${latestInvestment.status}`);
      console.log(`   Trading Period: ${latestInvestment.tradingPeriod} hours`);
      console.log(`   Expiry Date: ${latestInvestment.expiryDate}`);
      
      if (latestInvestment.status === 'trading') {
        console.log('🎉 Investment is actively trading!');
      }
    } else {
      console.log('❌ No investment found for the user');
    }

    // 4. Check transactions
    console.log('\n4️⃣ Checking transactions...');
    const transactionsResponse = await axios.get(`${API_BASE_URL}/transactions`);
    const transactions = transactionsResponse.data.data.transactions;
    
    const userTransactions = transactions.filter(tx => tx.userId === testUser.id);
    const profitTransaction = userTransactions.find(tx => tx.type === 'profit');
    
    if (profitTransaction) {
      console.log(`✅ Profit transaction found:`);
      console.log(`   Amount: ${profitTransaction.amount} KSH`);
      console.log(`   Status: ${profitTransaction.status}`);
      console.log(`   Description: ${profitTransaction.description}`);
    } else {
      console.log('❌ No profit transaction found');
    }

    // 5. Final verification
    console.log('\n5️⃣ Final verification...');
    const finalUserResponse = await axios.get(`${API_BASE_URL}/mpesa-bot/users`);
    const finalUser = finalUserResponse.data.data.users.find(u => u.id === testUser.id);
    
    console.log(`📊 Final Results:`);
    console.log(`   Original Balance: ${testUser.balance} KSH`);
    console.log(`   Amount Added: 5000 KSH`);
    console.log(`   Expected Profit: 3000 KSH (60% of 5000)`);
    console.log(`   Expected Final Balance: ${testUser.balance + 5000 + 3000} KSH`);
    console.log(`   Actual Final Balance: ${finalUser.balance} KSH`);
    
    if (finalUser.balance === testUser.balance + 5000 + 3000) {
      console.log('🎉 SUCCESS: Balance update with automatic investment and profit works correctly!');
    } else {
      console.log('❌ FAILED: Final balance does not match expected value');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testBalanceUpdate(); 