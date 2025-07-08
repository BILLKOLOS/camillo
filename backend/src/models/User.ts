import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  phone: string;
  role: 'client' | 'admin';
  balance: number;
  createdAt: Date;
  password: string;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['client', 'admin'], default: 'client' },
  balance: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  password: { type: String, required: true },
});

export default mongoose.model<IUser>('User', UserSchema); 