import { Transaction } from '../types';
import { API_BASE_URL } from './config';

export class TransactionService {
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

  // Create a transaction (deposit, withdrawal, profit)
  async createTransaction(type: 'deposit' | 'withdrawal' | 'profit', amount: number, mpesaTransactionId?: string): Promise<Transaction> {
    const response = await this.apiCall('/transactions', {
      method: 'POST',
      body: JSON.stringify({ type, amount, mpesaTransactionId }),
    });
    return response.data.transaction;
  }

  // Get user's transactions
  async getUserTransactions(): Promise<Transaction[]> {
    const response = await this.apiCall('/transactions/my-transactions');
    return response.data.transactions;
  }

  // Get all transactions (admin only)
  async getAllTransactions(): Promise<Transaction[]> {
    const response = await this.apiCall('/transactions');
    return response.data.transactions;
  }

  // Get transaction stats (admin only)
  async getTransactionStats(): Promise<{
    totalDeposits: number;
    totalWithdrawals: number;
    totalProfits: number;
  }> {
    const response = await this.apiCall('/transactions/stats');
    return response.data.stats;
  }

  // Get pending withdrawal transactions (admin only)
  async getPendingWithdrawals(): Promise<Transaction[]> {
    const response = await this.apiCall('/transactions/pending-withdrawals');
    return response.data.transactions;
  }

  // Approve withdrawal transaction (admin only)
  async approveWithdrawal(transactionId: string): Promise<Transaction> {
    const response = await this.apiCall(`/transactions/approve-withdrawal/${transactionId}`, {
      method: 'PATCH',
    });
    return response.data.transaction;
  }
}

// Create singleton instance
export const transactionService = new TransactionService(); 