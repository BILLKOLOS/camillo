import mongoose, { Document, Schema } from 'mongoose';

export interface IInvestment extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  status: 'pending' | 'active' | 'completed' | 'trading';
  paymentStatus: 'pending' | 'paid';
  profitAmount: number;
  tradingPeriod: number;
  expiryDate?: Date;
  createdAt: Date;
  profitPaidAt?: Date;
  paymentApprovedAt?: Date;
  // Additional fields for better tracking
  userName?: string;
  userPhone?: string;
  withdrawalStatus?: 'pending' | 'paid';
  withdrawalApprovedAt?: Date;
}

const InvestmentSchema = new Schema<IInvestment>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'active', 'completed', 'trading'], default: 'pending' },
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  profitAmount: { type: Number, default: 0 },
  tradingPeriod: { type: Number, default: 24 },
  expiryDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  profitPaidAt: { type: Date },
  paymentApprovedAt: { type: Date },
  // Additional fields for better tracking
  userName: { type: String },
  userPhone: { type: String },
  withdrawalStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  withdrawalApprovedAt: { type: Date },
});

export default mongoose.model<IInvestment>('Investment', InvestmentSchema); 