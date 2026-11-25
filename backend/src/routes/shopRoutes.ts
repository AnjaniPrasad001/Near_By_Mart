import { Router } from 'express';
import { body } from 'express-validator';
import {
  createShop,
  getMyShops,
  getShopById,
  getShops,
  updateShop,
} from '../controllers/shopController';
import { authorize, protect } from '../middleware/auth';
import validate from '../middleware/validate';

const router = Router();

router.get('/', getShops);
router.get('/my-shops', protect, authorize('seller'), getMyShops);
router.get('/:id', getShopById);

router.post(
  '/',
  protect,
  authorize('seller'),
  [
    body('name').trim().notEmpty().withMessage('Shop name is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('address').trim().notEmpty().withMessage('Address is required'),
    body('city').trim().notEmpty().withMessage('City is required'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
  ],
  validate,
  createShop,
);

router.patch('/:id', protect, authorize('seller'), updateShop);

export default router;
