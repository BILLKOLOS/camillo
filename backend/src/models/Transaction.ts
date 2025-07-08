import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'deposit' | 'withdrawal' | 'profit';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  userName?: string;
  userPhone?: string;
}

const TransactionSchema = new Schema<ITransaction>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['deposit', 'withdrawal', 'profit'], required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  userName: { type: String },
  userPhone: { type: String },
});

export default mongoose.model<ITransaction>('Transaction', TransactionSchema); 