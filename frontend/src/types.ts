export * from './types/index';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: 'admin' | 'client';
  balance: number;
  createdAt: Date;
}

export interface Investment {
  id: string;
  userId: string;
  amount: number;
  status: 'pending' | 'active' | 'completed' | 'trading';
  paymentStatus: 'pending' | 'paid';
  profitAmount: number;
  tradingPeriod: number;
  expiryDate?: Date;
  createdAt: Date;
  profitPaidAt?: Date;
  paymentApprovedAt?: Date;
}

export interface Trade {
  id: string;
  adminId: string;
  amount: number;
  status: 'pending' | 'completed';
  profit: number;
  createdAt: Date;
  completedAt?: Date;
} 