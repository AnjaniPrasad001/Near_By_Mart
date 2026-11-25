import { Router } from 'express';
import { body } from 'express-validator';
import {
  createProduct,
  deleteProduct,
  getCategories,
  getProducts,
  updateProduct,
} from '../controllers/productController';
import { authorize, protect } from '../middleware/auth';
import validate from '../middleware/validate';

const router = Router();

router.get('/', getProducts);
router.get('/categories', getCategories);

router.post(
  '/',
  protect,
  authorize('seller'),
  [
    body('shopId').notEmpty().withMessage('Shop ID is required'),
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  ],
  validate,
  createProduct,
);

router.patch('/:id', protect, authorize('seller'), updateProduct);
router.delete('/:id', protect, authorize('seller'), deleteProduct);

export default router;
