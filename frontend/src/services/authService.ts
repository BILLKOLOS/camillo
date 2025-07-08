import { User } from '../types';
import { API_BASE_URL } from './config';

export class AuthService {
  private token: string | null = null;

  constructor() {
    // On instantiation, try to load token from localStorage
    this.token = localStorage.getItem('token');
    console.log('AuthService initialized, token:', this.token ? 'exists' : 'null');
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    // A user is authenticated if there is a token
    return !!this.token;
  }

  async login(email: string, password: string): Promise<User> {
    console.log('Login method called for email:', email);
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    console.log('Login response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('Login failed:', error);
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    console.log('Login response data:', data);
    
    this.token = data.data.token;
    localStorage.setItem('token', this.token as string);
    console.log('Token stored:', this.token ? 'yes' : 'no');

    return data.data.user;
  }

  async autoLoginAdmin(): Promise<User | null> {
    try {
      const user = await this.login('Admin@camillo.com', 'Admin@Camillo2020$2019');
      return user;
    } catch (error) {
      console.error('Auto-login failed:', error);
      return null;
    }
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('token');
  }

  async getCurrentUser(): Promise<User | null> {
    console.log('getCurrentUser called, token:', this.token ? 'exists' : 'null');
    
    if (!this.token) {
      console.log('No token found, returning null');
      return Promise.resolve(null);
    }

    try {
      console.log('Making API call to /auth/me');
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      console.log('API response status:', response.status);

      if (!response.ok) {
        console.log('API call failed, logging out');
        this.logout(); // Token might be invalid/expired
        return null;
      }

      const data = await response.json();
      console.log('API response data:', data);
      return data.data.user;
    } catch (error) {
      console.error('getCurrentUser error:', error);
      this.logout();
      return null;
    }
  }

  // The following methods are from the mock service.
  // They should be replaced with real API calls if they are still needed.
  register(email: string, name: string, password: string, role: 'client' | 'admin', phone: string = '+254700000000'): User {
    // This is a mock implementation.
    console.warn('`register` is a mock implementation.');
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      phone,
      role,
      balance: 0,
      createdAt: new Date(),
    };
    return user;
  }

  async updateBalance(userId: string, amount: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/investments/user/${userId}/balance`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        body: JSON.stringify({ balance: amount })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update balance');
      }
    } catch (error) {
      console.error('Error updating balance:', error);
      throw error;
    }
  }

  getAllUsers(): User[] {
    console.warn('`getAllUsers` is a mock implementation.');
    return [];
  }
} 