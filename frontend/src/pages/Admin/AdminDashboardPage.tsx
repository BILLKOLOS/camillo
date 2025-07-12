import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Container, Header, Title, Subtitle, Button } from '../../styles/components';
import { theme } from '../../styles/theme';
import { authService } from '../../services/singletonAuthService';
import { investmentService } from '../../services/investmentService';
import { transactionService } from '../../services/transactionService';
import { User, Investment, Transaction } from '../../types';
import { API_BASE_URL } from '../../services/config';
import { useNavigate } from 'react-router-dom';
import { manualDepositService } from '../../services/manualDepositService';

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
  transition: box-shadow 0.3s ease;
  animation: slideInUp 0.5s ease-out;
  
  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const BackToOverviewButton = styled(Button)`
  position: fixed;
  top: 100px;
  right: 20px;
  z-index: 1000;
  background: ${theme.gradients.primary};
  box-shadow: ${theme.shadows.heavy};
  animation: slideInRight 0.3s ease-out;
  
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;

const ScrollToTopButton = styled(Button)`
  position: fixed;
  bottom: 30px;
  right: 20px;
  z-index: 1000;
  background: ${theme.gradients.accent};
  box-shadow: ${theme.shadows.heavy};
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  animation: slideInUp 0.3s ease-out;
  
  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
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
  const [selectedView, setSelectedView] = useState<'overview' | 'users' | 'investments' | 'transactions' | 'active' | 'pending-payments' | 'pending-withdrawals' | 'manual-deposits' | 'user-deposits' | 'total-investments'>('overview');
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
  const [manualDeposits, setManualDeposits] = useState<any[]>([]);
  const [manualDepositsLoading, setManualDepositsLoading] = useState(false);
  const [manualDepositsError, setManualDepositsError] = useState('');
  
  // New state for the three major transaction types
  const [userDeposits, setUserDeposits] = useState<any[]>([]);
  const [totalInvestments, setTotalInvestments] = useState<Investment[]>([]);
  const [pendingWithdrawalsInvestments, setPendingWithdrawalsInvestments] = useState<Investment[]>([]);
  const [loadingUserDeposits, setLoadingUserDeposits] = useState(false);
  const [loadingTotalInvestments, setLoadingTotalInvestments] = useState(false);
  const [loadingPendingWithdrawals, setLoadingPendingWithdrawals] = useState(false);
  
  // New state for tracking last view time and new completed investments
  const [lastTotalInvestmentsView, setLastTotalInvestmentsView] = useState<Date | null>(null);
  const [newCompletedInvestmentsCount, setNewCompletedInvestmentsCount] = useState(0);
  
  // State for scroll-to-top button
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  
  // Refs for automatic scrolling
  const detailViewRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Debug useEffect to log state changes
  useEffect(() => {
    console.log('🔍 Debug - State values:', {
      newCompletedInvestmentsCount,
      lastTotalInvestmentsView: lastTotalInvestmentsView?.toISOString(),
      selectedView
    });
  }, [newCompletedInvestmentsCount, lastTotalInvestmentsView, selectedView]);

  // Handler for Total Investments card click
  const navigate = useNavigate();

  // Function to scroll to detail view when a section is opened
  const scrollToDetailView = () => {
    if (detailViewRef.current && selectedView !== 'overview') {
      console.log('📜 Scrolling to detail view...');
      
      // Show a temporary scroll indicator
      const scrollIndicator = document.createElement('div');
      scrollIndicator.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(33, 150, 243, 0.9);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        font-size: 14px;
        animation: fadeIn 0.3s ease-out;
      `;
      scrollIndicator.textContent = '📜 Scrolling to section...';
      document.body.appendChild(scrollIndicator);
      
      setTimeout(() => {
        detailViewRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
        
        // Add a subtle visual feedback
        if (detailViewRef.current) {
          detailViewRef.current.style.boxShadow = '0 0 20px rgba(33, 150, 243, 0.3)';
          setTimeout(() => {
            if (detailViewRef.current) {
              detailViewRef.current.style.boxShadow = '';
            }
          }, 1000);
        }
        
        // Remove the scroll indicator after scrolling completes
        setTimeout(() => {
          if (document.body.contains(scrollIndicator)) {
            document.body.removeChild(scrollIndicator);
          }
        }, 1500);
      }, 100); // Small delay to ensure the content is rendered
    }
  };

  // Function to scroll to top when notifications appear
  const scrollToTop = () => {
    if (containerRef.current) {
      console.log('📜 Scrolling to top for notifications...');
      
      // Show a temporary scroll indicator
      const scrollIndicator = document.createElement('div');
      scrollIndicator.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(76, 175, 80, 0.9);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        font-size: 14px;
        animation: fadeIn 0.3s ease-out;
      `;
      scrollIndicator.textContent = '📢 Scrolling to notifications...';
      document.body.appendChild(scrollIndicator);
      
      containerRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
      
      // Remove the scroll indicator after scrolling completes
      setTimeout(() => {
        if (document.body.contains(scrollIndicator)) {
          document.body.removeChild(scrollIndicator);
        }
      }, 1500);
    }
  };

  // Effect to scroll to detail view when selectedView changes
  useEffect(() => {
    if (selectedView !== 'overview') {
      scrollToDetailView();
    }
  }, [selectedView]);

  // Effect to scroll to top when notifications are added
  useEffect(() => {
    if (notifications.length > 0) {
      scrollToTop();
    }
  }, [notifications.length]);

  // Effect to handle scroll events for scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowScrollToTop(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

        // Initialize the last view time to now so we start tracking from this point
        setLastTotalInvestmentsView(new Date());
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

  useEffect(() => {
    if (!user) return; // Don't fetch data if no user
    // Fetch manual deposit requests
    const fetchManualDeposits = async () => {
      setManualDepositsLoading(true);
      setManualDepositsError('');
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/manual-deposits`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch manual deposits');
        setManualDeposits(data.data.requests);
      } catch (err) {
        setManualDepositsError(err instanceof Error ? err.message : 'Failed to fetch manual deposits');
      } finally {
        setManualDepositsLoading(false);
      }
    };
    fetchManualDeposits();
  }, [user]);

  // New useEffect for fetching user deposits
  useEffect(() => {
    if (!user || selectedView !== 'user-deposits') return;
    
    const fetchUserDeposits = async () => {
      setLoadingUserDeposits(true);
      try {
        const deposits = await investmentService.getUserDeposits();
        setUserDeposits(deposits);
      } catch (err) {
        console.error('Failed to fetch user deposits:', err);
        addNotification('warning', 'Failed to fetch user deposits');
      } finally {
        setLoadingUserDeposits(false);
      }
    };
    
    fetchUserDeposits();
  }, [user, selectedView]);

  // New useEffect for fetching total investments
  useEffect(() => {
    if (!user || selectedView !== 'total-investments') return;
    
    const fetchTotalInvestments = async () => {
      setLoadingTotalInvestments(true);
      try {
        const investments = await investmentService.getTotalInvestments();
        setTotalInvestments(investments);
      } catch (err) {
        console.error('Failed to fetch total investments:', err);
        addNotification('warning', 'Failed to fetch total investments');
      } finally {
        setLoadingTotalInvestments(false);
      }
    };
    
    fetchTotalInvestments();
  }, [user, selectedView]);

  // New useEffect for fetching pending withdrawals
  useEffect(() => {
    if (!user || selectedView !== 'pending-withdrawals') return;
    
    const fetchPendingWithdrawals = async () => {
      setLoadingPendingWithdrawals(true);
      try {
        const withdrawals = await investmentService.getPendingWithdrawals();
        setPendingWithdrawalsInvestments(withdrawals);
        console.log('✅ Fetched pending withdrawals:', withdrawals.length);
      } catch (err) {
        console.error('❌ Failed to fetch pending withdrawals:', err);
        addNotification('warning', 'Failed to fetch pending withdrawals');
      } finally {
        setLoadingPendingWithdrawals(false);
      }
    };
    
    fetchPendingWithdrawals();
  }, [user, selectedView]);

  // Periodic refresh for pending withdrawals
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(async () => {
      try {
        const withdrawals = await investmentService.getPendingWithdrawals();
        setPendingWithdrawalsInvestments(prev => {
          const previousCount = prev.length;
          
          // Notify if there are new pending withdrawals
          if (withdrawals.length > previousCount) {
            const newCount = withdrawals.length - previousCount;
            addNotification('info', `🆕 ${newCount} new investment${newCount > 1 ? 's' : ''} ready for withdrawal approval!`);
          }
          
          // Notify if there are any pending withdrawals
          if (withdrawals.length > 0 && selectedView !== 'pending-withdrawals') {
            addNotification('warning', `💰 ${withdrawals.length} withdrawal${withdrawals.length > 1 ? 's' : ''} pending approval. Click "Pending Withdrawals" to review.`);
          }
          
          return withdrawals;
        });
      } catch (error) {
        console.error('Periodic pending withdrawals refresh failed:', error);
      }
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [user, selectedView]);

  // Periodic check for new completed investments
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(async () => {
      try {
        // Only check if we have a last view time (meaning user has viewed the section at least once)
        if (lastTotalInvestmentsView) {
          console.log('🔍 Checking for new completed investments since:', lastTotalInvestmentsView.toISOString());
          const completedInvestments = await investmentService.getCompletedInvestments(lastTotalInvestmentsView.toISOString());
          const newCount = completedInvestments.length;
          
          console.log('📊 Found new completed investments:', newCount);
          
          // Only show notification if there are new completed investments and we're not currently viewing the section
          if (newCount > 0 && selectedView !== 'investments') {
            setNewCompletedInvestmentsCount(newCount);
            addNotification('info', `🆕 ${newCount} new investment${newCount > 1 ? 's' : ''} completed! Click "Total Investments" to view.`);
            console.log('🔴 Setting notification badge to:', newCount);
          } else {
            setNewCompletedInvestmentsCount(newCount);
            console.log('📊 Updated notification count to:', newCount);
          }
        } else {
          console.log('⏰ No last view time set yet');
        }
      } catch (error) {
        console.error('Periodic completed investments check failed:', error);
      }
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [user, lastTotalInvestmentsView, selectedView]);

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
      
      // Refresh all data
      const [allInvestments, pendingData, statsData] = await Promise.all([
        investmentService.getAllInvestments(),
        investmentService.getCompletedPendingPayments(),
        investmentService.getInvestmentStats()
      ]);
      
      setInvestments(allInvestments);
      setPendingPayments(pendingData);
      setStats(prev => ({
        ...prev,
        pendingPayments: statsData.pendingPayments,
      }));
      
      addNotification('success', 'Payment approved successfully! Investment marked as completed.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve payment');
      addNotification('warning', 'Failed to approve payment');
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
    
    // Auto-remove notification after 8 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 8000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
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
      
      // Refresh data including pending withdrawals
      const [allInvestments, statsData, pendingData, pendingWithdrawalsData] = await Promise.all([
        investmentService.getAllInvestments(),
        investmentService.getInvestmentStats(),
        investmentService.getCompletedPendingPayments(),
        investmentService.getPendingWithdrawals()
      ]);
      setInvestments(allInvestments);
      setPendingPayments(pendingData);
      setPendingWithdrawalsInvestments(pendingWithdrawalsData);
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
      setPendingWithdrawals(prev => prev.filter(tx => tx._id !== transactionId));
      // Add notification
      addNotification('success', `Withdrawal of ${transaction.amount} KSH approved successfully!`);
    } catch (err) {
      console.error('Error approving withdrawal:', err);
      setError(err instanceof Error ? err.message : 'Failed to approve withdrawal');
      addNotification('warning', 'Failed to approve withdrawal');
    }
  };

  // New handler for approving investment withdrawals
  const handleApproveInvestmentWithdrawal = async (investmentId: string) => {
    try {
      await investmentService.approveWithdrawal(investmentId);
      
      // Remove the approved investment from the list
      setPendingWithdrawalsInvestments(prev => prev.filter(inv => inv.id !== investmentId && inv._id !== investmentId));
      
      // Add notification
      addNotification('success', `Investment withdrawal approved successfully!`);
      
      // Refresh the pending withdrawals list
      const withdrawals = await investmentService.getPendingWithdrawals();
      setPendingWithdrawalsInvestments(withdrawals);
    } catch (err) {
      console.error('Error approving investment withdrawal:', err);
      setError(err instanceof Error ? err.message : 'Failed to approve investment withdrawal');
      addNotification('warning', 'Failed to approve investment withdrawal');
    }
  };

  const handleApproveManualDeposit = async (requestId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/manual-deposits/${requestId}/approve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to approve deposit');
      setManualDeposits((prev) => prev.map((req) => (req._id === requestId || req.id === requestId) ? { ...req, status: 'approved' } : req));
      addNotification('success', 'Deposit approved and user balance updated.');
    } catch (err) {
      setManualDepositsError(err instanceof Error ? err.message : 'Failed to approve deposit');
      addNotification('warning', 'Failed to approve deposit');
    }
  };

  const handleRejectManualDeposit = async (requestId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/manual-deposits/${requestId}/reject`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to reject deposit');
      setManualDeposits((prev) => prev.map((req) => (req._id === requestId || req.id === requestId) ? { ...req, status: 'rejected' } : req));
      addNotification('info', 'Deposit request rejected.');
    } catch (err) {
      setManualDepositsError(err instanceof Error ? err.message : 'Failed to reject deposit');
      addNotification('warning', 'Failed to reject deposit');
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
          <DetailCard ref={detailViewRef}>
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
          <DetailCard ref={detailViewRef}>
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
                      {investment.status === 'active' && investment.paymentStatus === 'pending' && (
                        <Button 
                          onClick={() => handleApprovePayment(investment._id || investment.id)}
                          style={{ background: theme.colors.success }}
                        >
                          Mark as Paid
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
          <DetailCard ref={detailViewRef}>
            <h2>Pending Payments</h2>
            <p>Active investments waiting for payment approval</p>
            <Table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Phone</th>
                  <th>Investment Amount</th>
                  <th>Profit Amount</th>
                  <th>Total Due</th>
                  <th>Created Date</th>
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
                      <td>{formatDate(investment.createdAt)}</td>
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

      case 'manual-deposits':
        return (
          <DetailCard ref={detailViewRef}>
            <h2>Manual Deposit Requests</h2>
            {manualDepositsLoading ? (
              <div>Loading...</div>
            ) : manualDepositsError ? (
              <div style={{ color: 'red' }}>{manualDepositsError}</div>
            ) : (
              <Table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Phone</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {manualDeposits.map((req) => (
                    <tr key={req._id || req.id}>
                      <td>{req.user?.name || 'Unknown'}</td>
                      <td>{req.user?.phone || 'Unknown'}</td>
                      <td>{formatMoney(req.amount)}</td>
                      <td>
                        <StatusBadge status={req.status}>{req.status}</StatusBadge>
                      </td>
                      <td>{formatDate(req.createdAt)}</td>
                      <td>
                        {req.status === 'pending' && (
                          <>
                            <Button style={{ background: theme.colors.success, marginRight: 8 }} onClick={() => handleApproveManualDeposit(req._id || req.id)}>
                              Approve
                            </Button>
                            <Button style={{ background: theme.colors.error }} onClick={() => handleRejectManualDeposit(req._id || req.id)}>
                              Reject
                            </Button>
                          </>
                        )}
                        {req.status !== 'pending' && <span>-</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </DetailCard>
        );

      case 'user-deposits':
        return (
          <DetailCard ref={detailViewRef}>
            <h2>User Deposits</h2>
            <p>Users who have made deposit requests (not yet invested)</p>
            {loadingUserDeposits ? (
              <div>Loading...</div>
            ) : (
              <Table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Phone</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userDeposits.map((deposit) => (
                    <tr key={deposit._id || deposit.id}>
                      <td>{deposit.user?.name || 'Unknown'}</td>
                      <td>{deposit.user?.phone || 'Unknown'}</td>
                      <td>{formatMoney(deposit.amount)}</td>
                      <td>
                        <StatusBadge status={deposit.status}>{deposit.status}</StatusBadge>
                      </td>
                      <td>{formatDate(deposit.createdAt)}</td>
                      <td>
                        {deposit.status === 'pending' && (
                          <>
                            <Button style={{ background: theme.colors.success, marginRight: 8 }} onClick={() => handleApproveManualDeposit(deposit._id || deposit.id)}>
                              Approve
                            </Button>
                            <Button style={{ background: theme.colors.error }} onClick={() => handleRejectManualDeposit(deposit._id || deposit.id)}>
                              Reject
                            </Button>
                          </>
                        )}
                        {deposit.status !== 'pending' && <span>-</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
            {userDeposits.length === 0 && !loadingUserDeposits && (
              <p style={{ textAlign: 'center', color: theme.colors.textSecondary }}>
                No pending user deposits
              </p>
            )}
          </DetailCard>
        );

      case 'total-investments':
        return (
          <DetailCard ref={detailViewRef}>
            <h2>Total Investments</h2>
            <p>Active investments showing expected profits after expiry</p>
            {loadingTotalInvestments ? (
              <div>Loading...</div>
            ) : (
              <Table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Phone</th>
                    <th>Investment Amount</th>
                    <th>Expected Profit (60%)</th>
                    <th>Total Return</th>
                    <th>Status</th>
                    <th>Payment Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {totalInvestments.map((investment) => (
                    <tr key={investment.id || investment._id}>
                      <td>{investment.userName || 'Unknown'}</td>
                      <td>{investment.userPhone || 'Unknown'}</td>
                      <td>{formatMoney(investment.amount)}</td>
                      <td>{formatMoney(investment.profitAmount)}</td>
                      <td>{formatMoney(investment.amount + investment.profitAmount)}</td>
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
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
            {totalInvestments.length === 0 && !loadingTotalInvestments && (
              <p style={{ textAlign: 'center', color: theme.colors.textSecondary }}>
                No active investments
              </p>
            )}
          </DetailCard>
        );

      case 'pending-withdrawals':
        return (
          <DetailCard ref={detailViewRef}>
            <h2>Pending Withdrawals</h2>
            <p>Completed investments automatically marked for withdrawal approval</p>
            {loadingPendingWithdrawals ? (
              <div>Loading...</div>
            ) : (
              <>
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
                    {pendingWithdrawalsInvestments.map((investment) => (
                      <tr key={investment.id || investment._id}>
                        <td>{investment.userName || 'Unknown'}</td>
                        <td>{investment.userPhone || 'Unknown'}</td>
                        <td>{formatMoney(investment.amount)}</td>
                        <td>{formatMoney(investment.profitAmount)}</td>
                        <td>{formatMoney(investment.amount + investment.profitAmount)}</td>
                        <td>{investment.profitPaidAt ? formatDate(investment.profitPaidAt) : formatDate(investment.createdAt)}</td>
                        <td>
                          <Button 
                            onClick={() => handleApproveInvestmentWithdrawal(investment.id || investment._id || '')}
                            style={{ background: theme.colors.success }}
                          >
                            Mark as Paid
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                {pendingWithdrawalsInvestments.length === 0 && (
                  <p style={{ textAlign: 'center', color: theme.colors.textSecondary }}>
                    No pending withdrawals
                  </p>
                )}
              </>
            )}
          </DetailCard>
        );

      case 'transactions':
        return (
          <DetailCard ref={detailViewRef}>
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
          <DetailCard ref={detailViewRef}>
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

  // Handler for Total Investments card click
  const handleTotalInvestmentsClick = () => {
    console.log('🖱️ Total Investments card clicked');
    setSelectedView('investments');
    setLastTotalInvestmentsView(new Date());
    setNewCompletedInvestmentsCount(0); // Clear the notification
    console.log('✅ Cleared notification badge');
  };

  // Enhanced click handlers with automatic scrolling
  const handleSectionClick = (view: typeof selectedView) => {
    setSelectedView(view);
    console.log(`🖱️ ${view} section clicked - will scroll to detail view`);
    
    // Add visual feedback to the clicked card
    const event = window.event as any;
    if (event?.target?.closest('.stat-card')) {
      const card = event.target.closest('.stat-card');
      card.style.transform = 'scale(0.95)';
      card.style.transition = 'transform 0.1s ease';
      setTimeout(() => {
        card.style.transform = '';
      }, 100);
    }
  };

  // Test function to simulate new completed investments
  const testNotification = () => {
    console.log('🧪 Testing notification system...');
    // Set last view time to 24 hours ago to simulate new completed investments
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    setLastTotalInvestmentsView(yesterday);
    console.log('⏰ Set last view time to:', yesterday.toISOString());
    
    // Manually trigger the check immediately
    setTimeout(async () => {
      try {
        console.log('🔍 Manual check for completed investments...');
        const completedInvestments = await investmentService.getCompletedInvestments(yesterday.toISOString());
        const newCount = completedInvestments.length;
        console.log('📊 Manual check found:', newCount, 'completed investments');
        
        if (newCount > 0) {
          setNewCompletedInvestmentsCount(newCount);
          addNotification('info', `🧪 TEST: ${newCount} completed investment${newCount > 1 ? 's' : ''} found!`);
          console.log('🔴 Manual notification badge set to:', newCount);
        } else {
          console.log('📊 No completed investments found in test');
        }
      } catch (error) {
        console.error('❌ Manual check failed:', error);
      }
    }, 1000);
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
    <Container ref={containerRef}>
      <Header>
        <Title>Admin Dashboard</Title>
        <Subtitle>Welcome, {user?.name || 'Admin'}</Subtitle>
        <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '10px' }}>
          <Button onClick={testNotification} style={{ background: '#ff9800', fontSize: '0.8rem' }}>
            🧪 Test Notification
          </Button>
          <Button onClick={handleLogout}>Logout</Button>
        </div>
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
        <div ref={notificationsRef} style={{ marginBottom: '20px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '10px',
            padding: '8px 12px',
            background: 'rgba(33, 150, 243, 0.1)',
            borderRadius: '6px',
            border: '1px solid rgba(33, 150, 243, 0.2)'
          }}>
            <span style={{ marginRight: '8px' }}>📢</span>
            <span style={{ fontSize: '0.9rem', color: theme.colors.textSecondary }}>
              {notifications.length} notification{notifications.length > 1 ? 's' : ''} - Auto-scrolled to top
            </span>
          </div>
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
                animation: 'slideIn 0.3s ease-out',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                position: 'relative'
              }}
            >
              <span style={{ flex: 1, marginRight: '10px' }}>{notification.message}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                  {notification.timestamp.toLocaleTimeString()}
                </span>
                <button
                  onClick={() => removeNotification(notification.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    opacity: 0.7,
                    padding: '0 4px',
                    borderRadius: '4px',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.opacity = '1'}
                  onMouseLeave={(e) => (e.target as HTMLElement).style.opacity = '0.7'}
                  title="Dismiss notification"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminGrid>
        <StatCard className="stat-card" onClick={() => handleSectionClick('users')}>
          <StatLabel>Total Users</StatLabel>
          <StatValue>{stats.totalUsers}</StatValue>
        </StatCard>
        <StatCard className="stat-card" onClick={handleTotalInvestmentsClick}>
          <StatLabel>
            Total Investments
            {newCompletedInvestmentsCount > 0 && (
              <NotificationBadge style={{ backgroundColor: theme.colors.error }}>
                {newCompletedInvestmentsCount}
              </NotificationBadge>
            )}
          </StatLabel>
          <StatValue>{stats.totalInvestments}</StatValue>
        </StatCard>
        <StatCard className="stat-card" onClick={() => handleSectionClick('transactions')}>
          <StatLabel>Total Transactions</StatLabel>
          <StatValue>{stats.totalTransactions}</StatValue>
        </StatCard>
        <StatCard className="stat-card" onClick={() => handleSectionClick('active')}>
          <StatLabel>Active Investments</StatLabel>
          <StatValue>{stats.activeInvestments}</StatValue>
        </StatCard>
        <StatCard className="stat-card" onClick={() => handleSectionClick('pending-payments')}>
          <StatLabel>
            Pending Payments
            {stats.pendingPayments > 0 && (
              <NotificationBadge>{stats.pendingPayments}</NotificationBadge>
            )}
          </StatLabel>
          <StatValue>{stats.pendingPayments}</StatValue>
        </StatCard>
        <StatCard 
          className="stat-card"
          onClick={() => handleSectionClick('pending-withdrawals')}
          style={pendingWithdrawalsInvestments.length > 0 ? { 
            border: '2px solid #f59e0b', 
            backgroundColor: '#fef3c7' 
          } : {}}
        >
          <StatLabel>
            Pending Withdrawals
            {pendingWithdrawalsInvestments.length > 0 && (
              <NotificationBadge style={{ backgroundColor: '#f59e0b' }}>
                {pendingWithdrawalsInvestments.length}
              </NotificationBadge>
            )}
          </StatLabel>
          <StatValue style={{ color: pendingWithdrawalsInvestments.length > 0 ? '#d97706' : 'inherit' }}>
            {pendingWithdrawalsInvestments.length}
          </StatValue>
        </StatCard>
        <StatCard className="stat-card" onClick={handleCompleteExpiredInvestments}>
          <StatLabel>Complete Expired</StatLabel>
          <StatValue>🔄</StatValue>
        </StatCard>
        <StatCard className="stat-card" onClick={() => handleSectionClick('manual-deposits')}>
          <StatLabel>Manual Deposits</StatLabel>
          <StatValue>{manualDeposits.filter((req) => req.status === 'pending').length}</StatValue>
        </StatCard>
        <StatCard className="stat-card" onClick={() => handleSectionClick('user-deposits')}>
          <StatLabel>User Deposits</StatLabel>
          <StatValue>{userDeposits.filter((req) => req.status === 'pending').length}</StatValue>
        </StatCard>
        <StatCard className="stat-card" onClick={() => handleSectionClick('total-investments')}>
          <StatLabel>Active Investments</StatLabel>
          <StatValue>{totalInvestments.length}</StatValue>
        </StatCard>
        <StatCard className="stat-card" onClick={() => navigate('/admin/mpesa-bot')}>
          <StatLabel>🤖 MPESA Bot</StatLabel>
          <StatValue>Manage</StatValue>
        </StatCard>
      </AdminGrid>

      {renderDetailView()}
      
      {/* Back to Overview Button - only show when a section is selected */}
      {selectedView !== 'overview' && (
        <BackToOverviewButton 
          onClick={() => {
            setSelectedView('overview');
            console.log('🔄 Back to overview clicked');
          }}
        >
          ← Back to Overview
        </BackToOverviewButton>
      )}
      
      {/* Scroll to Top Button - only show when scrolled down */}
      {showScrollToTop && (
        <ScrollToTopButton 
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            console.log('📜 Scroll to top clicked');
          }}
          title="Scroll to top"
        >
          ↑
        </ScrollToTopButton>
      )}
    </Container>
  );
};

export default AdminDashboardPage; 