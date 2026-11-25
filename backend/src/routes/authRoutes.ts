import { Router } from 'express';
import { body } from 'express-validator';
import { getMe, login, register } from '../controllers/authController';
import { protect } from '../middleware/auth';
import validate from '../middleware/validate';

const router = Router();

router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['buyer', 'seller']).withMessage('Invalid role'),
  ],
  validate,
  register,
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login,
);

router.get('/me', protect, getMe);

export default router;
