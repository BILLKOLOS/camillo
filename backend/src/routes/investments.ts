import { Router } from 'express';
import {
  createInvestment,
  getClientInvestments,
  getAllInvestments,
  getInvestmentsByPhone,
  getCompletedPendingPayments,
  getExpiredInvestments,
  completeExpiredInvestments,
  approvePayment,
  updateUserBalance,
  searchUsersByPhone,
  updateInvestmentStatus,
  getInvestmentStats,
  getAdminNotifications,
  getUserDeposits,
  getTotalInvestments,
  getPendingWithdrawals,
  approveWithdrawal,
  debugInvestmentStatuses
} from '../controllers/investmentController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Client
router.post('/', authenticate, createInvestment);
router.get('/my-investments', authenticate, getClientInvestments);

// Admin
router.get('/', authenticate, authorize('admin'), getAllInvestments);
router.get('/phone/:phone', authenticate, authorize('admin'), getInvestmentsByPhone);
router.get('/pending-payments', authenticate, authorize('admin'), getCompletedPendingPayments);
router.get('/expired', authenticate, authorize('admin'), getExpiredInvestments);
router.post('/complete-expired', authenticate, authorize('admin'), completeExpiredInvestments);
router.patch('/:investmentId/approve-payment', authenticate, authorize('admin'), approvePayment);
router.patch('/user/:userId/balance', authenticate, authorize('admin'), updateUserBalance);
router.get('/search-users/:phone', authenticate, authorize('admin'), searchUsersByPhone);
router.patch('/:investmentId/status', authenticate, authorize('admin'), updateInvestmentStatus);
router.get('/stats', authenticate, authorize('admin'), getInvestmentStats);
router.get('/admin/notifications', authenticate, authorize('admin'), getAdminNotifications);

// New routes for the three major transaction types
router.get('/admin/user-deposits', authenticate, authorize('admin'), getUserDeposits);
router.get('/admin/total-investments', authenticate, authorize('admin'), getTotalInvestments);
router.get('/admin/pending-withdrawals', authenticate, authorize('admin'), getPendingWithdrawals);
router.patch('/admin/:investmentId/approve-withdrawal', authenticate, authorize('admin'), approveWithdrawal);

// Debug route
router.get('/admin/debug-statuses', authenticate, authorize('admin'), debugInvestmentStatuses);

export default router; 