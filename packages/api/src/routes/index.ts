import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import vendorRoutes from './vendor.routes';
import orderRoutes from './order.routes';
import partnerRoutes from './partner.routes';
import adminRoutes from './admin.routes';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/vendors', vendorRoutes);
router.use('/orders', orderRoutes);
router.use('/partners', partnerRoutes);
router.use('/admin', adminRoutes);

export default router;
