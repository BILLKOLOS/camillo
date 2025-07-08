import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/singletonAuthService';
import { investmentService } from '../../services/singletonInvestmentService';
import { User, Investment, Transaction } from '../../types';
import { API_BASE_URL } from '../../services/config';

export const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<any>({});
  const [searchPhone, setSearchPhone] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [updateAmount, setUpdateAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try to auto-login as admin
        let user = await authService.getCurrentUser();
        
        if (!user) {
          console.log('No current user, attempting auto-login as admin...');
          user = await authService.autoLoginAdmin();
        }
        
        setCurrentUser(user);
        
        if (!user) {
          navigate('/login');
          return;
        }

        if (user.role !== 'admin') {
          navigate('/');
          return;
        }

        // Load admin data
        await Promise.all([
          loadUsers(),
          loadInvestments(),
          loadTransactions(),
          loadNotifications()
        ]);
      } catch (error) {
        console.error('Auth check failed:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const loadUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/users`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data.users);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const loadInvestments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/investments`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setInvestments(data.data.investments);
      }
    } catch (error) {
      console.error('Failed to load investments:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.data.transactions);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/investments/admin/notifications`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const searchUsers = async () => {
    if (!searchPhone.trim()) {
      await loadUsers();
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/investments/search-users/${searchPhone}`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data.users);
      }
    } catch (error) {
      console.error('Failed to search users:', error);
    }
  };

  const updateUserBalance = async () => {
    if (!selectedUser || !updateAmount) {
      setError('Please select a user and enter an amount');
      return;
    }

    try {
      const amount = parseFloat(updateAmount);
      if (isNaN(amount) || amount <= 0) {
        setError('Please enter a valid amount');
        return;
      }

      const newBalance = selectedUser.balance + amount;
      
      const response = await fetch(`${API_BASE_URL}/investments/user/${selectedUser.id}/balance`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`,
        },
        body: JSON.stringify({ balance: newBalance }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(`Balance updated for ${selectedUser.name}. Investment created with ${Math.round(amount * 0.6)} KSH profit.`);
        setUpdateAmount('');
        setSelectedUser(null);
        await Promise.all([loadUsers(), loadNotifications()]);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update balance');
      }
    } catch (error) {
      setError('Failed to update balance');
    }
  };

  const approveWithdrawal = async (transactionId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions/approve-withdrawal/${transactionId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
        },
      });

      if (response.ok) {
        setSuccess('Withdrawal approved successfully');
        await loadTransactions();
        await loadNotifications();
      } else {
        setError('Failed to approve withdrawal');
      }
    } catch (error) {
      setError('Failed to approve withdrawal');
    }
  };

  const approvePayment = async (investmentId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/investments/${investmentId}/approve-payment`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
        },
      });

      if (response.ok) {
        setSuccess('Payment approved successfully');
        await loadInvestments();
        await loadNotifications();
      } else {
        setError('Failed to approve payment');
      }
    } catch (error) {
      setError('Failed to approve payment');
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center min-h-screen">
        <div>Loading Admin Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}

      {/* Notifications Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800">Pending Payments</h3>
          <p className="text-2xl font-bold text-yellow-600">{notifications.pendingPayments?.length || 0}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800">Recent Profits</h3>
          <p className="text-2xl font-bold text-green-600">{notifications.recentProfits?.length || 0}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800">Pending Withdrawals</h3>
          <p className="text-2xl font-bold text-blue-600">{notifications.pendingWithdrawals?.length || 0}</p>
        </div>
      </div>

      {/* User Management Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">User Management</h2>
        
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            placeholder="Search by phone number"
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={searchUsers}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Search
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User List */}
          <div>
            <h3 className="font-semibold mb-2">Users</h3>
            <div className="max-h-60 overflow-y-auto border rounded">
              {users.map((user) => (
                <div
                  key={user.id}
                  className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                    selectedUser?.id === user.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-600">{user.phone}</div>
                  <div className="text-sm font-semibold">{user.balance} KSH</div>
                </div>
              ))}
            </div>
          </div>

          {/* Update Balance */}
          <div>
            <h3 className="font-semibold mb-2">Update Balance</h3>
            {selectedUser ? (
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded">
                  <div className="font-medium">{selectedUser.name}</div>
                  <div className="text-sm text-gray-600">{selectedUser.phone}</div>
                  <div className="text-sm font-semibold">Current: {selectedUser.balance} KSH</div>
                </div>
                <input
                  type="number"
                  value={updateAmount}
                  onChange={(e) => setUpdateAmount(e.target.value)}
                  placeholder="Amount to add"
                  className="w-full p-2 border rounded"
                />
                <button
                  onClick={updateUserBalance}
                  className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
                >
                  Update Balance
                </button>
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">Select a user to update balance</div>
            )}
          </div>
        </div>
      </div>

      {/* Pending Payments */}
      {notifications.pendingPayments?.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Pending Payments</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">User</th>
                  <th className="px-4 py-2 text-left">Amount</th>
                  <th className="px-4 py-2 text-left">Profit</th>
                  <th className="px-4 py-2 text-left">Total</th>
                  <th className="px-4 py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {notifications.pendingPayments.map((investment: any) => (
                  <tr key={investment._id} className="border-b">
                    <td className="px-4 py-2">{investment.userId?.name}</td>
                    <td className="px-4 py-2">{investment.amount} KSH</td>
                    <td className="px-4 py-2">{investment.profitAmount} KSH</td>
                    <td className="px-4 py-2">{investment.amount + investment.profitAmount} KSH</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => approvePayment(investment._id)}
                        className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                      >
                        Mark as Paid
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pending Withdrawals */}
      {notifications.pendingWithdrawals?.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Pending Withdrawals</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">User</th>
                  <th className="px-4 py-2 text-left">Amount</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {notifications.pendingWithdrawals.map((transaction: any) => (
                  <tr key={transaction._id} className="border-b">
                    <td className="px-4 py-2">{transaction.userId?.name}</td>
                    <td className="px-4 py-2">{transaction.amount} KSH</td>
                    <td className="px-4 py-2">{formatDate(transaction.createdAt)}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => approveWithdrawal(transaction._id)}
                        className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                      >
                        Approve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Profits */}
      {notifications.recentProfits?.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Profit Credits</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">User</th>
                  <th className="px-4 py-2 text-left">Amount</th>
                  <th className="px-4 py-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {notifications.recentProfits.map((transaction: any) => (
                  <tr key={transaction._id} className="border-b">
                    <td className="px-4 py-2">{transaction.userId?.name}</td>
                    <td className="px-4 py-2">{transaction.amount} KSH</td>
                    <td className="px-4 py-2">{formatDate(transaction.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}; 