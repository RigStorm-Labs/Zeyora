import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { orderService } from '../services/order.service';

const router = Router();

// Create order
router.post('/', authenticate, async (req, res, next) => {
  try {
    const order = await orderService.createOrder(req.user!.id, req.body);
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
});

// Get order by ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id, req.user!.id, req.user!.role);
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
});

// Update order status
router.put('/:id/status', authenticate, async (req, res, next) => {
  try {
    const order = await orderService.updateOrderStatus(
      req.params.id,
      req.body.status,
      req.user!.id,
      req.body.notes
    );
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
});

// Cancel order
router.post('/:id/cancel', authenticate, async (req, res, next) => {
  try {
    const order = await orderService.cancelOrder(req.params.id, req.user!.id, req.body.reason);
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
});

// Rate order
router.post('/:id/rate', authenticate, async (req, res, next) => {
  try {
    const review = await orderService.rateOrder(
      req.params.id,
      req.user!.id,
      req.body.rating,
      req.body.review
    );
    res.json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
});

// Assign partner to order (admin/vendor only)
router.post('/:id/assign', authenticate, async (req, res, next) => {
  try {
    const order = await orderService.assignPartner(req.params.id, req.body.partnerId);
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
});

// Track order (real-time tracking endpoint)
router.get('/:id/track', authenticate, async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id, req.user!.id, req.user!.role);
    // In production, this would also include real-time partner location
    res.json({
      success: true,
      data: {
        orderId: order.id,
        status: order.status,
        estimatedDelivery: order.estimatedDelivery,
        partner: order.partner ? {
          id: order.partner.id,
          name: `${order.partner.user.firstName} ${order.partner.user.lastName}`,
          currentLocation: order.partner.currentLocation,
        } : null,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
