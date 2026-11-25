import { Router, Request, Response } from 'express';
import ApiResponse from '../utils/ApiResponse';
import authRoutes from './authRoutes';
import shopRoutes from './shopRoutes';
import productRoutes from './productRoutes';
import assistantRoutes from './assistantRoutes';

const router = Router();

// ──────────────────────────────────────────────
// Health check — GET /api/health
// ──────────────────────────────────────────────
router.get('/health', (_req: Request, res: Response) => {
  ApiResponse.success(res, {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ──────────────────────────────────────────────
// Feature API routes
// ──────────────────────────────────────────────
router.use('/auth', authRoutes);
router.use('/shops', shopRoutes);
router.use('/products', productRoutes);
router.use('/assistant', assistantRoutes);

export default router;
