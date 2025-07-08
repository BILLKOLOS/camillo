import express from 'express';
import {
  createManualDepositRequest,
  getAllManualDepositRequests,
  approveManualDepositRequest,
  rejectManualDepositRequest
} from '../controllers/manualDepositController';
// import { authMiddleware, adminMiddleware } from '../middleware/auth'; // Uncomment if you have these

const router = express.Router();

// User creates a manual deposit request
router.post('/', /*authMiddleware,*/ createManualDepositRequest);

// Admin gets all manual deposit requests
router.get('/', /*authMiddleware, adminMiddleware,*/ getAllManualDepositRequests);

// Admin approves a manual deposit request
router.patch('/:requestId/approve', /*authMiddleware, adminMiddleware,*/ approveManualDepositRequest);

// Admin rejects a manual deposit request
router.patch('/:requestId/reject', /*authMiddleware, adminMiddleware,*/ rejectManualDepositRequest);

export default router; 