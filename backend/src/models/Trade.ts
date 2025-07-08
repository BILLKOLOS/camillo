import mongoose, { Document, Schema } from 'mongoose';

export interface ITrade extends Document {
  adminId: mongoose.Types.ObjectId;
  amount: number;
  status: 'pending' | 'completed';
  profit: number;
  createdAt: Date;
  completedAt?: Date;
}

const TradeSchema = new Schema<ITrade>({
  adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  profit: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
});

export default mongoose.model<ITrade>('Trade', TradeSchema); 