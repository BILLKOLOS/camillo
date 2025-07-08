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
  getAdminNotifications
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

export default router; 