import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { partnerService } from '../services/partner.service';
import { orderService } from '../services/order.service';

const router = Router();

// Register as partner
router.post('/register', authenticate, async (req, res, next) => {
  try {
    const partner = await partnerService.registerPartner(req.user!.id, req.body);
    res.status(201).json({ success: true, data: partner });
  } catch (error) {
    next(error);
  }
});

// Get partner profile
router.get('/profile', authenticate, authorize('partner'), async (req, res, next) => {
  try {
    // Get partner ID from user
    const { getPrisma } = await import('../config/database');
    const prisma = getPrisma();
    const partner = await prisma.partner.findUnique({
      where: { userId: req.user!.id },
    });
    
    if (!partner) {
      throw new Error('Partner profile not found');
    }
    
    const profile = await partnerService.getPartnerById(partner.id);
    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
});

// Submit KYC documents
router.post('/kyc', authenticate, authorize('partner'), async (req, res, next) => {
  try {
    const { getPrisma } = await import('../config/database');
    const prisma = getPrisma();
    const partner = await prisma.partner.findUnique({
      where: { userId: req.user!.id },
    });
    
    if (!partner) {
      throw new Error('Partner profile not found');
    }
    
    const updatedPartner = await partnerService.submitKYC(partner.id, req.body);
    res.json({ success: true, data: updatedPartner });
  } catch (error) {
    next(error);
  }
});

// Update location
router.put('/location', authenticate, authorize('partner'), async (req, res, next) => {
  try {
    const { getPrisma } = await import('../config/database');
    const prisma = getPrisma();
    const partner = await prisma.partner.findUnique({
      where: { userId: req.user!.id },
    });
    
    if (!partner) {
      throw new Error('Partner profile not found');
    }
    
    await partnerService.updateLocation(partner.id, req.body);
    res.json({ success: true, message: 'Location updated' });
  } catch (error) {
    next(error);
  }
});

// Toggle availability
router.put('/availability', authenticate, authorize('partner'), async (req, res, next) => {
  try {
    const { getPrisma } = await import('../config/database');
    const prisma = getPrisma();
    const partner = await prisma.partner.findUnique({
      where: { userId: req.user!.id },
    });
    
    if (!partner) {
      throw new Error('Partner profile not found');
    }
    
    const updatedPartner = await partnerService.toggleAvailability(partner.id, req.body.isAvailable);
    res.json({ success: true, data: updatedPartner });
  } catch (error) {
    next(error);
  }
});

// Get available orders
router.get('/orders/available', authenticate, authorize('partner'), async (req, res, next) => {
  try {
    const { getPrisma } = await import('../config/database');
    const prisma = getPrisma();
    const partner = await prisma.partner.findUnique({
      where: { userId: req.user!.id },
    });
    
    if (!partner) {
      throw new Error('Partner profile not found');
    }
    
    const orders = await partnerService.getAvailableOrders(partner.id, req.body.location);
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
});

// Accept order
router.post('/orders/:orderId/accept', authenticate, authorize('partner'), async (req, res, next) => {
  try {
    const { getPrisma } = await import('../config/database');
    const prisma = getPrisma();
    const partner = await prisma.partner.findUnique({
      where: { userId: req.user!.id },
    });
    
    if (!partner) {
      throw new Error('Partner profile not found');
    }
    
    const order = await partnerService.acceptOrder(partner.id, req.params.orderId);
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
});

// Reject order
router.post('/orders/:orderId/reject', authenticate, authorize('partner'), async (req, res, next) => {
  try {
    const { getPrisma } = await import('../config/database');
    const prisma = getPrisma();
    const partner = await prisma.partner.findUnique({
      where: { userId: req.user!.id },
    });
    
    if (!partner) {
      throw new Error('Partner profile not found');
    }
    
    await partnerService.rejectOrder(partner.id, req.params.orderId);
    res.json({ success: true, message: 'Order rejected' });
  } catch (error) {
    next(error);
  }
});

// Get earnings
router.get('/earnings', authenticate, authorize('partner'), async (req, res, next) => {
  try {
    const { getPrisma } = await import('../config/database');
    const prisma = getPrisma();
    const partner = await prisma.partner.findUnique({
      where: { userId: req.user!.id },
    });
    
    if (!partner) {
      throw new Error('Partner profile not found');
    }
    
    const earnings = await partnerService.getEarnings(
      partner.id,
      (req.query.period as 'day' | 'week' | 'month') || 'week'
    );
    res.json({ success: true, data: earnings });
  } catch (error) {
    next(error);
  }
});

// SOS - Emergency
router.post('/sos', authenticate, authorize('partner'), async (req, res, next) => {
  try {
    const { getPrisma } = await import('../config/database');
    const prisma = getPrisma();
    const partner = await prisma.partner.findUnique({
      where: { userId: req.user!.id },
    });
    
    if (!partner) {
      throw new Error('Partner profile not found');
    }
    
    await partnerService.triggerSOS(partner.id, req.body.orderId);
    res.json({ success: true, message: 'SOS alert triggered' });
  } catch (error) {
    next(error);
  }
});

// Get partner's active and past orders
router.get('/orders', authenticate, authorize('partner'), async (req, res, next) => {
  try {
    const { getPrisma } = await import('../config/database');
    const prisma = getPrisma();
    const partner = await prisma.partner.findUnique({
      where: { userId: req.user!.id },
    });
    
    if (!partner) {
      throw new Error('Partner profile not found');
    }
    
    const result = await orderService.getOrdersByPartner(
      partner.id,
      parseInt(req.query.page as string) || 1,
      parseInt(req.query.limit as string) || 20,
      req.query.status as string
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

export default router;
