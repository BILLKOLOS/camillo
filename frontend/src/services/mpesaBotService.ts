import { API_BASE_URL } from './config';

export interface MPESANotification {
  senderName: string;
  senderPhone: string;
  amount: number;
  transactionId?: string;
  message?: string;
}

export interface MPESABotResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    name: string;
    phone: string;
    balance: number;
    email: string;
  };
}

export interface User {
  id: string;
  name: string;
  phone: string;
  balance: number;
  email: string;
  role: string;
  createdAt: string;
}

class MPESABotService {
  /**
   * Simulate MPESA notification (for testing)
   */
  async simulateNotification(notification: MPESANotification): Promise<MPESABotResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/mpesa-bot/simulate-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notification),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to simulate notification');
      }

      return data.data;
    } catch (error) {
      console.error('Error simulating MPESA notification:', error);
      throw error;
    }
  }

  /**
   * Process MPESA notification (for real implementation)
   */
  async processNotification(notification: MPESANotification): Promise<MPESABotResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/mpesa-bot/process-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notification),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to process notification');
      }

      return data.data;
    } catch (error) {
      console.error('Error processing MPESA notification:', error);
      throw error;
    }
  }

  /**
   * Get user by phone number
   */
  async getUserByPhone(phone: string): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/mpesa-bot/user/${phone}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get user');
      }

      return data.data.user;
    } catch (error) {
      console.error('Error getting user by phone:', error);
      throw error;
    }
  }

  /**
   * Update user balance manually (admin only)
   */
  async updateUserBalance(userId: string, balance: number): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/investments/user/${userId}/balance`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ balance }),
      });

      // Check for non-JSON response (e.g., HTML error page)
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update user balance');
      }

      return data.data.user;
    } catch (error) {
      console.error('Error updating user balance:', error);
      throw error;
    }
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get users');
      }
      return data.data.users;
    } catch (error: any) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }
}

export const mpesaBotService = new MPESABotService(); 