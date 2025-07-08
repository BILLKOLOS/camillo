import { Router } from 'express';
import { createTrade, getAllTrades, completeTrade } from '../controllers/tradeController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, authorize('admin'), createTrade);
router.get('/', authenticate, authorize('admin'), getAllTrades);
router.patch('/:tradeId/complete', authenticate, authorize('admin'), completeTrade);

export default router; 