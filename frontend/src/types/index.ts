// Updated types for Camillo Investments - 60% Profit Trading System
export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: 'client' | 'admin';
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

export interface Transaction {
  id: string;
  _id?: string; // MongoDB ID, optional for compatibility
  userId: string | { name: string; phone: string };
  type: 'deposit' | 'withdrawal' | 'profit';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
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

export interface MPESAMessage {
  rawMessage: string;
  senderName: string;
  phoneNumber: string;
  amount: number;
  timestamp: Date;
  transactionId: string;
}

export interface MPESABot {
  start(): Promise<void>;
  stop(): Promise<void>;
  onNewMessage(callback: (message: MPESAMessage) => Promise<void>): void;
} 