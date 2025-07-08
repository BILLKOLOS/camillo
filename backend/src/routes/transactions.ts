import { Router } from 'express';
import {
  createTransaction,
  getUserTransactions,
  getAllTransactions,
  getTransactionStats,
  getPendingWithdrawals,
  approveWithdrawal,
  createProfitTransaction
} from '../controllers/transactionController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Client
router.post('/', authenticate, createTransaction);
router.get('/my-transactions', authenticate, getUserTransactions);

// Admin
router.get('/', authenticate, authorize('admin'), getAllTransactions);
router.get('/stats', authenticate, authorize('admin'), getTransactionStats);
router.get('/pending-withdrawals', authenticate, authorize('admin'), getPendingWithdrawals);
router.patch('/:transactionId/approve', authenticate, authorize('admin'), approveWithdrawal);
router.post('/profit', authenticate, authorize('admin'), createProfitTransaction);

export default router; 