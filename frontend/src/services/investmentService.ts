import { Investment, Transaction, Trade, User } from '../types';
import { authService } from './singletonAuthService';
import { API_BASE_URL } from './config';

const MINIMUM_INVESTMENT = 1000;
const PROFIT_PERCENTAGE = 0.6; // 60%

export class InvestmentService {
  private investments: Investment[] = [];
  private transactions: Transaction[] = [];
  private trades: Trade[] = [];

  // API Helper
  private async apiCall(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API call failed');
    }

    return response.json();
  }

  // Client functions
  async createInvestment(userId: string, amount: number): Promise<Investment> {
    if (amount < MINIMUM_INVESTMENT) {
      throw new Error(`Minimum investment amount is ${MINIMUM_INVESTMENT} KSH`);
    }

    const response = await this.apiCall('/investments', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });

    return response.data.investment;
  }

  async getClientInvestments(userId: string): Promise<Investment[]> {
    const response = await this.apiCall('/investments/my-investments');
    return response.data.investments;
  }

  // Admin functions
  async getAllUsers(): Promise<User[]> {
    const response = await this.apiCall('/auth/users', {
      method: 'GET',
    });
    return response.data.users;
  }

  async getAllInvestments(): Promise<Investment[]> {
    const response = await this.apiCall('/investments');
    return response.data.investments;
  }

  async getInvestmentsByPhone(phone: string): Promise<Investment[]> {
    const response = await this.apiCall(`/investments/phone/${phone}`);
    return response.data.investments;
  }

  async getCompletedPendingPayments(): Promise<Investment[]> {
    const response = await this.apiCall('/investments/pending-payments');
    return response.data.investments;
  }

  async getExpiredInvestments(): Promise<Investment[]> {
    const response = await this.apiCall('/investments/expired');
    return response.data.investments;
  }

  async completeExpiredInvestments(): Promise<{
    completedCount: number;
    totalProfit: number;
    completedInvestments: Investment[];
  }> {
    const response = await this.apiCall('/investments/complete-expired', { method: 'POST' });
    return response.data;
  }

  async approvePayment(investmentId: string): Promise<Investment> {
    const response = await this.apiCall(`/investments/${investmentId}/approve-payment`, {
      method: 'PATCH',
    });
    return response.data.investment;
  }

  async updateUserBalance(userId: string, balance: number): Promise<User> {
    const response = await this.apiCall(`/investments/user/${userId}/balance`, {
      method: 'PATCH',
      body: JSON.stringify({ balance }),
    });
    return response.data.user;
  }

  async searchUsersByPhone(phone: string): Promise<User[]> {
    const response = await this.apiCall(`/investments/search-users/${phone}`);
    return response.data.users;
  }

  async updateInvestmentStatus(investmentId: string, status: Investment['status']): Promise<Investment> {
    const response = await this.apiCall(`/investments/${investmentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return response.data.investment;
  }

  async getInvestmentStats(): Promise<{
    totalInvestments: number;
    activeInvestments: number;
    totalProfit: number;
    pendingPayments: number;
    expiredInvestments: number;
  }> {
    const response = await this.apiCall('/investments/stats');
    return response.data.stats;
  }

  // New methods for the three major transaction types
  async getUserDeposits(): Promise<any[]> {
    const response = await this.apiCall('/investments/admin/user-deposits');
    return response.data.deposits;
  }

  async getTotalInvestments(): Promise<Investment[]> {
    const response = await this.apiCall('/investments/admin/total-investments');
    return response.data.investments;
  }

  async getPendingWithdrawals(): Promise<Investment[]> {
    const response = await this.apiCall('/investments/admin/pending-withdrawals');
    return response.data.investments;
  }

  async getCompletedInvestments(since?: string): Promise<Investment[]> {
    const params = since ? `?since=${encodeURIComponent(since)}` : '';
    const url = `/investments/admin/completed-investments${params}`;
    console.log('🌐 Calling getCompletedInvestments:', url);
    const response = await this.apiCall(url);
    console.log('📊 getCompletedInvestments response:', response.data.investments.length, 'investments');
    return response.data.investments;
  }

  async approveWithdrawal(investmentId: string): Promise<Investment> {
    const response = await this.apiCall(`/investments/admin/${investmentId}/approve-withdrawal`, {
      method: 'PATCH',
    });
    return response.data.investment;
  }

  getAllTransactions(): Transaction[] {
    return this.transactions;
  }

  withdrawInvestment(investmentId: string): void {
    const investment = this.investments.find(inv => inv.id === investmentId);
    if (!investment) throw new Error('Investment not found');
    if (investment.status !== 'active') throw new Error('Investment is not active');

    investment.status = 'trading';
    
    // Create a withdrawal transaction
    this.createTransaction(investment.userId, 'withdrawal', investment.amount);
  }

  createTrade(adminId: string, amount: number): Trade {
    const trade: Trade = {
      id: Math.random().toString(36).substr(2, 9),
      adminId,
      amount,
      status: 'pending',
      profit: amount * PROFIT_PERCENTAGE,
      createdAt: new Date(),
    };

    this.trades.push(trade);
    return trade;
  }

  async completeTrade(tradeId: string): Promise<void> {
    const trade = this.trades.find(t => t.id === tradeId);
    if (!trade) throw new Error('Trade not found');

    trade.status = 'completed';
    trade.completedAt = new Date();

    // Distribute profits to clients
    await this.distributeProfits(trade.profit);
  }

  private async distributeProfits(totalProfit: number): Promise<void> {
    const tradingInvestments = this.investments.filter(inv => inv.status === 'trading');
    const totalInvested = tradingInvestments.reduce((sum, inv) => sum + inv.amount, 0);

    if (totalInvested === 0) return;

    for (const investment of tradingInvestments) {
      const profitShare = (investment.amount / totalInvested) * totalProfit;
      investment.profitAmount = profitShare;
      investment.profitPaidAt = new Date();
      investment.status = 'completed';

      try {
        // Create a profit transaction
        await this.createTransaction(investment.userId, 'profit', profitShare);
        
        // Update user balance
        await authService.updateBalance(investment.userId, investment.amount + profitShare);
      } catch (error) {
        console.error('Error distributing profits:', error);
      }
    }
  }

  // Transaction functions
  async createTransaction(userId: string, type: Transaction['type'], amount: number): Promise<Transaction> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify({ type, amount })
      });

      if (!response.ok) {
        throw new Error('Failed to create transaction');
      }

      const data = await response.json();
      return data.data.transaction;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  // Helper function to check if profit is due
  checkProfitsDue(): void {
    const now = new Date();
    const tradingInvestments = this.investments.filter(inv => inv.status === 'trading');
    
    tradingInvestments.forEach(investment => {
      const investmentDate = new Date(investment.createdAt);
      const timeDiff = now.getTime() - investmentDate.getTime();
      const daysDiff = timeDiff / (1000 * 3600 * 24);
      
      // If investment is older than 30 days, mark it as completed
      if (daysDiff >= 30) {
        investment.status = 'completed';
        investment.profitPaidAt = new Date();
        
        // Create a profit transaction
        this.createTransaction(investment.userId, 'profit', investment.profitAmount);
      }
    });
  }
}

// Create and export a singleton instance
export const investmentService = new InvestmentService(); 