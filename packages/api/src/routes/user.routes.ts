import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { userService } from '../services/user.service';
import { orderService } from '../services/order.service';

const router = Router();

// Get profile
router.get('/profile', authenticate, async (req, res, next) => {
  try {
    const profile = await userService.getProfile(req.user!.id);
    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
});

// Update profile
router.put('/profile', authenticate, async (req, res, next) => {
  try {
    const profile = await userService.updateProfile(req.user!.id, req.body);
    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
});

// Get addresses
router.get('/addresses', authenticate, async (req, res, next) => {
  try {
    const addresses = await userService.getAddresses(req.user!.id);
    res.json({ success: true, data: addresses });
  } catch (error) {
    next(error);
  }
});

// Add address
router.post('/addresses', authenticate, async (req, res, next) => {
  try {
    const address = await userService.addAddress(req.user!.id, req.body);
    res.status(201).json({ success: true, data: address });
  } catch (error) {
    next(error);
  }
});

// Update address
router.put('/addresses/:id', authenticate, async (req, res, next) => {
  try {
    const address = await userService.updateAddress(req.user!.id, req.params.id, req.body);
    res.json({ success: true, data: address });
  } catch (error) {
    next(error);
  }
});

// Delete address
router.delete('/addresses/:id', authenticate, async (req, res, next) => {
  try {
    await userService.deleteAddress(req.user!.id, req.params.id);
    res.json({ success: true, message: 'Address deleted' });
  } catch (error) {
    next(error);
  }
});

// Get orders
router.get('/orders', authenticate, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await orderService.getOrdersByCustomer(req.user!.id, page, limit);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// Get order by ID
router.get('/orders/:id', authenticate, async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id, req.user!.id, req.user!.role);
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
});

// Get wallet
router.get('/wallet', authenticate, async (req, res, next) => {
  try {
    const wallet = await userService.getWallet(req.user!.id);
    res.json({ success: true, data: wallet });
  } catch (error) {
    next(error);
  }
});

// Get loyalty program
router.get('/loyalty', authenticate, async (req, res, next) => {
  try {
    const loyalty = await userService.getLoyaltyProgram(req.user!.id);
    res.json({ success: true, data: loyalty });
  } catch (error) {
    next(error);
  }
});

// Update FCM token
router.put('/fcm-token', authenticate, async (req, res, next) => {
  try {
    await userService.updateFcmToken(req.user!.id, req.body.token);
    res.json({ success: true, message: 'FCM token updated' });
  } catch (error) {
    next(error);
  }
});

export default router;
