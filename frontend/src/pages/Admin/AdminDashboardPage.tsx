import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Container, Header, Title, Subtitle, Button } from '../../styles/components';
import { theme } from '../../styles/theme';
import { authService } from '../../services/singletonAuthService';
import { investmentService } from '../../services/singletonInvestmentService';
import { transactionService } from '../../services/transactionService';
import { User, Investment, Transaction } from '../../types';
import { useNavigate } from 'react-router-dom';

const AdminGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 30px;
`;

const StatCard = styled.div`
  padding: 25px;
  background: ${theme.gradients.primary};
  color: white;
  transition: ${theme.transition};
  border-radius: ${theme.borderRadius};
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${theme.shadows.heavy};
  }
`;

const DetailCard = styled.div`
  margin-top: 30px;
  padding: 25px;
  background: white;
  border-radius: ${theme.borderRadius};
  box-shadow: ${theme.shadows.light};
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  margin: 10px 0;
`;

const StatLabel = styled.div`
  font-size: 1.1rem;
  opacity: 0.9;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  
  th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #eee;
  }

  th {
    font-weight: 600;
    color: ${theme.colors.textPrimary};
  }

  td {
    color: ${theme.colors.textSecondary};
  }
  @media (max-width: 600px) {
    display: block;
    thead {
      display: none;
    }
    tbody {
      display: block;
      width: 100%;
    }
    tr {
      display: block;
      margin-bottom: 1.5em;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.03);
      padding: 10px;
    }
    td {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border: none;
      border-bottom: 1px solid #f0f0f0;
      position: relative;
    }
    td:before {
      content: attr(data-label);
      font-weight: 600;
      color: ${theme.colors.textPrimary};
      flex-basis: 50%;
      text-align: left;
    }
  }
`;

const ActionButton = styled(Button)`
  margin-top: 20px;
  background: ${theme.gradients.accent};
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 2px solid #eee;
  border-radius: 8px;
  margin: 10px 0;
  font-size: 1rem;

  &:focus {
    border-color: ${theme.colors.highlight};
    outline: none;
  }
`;

const SearchContainer = styled.div`
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  align-items: center;
`;

const SearchInput = styled(Input)`
  flex: 1;
  max-width: 300px;
`;

const NotificationBadge = styled.span`
  background: ${theme.colors.error};
  color: white;
  border-radius: 50%;
  padding: 4px 8px;
  font-size: 0.8rem;
  margin-left: 10px;
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  background: ${props => {
    switch (props.status) {
      case 'completed': return '#4CAF50';
      case 'trading': return '#2196F3';
      case 'pending': return '#FF9800';
      case 'paid': return '#4CAF50';
      default: return '#9E9E9E';
    }
  }};
  color: white;
`;

// Add styled UserCard for admin dashboard
const UserCard = styled.div`
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.07);
  padding: 24px 20px;
  margin-bottom: 24px;
  transition: box-shadow 0.2s;
  &:hover {
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  }
`;
const UserLabel = styled.span`
  font-weight: 600;
  color: #888;
`;
const UserValue = styled.span`
  color: #222;
`;

const AdminDashboardPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedView, setSelectedView] = useState<'overview' | 'users' | 'investments' | 'transactions' | 'active' | 'pending-payments' | 'pending-withdrawals'>('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInvestments: 0,
    totalTransactions: 0,
    activeInvestments: 0,
    pendingPayments: 0,
    expiredInvestments: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pendingPayments, setPendingPayments] = useState<Investment[]>([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<Transaction[]>([]);
  const [searchPhone, setSearchPhone] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [tradeAmount, setTradeAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'warning' | 'info';
    message: string;
    timestamp: Date;
  }>>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        
        if (currentUser && currentUser.role === 'admin') {
          setUser(currentUser);
        } else {
          console.error('User is not admin or not found');
          // Don't redirect here, let the AdminRoute handle it
        }
      } catch (err) {
        console.error('Error checking user:', err);
        // Don't redirect here, let the AdminRoute handle it
      }
    };

    checkUser();
  }, []);

  useEffect(() => {
    if (!user) return; // Don't fetch data if no user

    // Fetch initial data
    const fetchData = async () => {
      try {
        setLoading(true);
        const [allUsers, allInvestments, allTransactions, statsData, pendingData] = await Promise.all([
          investmentService.getAllUsers(),
          investmentService.getAllInvestments(),
          Promise.resolve(investmentService.getAllTransactions()),
          investmentService.getInvestmentStats(),
          investmentService.getCompletedPendingPayments()
        ]);

        // Fetch pending withdrawals
        const pendingWithdrawalsData = await transactionService.getPendingWithdrawals();

        setUsers(allUsers);
        setInvestments(allInvestments);
        setTransactions(allTransactions);
        setPendingPayments(pendingData);
        setPendingWithdrawals(pendingWithdrawalsData);
        setStats({
          totalUsers: allUsers.length,
          totalInvestments: allInvestments.length,
          totalTransactions: allTransactions.length,
          activeInvestments: statsData.activeInvestments,
          pendingPayments: statsData.pendingPayments,
          expiredInvestments: statsData.expiredInvestments,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh data every minute
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [user]); // Rerun when user is set

  // Refresh data periodically
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(async () => {
      try {
        const [statsData, pendingData, expiredData] = await Promise.all([
          investmentService.getInvestmentStats(),
          investmentService.getCompletedPendingPayments(),
          investmentService.getExpiredInvestments()
        ]);
        
        setStats(prev => ({
          ...prev,
          ...statsData
        }));
        setPendingPayments(pendingData);
        
        // Notify if there are expired investments
        if (expiredData.length > 0 && expiredData.length !== stats.expiredInvestments) {
          addNotification('warning', `${expiredData.length} investments have expired and need completion!`);
        }
        
        // Notify if there are pending payments
        if (pendingData.length > 0 && pendingData.length !== stats.pendingPayments) {
          addNotification('info', `${pendingData.length} payments are pending approval!`);
        }
        
      } catch (error) {
        console.error('Periodic refresh failed:', error);
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [user, stats.expiredInvestments, stats.pendingPayments]);

  const handleSearchUsers = async () => {
    if (!searchPhone.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await investmentService.searchUsersByPhone(searchPhone);
      setSearchResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    }
  };

  const handleApprovePayment = async (investmentId: string) => {
    try {
      await investmentService.approvePayment(investmentId);
      // Refresh pending payments
      const pendingData = await investmentService.getCompletedPendingPayments();
      setPendingPayments(pendingData);
      // Refresh stats
      const statsData = await investmentService.getInvestmentStats();
      setStats(prev => ({
        ...prev,
        pendingPayments: statsData.pendingPayments,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve payment');
    }
  };

  const handleUpdateUserBalance = async (userId: string, newBalance: number) => {
    try {
      const user = await investmentService.updateUserBalance(userId, newBalance);
      
      // Calculate the amount that was added and the profit
      const originalBalance = users.find(u => u.id === userId)?.balance || 0;
      const amountAdded = newBalance - originalBalance;
      const profitAmount = amountAdded > 0 ? amountAdded * 0.6 : 0;
      
      // Refresh data
      const [allUsers, allInvestments] = await Promise.all([
        investmentService.getAllUsers(),
        investmentService.getAllInvestments()
      ]);
      setUsers(allUsers);
      setInvestments(allInvestments);
      
      // Add detailed notification
      if (amountAdded > 0) {
        addNotification('success', `✅ ${user.name} balance updated! Investment of ${amountAdded} KSH created with ${profitAmount} KSH profit automatically added. Final balance: ${user.balance} KSH`);
      } else {
        addNotification('success', `Balance updated for ${user.name} to ${newBalance} KSH`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update balance');
      addNotification('warning', 'Failed to update balance');
    }
  };

  const addNotification = (type: 'success' | 'warning' | 'info', message: string) => {
    const notification = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      message,
      timestamp: new Date()
    };
    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep only last 5 notifications
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const handleCompleteExpiredInvestments = async () => {
    try {
      const result = await investmentService.completeExpiredInvestments();
      
      // Add notification about completed investments
      if (result && result.completedCount > 0) {
        addNotification('success', `${result.completedCount} investments completed! Total profit distributed: ${result.totalProfit} KSH`);
      } else {
        addNotification('info', 'No expired investments found to complete.');
      }
      
      // Refresh data
      const [allInvestments, statsData, pendingData] = await Promise.all([
        investmentService.getAllInvestments(),
        investmentService.getInvestmentStats(),
        investmentService.getCompletedPendingPayments()
      ]);
      setInvestments(allInvestments);
      setPendingPayments(pendingData);
      setStats(prev => ({
        ...prev,
        expiredInvestments: statsData.expiredInvestments,
        pendingPayments: statsData.pendingPayments,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete expired investments');
      addNotification('warning', 'Failed to complete expired investments');
    }
  };

  const handleCreateTrade = async () => {
    if (!user) return;
    try {
      const amount = parseFloat(tradeAmount);
      if (isNaN(amount) || amount <= 0) {
        setError('Invalid trade amount');
        return;
      }

      await investmentService.createTrade(user.id, amount);
      setTradeAmount('');
      // Refresh investments or give feedback
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create trade');
    }
  };

  const handleWithdrawInvestment = async (investmentId: string) => {
    try {
      await investmentService.updateInvestmentStatus(investmentId, 'completed');
      // Refresh data
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to withdraw investment');
    }
  };

  const handleApproveWithdrawal = async (transactionId: string) => {
    try {
      console.log('Approving withdrawal for transaction ID:', transactionId);
      console.log('Transaction ID type:', typeof transactionId);
      console.log('Transaction ID value:', transactionId);
      
      if (!transactionId || transactionId === 'undefined' || transactionId === 'null') {
        throw new Error('Invalid transaction ID provided');
      }
      
      const transaction = await transactionService.approveWithdrawal(transactionId);
      // Remove the approved transaction from the list
      setPendingWithdrawals(prev => prev.filter(tx => tx.id !== transactionId));
      // Refresh data to update stats
      window.location.reload();
      
      // Add notification
      addNotification('success', `Withdrawal of ${transaction.amount} KSH approved successfully!`);
    } catch (err) {
      console.error('Error approving withdrawal:', err);
      setError(err instanceof Error ? err.message : 'Failed to approve withdrawal');
      addNotification('warning', 'Failed to approve withdrawal');
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const formatMoney = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  const renderDetailView = () => {
    switch (selectedView) {
      case 'users':
        return (
          <DetailCard>
            <h2>User Management</h2>
            <SearchContainer>
              <SearchInput
                type="text"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                placeholder="Search by phone number"
              />
              <Button onClick={handleSearchUsers}>Search</Button>
            </SearchContainer>
            
            {searchResults.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h3>Search Results</h3>
                <Table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Balance</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map(user => (
                      <tr key={user.id}>
                        <td data-label="Name">{user.name}</td>
                        <td data-label="Email">{user.email}</td>
                        <td data-label="Phone">{user.phone}</td>
                        <td data-label="Balance">{formatMoney(user.balance)}</td>
                        <td>
                          <Input
                            type="number"
                            placeholder="New balance"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                const input = e.target as HTMLInputElement;
                                handleUpdateUserBalance(user.id, parseFloat(input.value));
                              }
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}

            <Table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Balance</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td data-label="Name">{user.name}</td>
                    <td data-label="Email">{user.email}</td>
                    <td data-label="Phone">{user.phone}</td>
                    <td data-label="Role">{user.role}</td>
                    <td data-label="Balance">{formatMoney(user.balance)}</td>
                    <td data-label="Joined">{formatDate(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </DetailCard>
        );

      case 'investments':
        return (
          <DetailCard>
            <h2>Investment Management</h2>
            <Table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Amount</th>
                  <th>Profit</th>
                  <th>Status</th>
                  <th>Payment Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {investments.map(investment => (
                  <tr key={investment.id}>
                    <td>{users.find(u => u.id === investment.userId)?.name}</td>
                    <td>{formatMoney(investment.amount)}</td>
                    <td>{formatMoney(investment.profitAmount)}</td>
                    <td>
                      <StatusBadge status={investment.status}>
                        {investment.status}
                      </StatusBadge>
                    </td>
                    <td>
                      <StatusBadge status={investment.paymentStatus}>
                        {investment.paymentStatus}
                      </StatusBadge>
                    </td>
                    <td>{formatDate(investment.createdAt)}</td>
                    <td>
                      {investment.status === 'active' && (
                        <Button onClick={() => handleWithdrawInvestment(investment.id)}>
                          Withdraw for Trading
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <div style={{ marginTop: '20px' }}>
              <h3>Create Trade</h3>
              <Input
                type="number"
                value={tradeAmount}
                onChange={(e) => setTradeAmount(e.target.value)}
                placeholder="Enter trade amount"
              />
              {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
              <ActionButton onClick={handleCreateTrade}>Complete Trade & Distribute Profits</ActionButton>
            </div>
          </DetailCard>
        );

      case 'pending-payments':
        return (
          <DetailCard>
            <h2>Pending Payments</h2>
            <p>Completed investments waiting for payment approval</p>
            <Table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Phone</th>
                  <th>Investment Amount</th>
                  <th>Profit Amount</th>
                  <th>Total Due</th>
                  <th>Completed Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingPayments.map(investment => {
                  const user = users.find(u => u.id === investment.userId);
                  return (
                    <tr key={investment.id}>
                      <td>{user?.name}</td>
                      <td>{user?.phone}</td>
                      <td>{formatMoney(investment.amount)}</td>
                      <td>{formatMoney(investment.profitAmount)}</td>
                      <td>{formatMoney(investment.amount + investment.profitAmount)}</td>
                      <td>{investment.profitPaidAt ? formatDate(investment.profitPaidAt) : 'N/A'}</td>
                      <td>
                        <Button 
                          onClick={() => handleApprovePayment(investment.id)}
                          style={{ background: theme.colors.success }}
                        >
                          Mark as Paid
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            {pendingPayments.length === 0 && (
              <p style={{ textAlign: 'center', color: theme.colors.textSecondary }}>
                No pending payments
              </p>
            )}
          </DetailCard>
        );

      case 'pending-withdrawals':
        return (
          <DetailCard>
            <h2>Pending Withdrawals</h2>
            <p>Withdrawal requests waiting for approval</p>
            <Table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Phone</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingWithdrawals.map(transaction => {
                  if (!transaction.id) {
                    console.error('Transaction missing ID:', transaction);
                    return null; // Skip rendering this transaction
                  }
                  // Robustly find the user: by id if string, else by name and phone if object
                  let user: User | undefined;
                  if (typeof transaction.userId === 'string') {
                    user = users.find(u => u.id === transaction.userId);
                  } else if (transaction.userId && typeof transaction.userId === 'object') {
                    user = users.find(u =>
                      typeof transaction.userId === 'object' &&
                      u.name === transaction.userId.name &&
                      u.phone === transaction.userId.phone
                    );
                  }
                  return (
                    <tr key={transaction.id}>
                      <td>{user ? user.name : 'Unknown'}</td>
                      <td>{user ? user.phone : 'Unknown'}</td>
                      <td>{formatMoney(transaction.amount)}</td>
                      <td>{formatDate(transaction.createdAt)}</td>
                      <td>
                        <Button 
                          onClick={() => handleApproveWithdrawal(transaction.id)}
                          style={{ background: theme.colors.success }}
                        >
                          Approve Withdrawal
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            {pendingWithdrawals.length === 0 && (
              <p style={{ textAlign: 'center', color: theme.colors.textSecondary }}>
                No pending withdrawals
              </p>
            )}
          </DetailCard>
        );

      case 'transactions':
        return (
          <DetailCard>
            <h2>Transaction History</h2>
            <Table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(transaction => (
                  <tr key={transaction.id}>
                    <td>{users.find(u => u.id === transaction.userId)?.name}</td>
                    <td>{transaction.type}</td>
                    <td>{formatMoney(transaction.amount)}</td>
                    <td>{transaction.status}</td>
                    <td>{formatDate(transaction.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </DetailCard>
        );

      case 'active':
        return (
          <DetailCard>
            <h2>Active Investments</h2>
            <Button 
              onClick={handleCompleteExpiredInvestments}
              style={{ marginBottom: '20px', background: theme.colors.warning }}
            >
              Complete Expired Investments
            </Button>
            <Table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Amount</th>
                  <th>Expected Profit</th>
                  <th>Created</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {investments
                  .filter(inv => inv.status === 'trading')
                  .map(investment => {
                    const user = users.find(u => u.id === investment.userId);
                    return (
                      <tr key={investment.id}>
                        <td>{user?.name}</td>
                        <td>{formatMoney(investment.amount)}</td>
                        <td>{formatMoney(investment.profitAmount)}</td>
                        <td>{formatDate(investment.createdAt)}</td>
                        <td>{investment.expiryDate ? formatDate(investment.expiryDate) : 'N/A'}</td>
                        <td>
                          <StatusBadge status={investment.status}>
                            {investment.status}
                          </StatusBadge>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </Table>
          </DetailCard>
        );

      default:
        return null;
    }
  };

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/';
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
        <Title>Admin Dashboard</Title>
        <Subtitle>Welcome, {user?.name || 'Admin'}</Subtitle>
        <Button onClick={handleLogout} style={{ position: 'absolute', top: '20px', right: '20px' }}>Logout</Button>
      </Header>

      {error && (
        <div style={{ 
          background: theme.colors.error, 
          color: 'white', 
          padding: '10px', 
          borderRadius: '8px', 
          marginBottom: '20px' 
        }}>
          {error}
        </div>
      )}

      {/* Notifications */}
      {notifications.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          {notifications.map(notification => (
            <div
              key={notification.id}
              style={{
                background: notification.type === 'success' ? '#4CAF50' : 
                           notification.type === 'warning' ? '#FF9800' : '#2196F3',
                color: 'white',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                animation: 'slideIn 0.3s ease-out'
              }}
            >
              <span>{notification.message}</span>
              <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                {notification.timestamp.toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      )}

      <AdminGrid>
        <StatCard onClick={() => setSelectedView('users')}>
          <StatLabel>Total Users</StatLabel>
          <StatValue>{stats.totalUsers}</StatValue>
        </StatCard>
        <StatCard onClick={() => setSelectedView('investments')}>
          <StatLabel>Total Investments</StatLabel>
          <StatValue>{stats.totalInvestments}</StatValue>
        </StatCard>
        <StatCard onClick={() => setSelectedView('transactions')}>
          <StatLabel>Total Transactions</StatLabel>
          <StatValue>{stats.totalTransactions}</StatValue>
        </StatCard>
        <StatCard onClick={() => setSelectedView('active')}>
          <StatLabel>Active Investments</StatLabel>
          <StatValue>{stats.activeInvestments}</StatValue>
        </StatCard>
        <StatCard onClick={() => setSelectedView('pending-payments')}>
          <StatLabel>
            Pending Payments
            {stats.pendingPayments > 0 && (
              <NotificationBadge>{stats.pendingPayments}</NotificationBadge>
            )}
          </StatLabel>
          <StatValue>{stats.pendingPayments}</StatValue>
        </StatCard>
        <StatCard onClick={() => setSelectedView('pending-withdrawals')}>
          <StatLabel>
            Pending Withdrawals
            {pendingWithdrawals.length > 0 && (
              <NotificationBadge>{pendingWithdrawals.length}</NotificationBadge>
            )}
          </StatLabel>
          <StatValue>{pendingWithdrawals.length}</StatValue>
        </StatCard>
        <StatCard onClick={() => navigate('/admin/mpesa-bot')}>
          <StatLabel>🤖 MPESA Bot</StatLabel>
          <StatValue>Manage</StatValue>
        </StatCard>
      </AdminGrid>

      {renderDetailView()}
    </Container>
  );
};

export default AdminDashboardPage; 