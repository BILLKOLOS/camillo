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
import Investment from './models/Investment';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || '';

// Enhanced CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [
      'https://camillo-frontend.onrender.com', // Production frontend URL
      'http://localhost:3000', // Local development frontend
      'http://localhost:3001', // Alternative local development port
      'http://127.0.0.1:3000', // Alternative localhost format
      'http://127.0.0.1:3001', // Alternative localhost format
      'https://camillo-investments.vercel.app', // Vercel deployment if any
      'https://camillo-investments.netlify.app' // Netlify deployment if any
    ];

// CORS configuration with more detailed options
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
}));

// Handle preflight requests explicitly
app.options('*', cors());

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/manual-deposits', manualDepositRoutes);

// Scheduled task to complete expired investments
const completeExpiredInvestments = async () => {
  try {
    const now = new Date();
    const result = await Investment.updateMany(
      { expiryDate: { $lte: now }, status: 'active' },
      { 
        status: 'completed',
        withdrawalStatus: 'pending'
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log(`Completed ${result.modifiedCount} expired investments`);
    }
  } catch (error) {
    console.error('Error completing expired investments:', error);
  }
};

// Run the task every 5 minutes
setInterval(completeExpiredInvestments, 5 * 60 * 1000);

// Also run it once on startup
completeExpiredInvestments();

app.use(errorHandler);

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    console.log('Allowed CORS origins:', allowedOrigins);
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  }); 