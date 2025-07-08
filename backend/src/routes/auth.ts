import { Router } from 'express';
import { register, login, getCurrentUser, getAllUsers } from '../controllers/authController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getCurrentUser);
router.get('/users', authenticate, authorize('admin'), getAllUsers);

export default router; 