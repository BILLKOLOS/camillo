import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import investmentRoutes from './routes/investments';
import transactionRoutes from './routes/transactions';
import tradeRoutes from './routes/trades';
import manualDepositRoutes from './routes/manualDeposits';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || '';

app.use(cors({
  origin: ['https://camillo-frontend.onrender.com'], // Replace with your actual frontend URL
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/manual-deposits', manualDepositRoutes);

app.use(errorHandler);

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  }); 