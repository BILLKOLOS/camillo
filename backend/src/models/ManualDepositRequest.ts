import mongoose, { Document, Schema } from 'mongoose';

export interface IManualDepositRequest extends Document {
  user: mongoose.Types.ObjectId;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const ManualDepositRequestSchema = new Schema<IManualDepositRequest>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true });

export default mongoose.model<IManualDepositRequest>('ManualDepositRequest', ManualDepositRequestSchema); 