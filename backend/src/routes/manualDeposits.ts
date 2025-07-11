import express from 'express';
import {
  createManualDepositRequest,
  getAllManualDepositRequests,
  approveManualDepositRequest,
  rejectManualDepositRequest
} from '../controllers/manualDepositController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// User creates a manual deposit request
router.post('/', authenticate, createManualDepositRequest);

// Admin gets all manual deposit requests
router.get('/', authenticate, authorize('admin'), getAllManualDepositRequests);

// Admin approves a manual deposit request
router.patch('/:requestId/approve', authenticate, authorize('admin'), approveManualDepositRequest);

// Admin rejects a manual deposit request
router.patch('/:requestId/reject', authenticate, authorize('admin'), rejectManualDepositRequest);

export default router; 