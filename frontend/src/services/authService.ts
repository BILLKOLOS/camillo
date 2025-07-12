import { User } from '../types';
import { API_BASE_URL } from './config';

export class AuthService {
  private token: string | null = null;
  private currentUser: User | null = null;
  private sessionCheckInProgress: boolean = false;

  constructor() {
    // On instantiation, try to load token from localStorage
    this.token = localStorage.getItem('token');
    console.log('AuthService initialized, token:', this.token ? 'exists' : 'null');
    
    // Try to recover session on initialization
    this.recoverSession();
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    // A user is authenticated if there is a token
    return !!this.token;
  }

  // Enhanced session recovery method
  private async recoverSession(): Promise<void> {
    if (this.sessionCheckInProgress || !this.token) {
      return;
    }

    this.sessionCheckInProgress = true;
    
    try {
      console.log('🔄 Attempting to recover session...');
      const user = await this.getCurrentUser();
      if (user) {
        this.currentUser = user;
        console.log('✅ Session recovered successfully for user:', user.name);
      } else {
        console.log('❌ Session recovery failed, clearing invalid token');
        this.logout();
      }
    } catch (error) {
      console.error('❌ Session recovery error:', error);
      this.logout();
    } finally {
      this.sessionCheckInProgress = false;
    }
  }

  // Method to force session recovery (useful after page reloads)
  async forceSessionRecovery(): Promise<User | null> {
    console.log('🔄 Force session recovery initiated...');
    await this.recoverSession();
    return this.currentUser;
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
    this.currentUser = data.data.user;
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
    this.currentUser = null;
    localStorage.removeItem('token');
    console.log('🚪 User logged out, session cleared');
  }

  async getCurrentUser(): Promise<User | null> {
    console.log('getCurrentUser called, token:', this.token ? 'exists' : 'null');
    
    if (!this.token) {
      console.log('No token found, returning null');
      return Promise.resolve(null);
    }

    // If we already have a cached user, return it immediately
    if (this.currentUser) {
      console.log('Returning cached user:', this.currentUser.name);
      return Promise.resolve(this.currentUser);
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
      
      // Cache the user data
      this.currentUser = data.data.user;
      return data.data.user;
    } catch (error) {
      console.error('getCurrentUser error:', error);
      this.logout();
      return null;
    }
  }

  // Method to clear cached user (useful when user data might have changed)
  clearCachedUser(): void {
    this.currentUser = null;
    console.log('🧹 Cached user cleared');
  }

  // Enhanced method to refresh user data
  async refreshUserData(): Promise<User | null> {
    this.clearCachedUser();
    return await this.getCurrentUser();
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