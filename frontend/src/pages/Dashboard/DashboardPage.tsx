import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Container, Header, Title, Subtitle, Button } from '../../styles/components';
import { theme, animations } from '../../styles/theme';
import { authService } from '../../services/singletonAuthService';
import { transactionService } from '../../services/transactionService';
import { User } from '../../types';
import { API_BASE_URL } from '../../services/config';

// Styled components for dashboard
const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
  margin: 40px 0;
  animation: ${animations.fadeInScale} 0.8s ease-out;
`;

const BalanceCard = styled.div`
  background: ${theme.colors.glass};
  backdrop-filter: blur(20px);
  border-radius: ${theme.borderRadius};
  padding: 30px;
  text-align: center;
  border: 1px solid ${theme.colors.glassBorder};
  color: ${theme.colors.white};
  transition: ${theme.transition};

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${theme.shadows.heavy};
  }
`;

const BalanceValue = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  margin: 10px 0;
  background: ${theme.gradients.accent};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const ActionCard = styled.div`
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(20px);
  border-radius: ${theme.borderRadius};
  padding: 30px;
  transition: ${theme.transition};

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${theme.shadows.heavy};
  }
`;

const ActionTitle = styled.h3`
  font-size: 1.5rem;
  color: ${theme.colors.textPrimary};
  margin: 0 0 20px 0;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 2px solid #eee;
  border-radius: 8px;
  font-size: 1rem;
  margin-bottom: 15px;
  transition: ${theme.transition};

  &:focus {
    border-color: ${theme.colors.highlight};
    outline: none;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  margin: 10px 0;
  font-size: 0.9rem;
`;

const SuccessMessage = styled.div`
  color: #2ecc71;
  margin: 10px 0;
  font-size: 0.9rem;
`;

interface Investment {
  id: string;
  amount: number;
  status: 'active' | 'completed';
  profit: number;
  createdAt: Date;
  completedAt?: Date;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'profit';
  amount: number;
  date: Date;
  status: string;
}

const TransactionHistory: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => (
  <ActionCard>
    <ActionTitle>Transaction History</ActionTitle>
    <div style={{ maxHeight: 350, overflowY: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f6f6f6' }}>
            <th style={{ padding: 12, borderRadius: 8, textAlign: 'left' }}>Type</th>
            <th style={{ padding: 12, textAlign: 'left' }}>Amount</th>
            <th style={{ padding: 12, textAlign: 'left' }}>Status</th>
            <th style={{ padding: 12, textAlign: 'left' }}>Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(tx => (
            <tr key={tx.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: 12, color: tx.type === 'withdrawal' ? '#c0392b' : tx.type === 'deposit' ? '#2980b9' : '#27ae60', fontWeight: 600 }}>
                {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
              </td>
              <td style={{ padding: 12 }}>{tx.amount} KSH</td>
              <td style={{ 
                padding: 12, 
                color: tx.status === 'pending' ? '#f39c12' : 
                       tx.status === 'completed' ? '#27ae60' : 
                       tx.status === 'failed' ? '#e74c3c' : '#95a5a6',
                fontWeight: tx.status === 'pending' ? 600 : 400
              }}>
                {tx.status === 'pending' ? '⏳ Pending Approval' : 
                 tx.status === 'completed' ? '✅ Completed' : 
                 tx.status === 'failed' ? '❌ Failed' : 
                 tx.status === 'principal + profit credited' ? '💰 Profit Credited' :
                 tx.status}
              </td>
              <td style={{ padding: 12 }}>{tx.date.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {transactions.length === 0 && (
        <div style={{ textAlign: 'center', color: '#888', marginTop: 20 }}>No transactions yet.</div>
      )}
    </div>
  </ActionCard>
);

const DashboardPage: React.FC = () => {
  const [balance, setBalance] = useState(0);
  const [showInvest, setShowInvest] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [error, setError] = useState('');
  const [depositError, setDepositError] = useState('');
  const [depositSuccess, setDepositSuccess] = useState('');
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState('');
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const timersRef = useRef<{ [id: string]: NodeJS.Timeout }>({});

  // Function to refresh balance from backend
  const refreshBalance = async () => {
    try {
      console.log('Refreshing balance from backend...');
      const user = await authService.getCurrentUser();
      console.log('User data from backend:', user);
      if (user && user.balance !== undefined) {
        console.log('Setting balance to:', user.balance);
        console.log('Previous balance was:', balance);
        setBalance(user.balance);
        
        // Debug: Log all transactions to understand balance calculation
        console.log('Current transactions:', transactions);
        const totalDeposits = transactions.filter(tx => tx.type === 'deposit' && tx.status === 'completed').reduce((sum, tx) => sum + tx.amount, 0);
        const totalProfits = transactions.filter(tx => tx.type === 'profit' && tx.status === 'completed').reduce((sum, tx) => sum + tx.amount, 0);
        const totalWithdrawals = transactions.filter(tx => tx.type === 'withdrawal' && tx.status === 'completed').reduce((sum, tx) => sum + tx.amount, 0);
        console.log('Transaction totals - Deposits:', totalDeposits, 'Profits:', totalProfits, 'Withdrawals:', totalWithdrawals);
        console.log('Expected balance:', totalDeposits + totalProfits - totalWithdrawals);
      } else {
        console.log('No user data or balance not available');
      }
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    }
  };

  // Function to load user's transaction history from backend
  const loadTransactions = async () => {
    try {
      console.log('Loading transactions from backend...');
      const backendTransactions = await transactionService.getUserTransactions();
      console.log('Backend transactions:', backendTransactions);
      
      // Convert backend transactions to local format
      const localTransactions = backendTransactions.map(tx => ({
        id: tx.id,
        type: tx.type, // Backend types already match local types
        amount: tx.amount,
        date: new Date(tx.createdAt),
        status: tx.status,
      }));
      
      setTransactions(localTransactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  };

  // Function to load user's investments from backend
  const loadInvestments = async () => {
    try {
      console.log('Loading investments from backend...');
      const response = await fetch(`${API_BASE_URL}/investments/my-investments`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Backend investments:', data.data.investments);
        
        // Convert backend investments to local format
        const localInvestments = data.data.investments.map((inv: any) => ({
          id: inv._id,
          amount: inv.amount,
          status: inv.status,
          profit: inv.profitAmount,
          createdAt: new Date(inv.createdAt),
          completedAt: inv.profitPaidAt ? new Date(inv.profitPaidAt) : undefined,
        }));
        
        setInvestments(localInvestments);
      }
    } catch (error) {
      console.error('Failed to load investments:', error);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        setCurrentUser(user);
        
        // Set the balance from the user data fetched from backend
        if (user && user.balance !== undefined) {
          setBalance(user.balance);
        }
        
        // Load user's transaction history and investments
        await Promise.all([loadTransactions(), loadInvestments()]);
      } catch (error) {
        console.error('Auth check failed:', error);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    // Initial balance fetch
    refreshBalance();
    // Set up polling every 10 seconds
    const interval = setInterval(() => {
      refreshBalance();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Auto-credit profit after 10 seconds for each active investment
  useEffect(() => {
    investments.forEach((inv) => {
      if (inv.status === 'active' && !timersRef.current[inv.id]) {
        timersRef.current[inv.id] = setTimeout(async () => {
          try {
            // Check if profit transaction already exists for this investment
            const existingProfitTx = transactions.find(tx => 
              tx.type === 'profit' && tx.amount === inv.amount + inv.profit
            );
            
            if (existingProfitTx) {
              console.log('Profit transaction already exists for this investment');
              return;
            }
            
            // Create profit transaction in backend first
            const profitTransaction = await transactionService.createTransaction('profit', inv.amount + inv.profit);
            
            // Update local state
            setInvestments((prev) =>
              prev.map((i) =>
                i.id === inv.id
                  ? { ...i, status: 'completed', completedAt: new Date() }
                  : i
              )
            );
            
            // Add transaction to local list with backend data
            setTransactions((prev) => [
              {
                id: profitTransaction.id,
                type: 'profit',
                amount: inv.amount + inv.profit,
                date: new Date(profitTransaction.createdAt),
                status: 'completed',
              },
              ...prev,
            ]);
            
            // Refresh balance from backend to get the updated balance
            setTimeout(() => {
              refreshBalance();
            }, 500);
            
          } catch (error) {
            console.error('Failed to create profit transaction:', error);
            // Fallback: update local balance immediately for better UX
            setBalance((prev) => prev + inv.amount + inv.profit);
            setTransactions((prev) => [
              {
                id: Math.random().toString(36).substr(2, 9),
                type: 'profit',
                amount: inv.amount + inv.profit,
                date: new Date(),
                status: 'principal + profit credited',
              },
              ...prev,
            ]);
          }
          
          delete timersRef.current[inv.id];
        }, 10000); // 10 seconds
      }
    });
    // Cleanup on unmount
    return () => {
      Object.values(timersRef.current).forEach(clearTimeout);
    };
  }, [investments]);

  const handleInvest = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt < 1000) {
      setError('Minimum investment is 1,000 KSH');
      return;
    }
    if (amt > balance) {
      setError('Insufficient balance. Please deposit first.');
      return;
    }
    setError('');
    
    try {
      // Create investment in backend first
      const investment = await fetch(`${API_BASE_URL}/investments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ amount: amt }),
      });
      
      if (!investment.ok) {
        throw new Error('Failed to create investment');
      }
      
      const investmentData = await investment.json();
      
      // Update local state with backend data
      setBalance(balance - amt);
      setInvestments([
        ...investments,
        {
          id: investmentData.data.investment._id,
          amount: amt,
          status: 'active',
          profit: Math.round(amt * 0.6),
          createdAt: new Date(investmentData.data.investment.createdAt),
        },
      ]);
      
      // Add investment to local transactions (not a deposit transaction)
      setTransactions([
        {
          id: investmentData.data.investment._id,
          type: 'deposit', // Using deposit type for investment display
          amount: amt,
          date: new Date(investmentData.data.investment.createdAt),
          status: 'active',
        },
        ...transactions,
      ]);
      
      setAmount('');
      setShowInvest(false);
      
      // Refresh balance from backend to ensure consistency
      setTimeout(() => {
        refreshBalance();
      }, 1000);
      
    } catch (error: any) {
      console.error('Investment failed:', error);
      setError(error.message || 'Investment failed. Please try again.');
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt < 1000) {
      setDepositError('Minimum deposit is 1,000 KSH');
      setDepositSuccess('');
      return;
    }
    
    setDepositError('');
    setDepositSuccess('Processing deposit request...');
    
    try {
      // Create manual deposit request instead of direct transaction
      const response = await fetch(`${API_BASE_URL}/manual-deposits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ amount: amt }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create deposit request');
      }
      
      const data = await response.json();
      
      setDepositSuccess(`Deposit request of ${amt} KSH submitted successfully! Please wait for admin approval.`);
      
      // Add transaction to local list with pending status
      setTransactions([
        {
          id: data.data.requestId || Math.random().toString(36).substr(2, 9),
          type: 'deposit',
          amount: amt,
          date: new Date(),
          status: 'pending',
        },
        ...transactions,
      ]);
      
      setDepositAmount('');
      
      setTimeout(() => {
        setShowDeposit(false);
        setDepositSuccess('');
      }, 3000);
      
    } catch (error: any) {
      console.error('Deposit request failed:', error);
      setDepositError(error.message || 'Deposit request failed. Please try again.');
      setDepositSuccess('');
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      setWithdrawError('Enter a valid amount');
      setWithdrawSuccess('');
      return;
    }
    
    setWithdrawError('');
    setWithdrawSuccess('Processing withdrawal request...');
    
    try {
      // First, refresh balance from backend to ensure we have the latest balance
      await refreshBalance();
      
      // Check balance again after refresh
      if (amt > balance) {
        setWithdrawError('Cannot withdraw more than your balance');
        setWithdrawSuccess('');
        return;
      }
      
      // Call backend API to process withdrawal (will be pending until admin approves)
      const transaction = await transactionService.createTransaction('withdrawal', amt);
      
      // Don't update local balance immediately since withdrawal is pending
      setWithdrawSuccess(`Withdrawal request of ${amt} KSH submitted successfully! Awaiting admin approval.`);
      
      // Add transaction to local list with pending status
      setTransactions([
        {
          id: transaction.id,
          type: 'withdrawal',
          amount: amt,
          date: new Date(transaction.createdAt),
          status: 'pending',
        },
        ...transactions,
      ]);
      
      setWithdrawAmount('');
      
      setTimeout(() => {
        setShowWithdraw(false);
        setWithdrawSuccess('');
      }, 3000);
      
    } catch (error: any) {
      console.error('Withdrawal failed:', error);
      setWithdrawError(error.message || 'Withdrawal failed. Please try again.');
      setWithdrawSuccess('');
    }
  };

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h2>Loading...</h2>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          {currentUser ? `Welcome, ${currentUser.name}` : 'Welcome to your Dashboard'}
        </Title>
        <Subtitle>Manage your investments and view your activity</Subtitle>
      </Header>

      <DashboardGrid>
        <BalanceCard>
          <h3>Available Balance</h3>
          <BalanceValue>{balance} KSH</BalanceValue>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20 }}>
            <Button onClick={() => setShowInvest(true)}>Invest</Button>
            <Button onClick={() => setShowWithdraw(true)}>Withdraw</Button>
            <Button 
              onClick={refreshBalance} 
              style={{ background: theme.colors.warning, fontSize: '0.9rem' }}
            >
              🔄 Refresh
            </Button>
          </div>
        </BalanceCard>

        <ActionCard>
          <ActionTitle>Quick Actions</ActionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            <Button onClick={() => setShowInvest(true)}>Make Investment</Button>
            <Button onClick={() => setShowWithdraw(true)}>Withdraw Funds</Button>
            <Button onClick={() => setShowDeposit(true)}>Deposit Money</Button>
          </div>
        </ActionCard>
      </DashboardGrid>

      {showInvest && (
        <ActionCard style={{ maxWidth: 500, margin: '20px auto' }}>
          <ActionTitle>Make Investment</ActionTitle>
          <form onSubmit={handleInvest}>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount (min 1,000 KSH)"
            />
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <div style={{ display: 'flex', gap: 10 }}>
              <Button type="submit">Confirm Investment</Button>
              <Button onClick={() => setShowInvest(false)} style={{ background: '#eee', color: '#333' }}>
                Cancel
              </Button>
            </div>
          </form>
        </ActionCard>
      )}

      {showDeposit && (
        <ActionCard style={{ maxWidth: 600, margin: '20px auto' }}>
          <ActionTitle>Deposit Money</ActionTitle>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 12,
            padding: 24,
            marginBottom: 20,
            color: 'white',
            fontSize: '1rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', fontWeight: 600 }}>
              📱 MPESA Deposit Instructions
            </h4>
            <div style={{ lineHeight: 1.6 }}>
              <p style={{ margin: '8px 0' }}>
                <strong>Step 1:</strong> Send money to our admin MPESA number:
              </p>
              <div style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '12px 16px',
                borderRadius: 8,
                margin: '12px 0',
                textAlign: 'center',
                fontSize: '1.1rem',
                fontWeight: 600
              }}>
                <span style={{ color: '#ffd700' }}>📞 0105583828</span>
              </div>
              <p style={{ margin: '8px 0' }}>
                <strong>Step 2:</strong> Use your registered phone number for easy identification
              </p>
              <p style={{ margin: '8px 0' }}>
                <strong>Step 3:</strong> Your balance will be automatically updated once payment is received
              </p>
              <div style={{
                background: 'rgba(255,255,255,0.15)',
                padding: '12px',
                borderRadius: 8,
                marginTop: '16px',
                borderLeft: '4px solid #4CAF50'
              }}>
                <strong>📋 Manual Approval:</strong> After sending payment, submit your deposit request below. Admin will verify and approve within minutes!
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.15)',
                padding: '12px',
                borderRadius: 8,
                marginTop: '12px',
                borderLeft: '4px solid #FF9800'
              }}>
                <strong>💡 Investment Ready:</strong> Once approved, you can immediately invest your balance with 60% profit after 24 hours!
              </div>
            </div>
          </div>
          
          <div style={{
            background: '#f8f9fa',
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
            border: '1px solid #e9ecef'
          }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#495057' }}>Manual Confirmation (Optional)</h5>
            <p style={{ margin: 0, color: '#6c757d', fontSize: '0.9rem' }}>
              If you prefer manual confirmation, enter the amount below after sending the money.
            </p>
          </div>

          <form onSubmit={handleDeposit}>
            <Input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="Enter amount to deposit (optional)"
            />
            {depositError && <ErrorMessage>{depositError}</ErrorMessage>}
            {depositSuccess && <SuccessMessage>{depositSuccess}</SuccessMessage>}
            <div style={{ display: 'flex', gap: 10 }}>
              <Button type="submit" style={{ flex: 1 }}>Confirm Manual Deposit</Button>
              <Button onClick={() => setShowDeposit(false)} style={{ background: '#eee', color: '#333' }}>
                Close
              </Button>
            </div>
          </form>
        </ActionCard>
      )}

      {showWithdraw && (
        <ActionCard style={{ maxWidth: 500, margin: '20px auto' }}>
          <ActionTitle>Withdraw Funds</ActionTitle>
          <div style={{
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
            color: 'white',
            fontSize: '0.95rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
          }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', fontWeight: 600 }}>
              ⚠️ Withdrawal Process
            </h4>
            <div style={{ lineHeight: 1.5 }}>
              <p style={{ margin: '6px 0' }}>
                <strong>Step 1:</strong> Submit your withdrawal request below
              </p>
              <p style={{ margin: '6px 0' }}>
                <strong>Step 2:</strong> Admin will review and approve your request
              </p>
              <p style={{ margin: '6px 0' }}>
                <strong>Step 3:</strong> Funds will be sent to your registered MPESA number
              </p>
              <div style={{
                background: 'rgba(255,255,255,0.15)',
                padding: '10px',
                borderRadius: 6,
                marginTop: '12px',
                borderLeft: '3px solid #FFD700'
              }}>
                <strong>⏱️ Processing Time:</strong> Usually within 24 hours during business days
              </div>
            </div>
          </div>
          <form onSubmit={handleWithdraw}>
            <Input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Enter amount to withdraw"
            />
            {withdrawError && <ErrorMessage>{withdrawError}</ErrorMessage>}
            {withdrawSuccess && <SuccessMessage>{withdrawSuccess}</SuccessMessage>}
            <div style={{ display: 'flex', gap: 10 }}>
              <Button type="submit">Submit Withdrawal Request</Button>
              <Button onClick={() => setShowWithdraw(false)} style={{ background: '#eee', color: '#333' }}>
                Cancel
              </Button>
            </div>
          </form>
        </ActionCard>
      )}

      <TransactionHistory transactions={transactions} />
    </Container>
  );
};

export default DashboardPage; 