import { Router, Request, Response } from 'express';
import ApiResponse from '../utils/ApiResponse';

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
// Route placeholders — will be mounted in later phases
// ──────────────────────────────────────────────
// router.use('/auth', authRoutes);      // Phase 3
// router.use('/users', userRoutes);     // Phase 3
// router.use('/shops', shopRoutes);     // Phase 4
// router.use('/products', productRoutes); // Phase 5
// router.use('/search', searchRoutes);  // Phase 7
// router.use('/rag', ragRoutes);        // Phase 10
// router.use('/analytics', analyticsRoutes); // Phase 11

export default router;
