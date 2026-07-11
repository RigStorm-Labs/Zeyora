import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { vendorService } from '../services/vendor.service';
import { orderService } from '../services/order.service';
import { AppError } from '@zeyora/shared';

const router = Router();

// Get all vendors (public)
router.get('/', async (req, res, next) => {
  try {
    const result = await vendorService.getVendors({
      latitude: req.query.lat ? parseFloat(req.query.lat as string) : undefined,
      longitude: req.query.lng ? parseFloat(req.query.lng as string) : undefined,
      radius: req.query.radius ? parseFloat(req.query.radius as string) : undefined,
      category: req.query.category as string,
      search: req.query.search as string,
      sortBy: req.query.sortBy as string,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// Get vendor by ID
router.get('/:id', async (req, res, next) => {
  try {
    const vendor = await vendorService.getVendorById(req.params.id);
    res.json({ success: true, data: vendor });
  } catch (error) {
    next(error);
  }
});

// Register as vendor (authenticated users only)
router.post('/register', authenticate, async (req, res, next) => {
  try {
    const vendor = await vendorService.registerVendor(req.user!.id, req.body);
    res.status(201).json({ success: true, data: vendor });
  } catch (error) {
    next(error);
  }
});

// Update vendor profile
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const vendor = await vendorService.updateVendor(req.params.id, req.user!.id, req.body);
    res.json({ success: true, data: vendor });
  } catch (error) {
    next(error);
  }
});

// Get vendor products
router.get('/:id/products', async (req, res, next) => {
  try {
    const result = await vendorService.getProducts(req.params.id, {
      category: req.query.category as string,
      search: req.query.search as string,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 50,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// Add product
router.post('/:id/products', authenticate, async (req, res, next) => {
  try {
    const product = await vendorService.createProduct(req.params.id, req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
});

// Update product
router.put('/:id/products/:productId', authenticate, async (req, res, next) => {
  try {
    const product = await vendorService.updateProduct(req.params.id, req.params.productId, req.body);
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
});

// Delete product
router.delete('/:id/products/:productId', authenticate, async (req, res, next) => {
  try {
    await vendorService.deleteProduct(req.params.id, req.params.productId);
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
});

// Get vendor orders
router.get('/:id/orders', authenticate, async (req, res, next) => {
  try {
    const result = await orderService.getOrdersByVendor(
      req.params.id,
      parseInt(req.query.page as string) || 1,
      parseInt(req.query.limit as string) || 20,
      req.query.status as string
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// Update order status
router.put('/:id/orders/:orderId', authenticate, async (req, res, next) => {
  try {
    const order = await orderService.updateOrderStatus(
      req.params.orderId,
      req.body.status,
      req.user!.id,
      req.body.notes
    );
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
});

// Get vendor analytics
router.get('/:id/analytics', authenticate, async (req, res, next) => {
  try {
    const analytics = await vendorService.getVendorAnalytics(
      req.params.id,
      (req.query.period as 'day' | 'week' | 'month') || 'day'
    );
    res.json({ success: true, data: analytics });
  } catch (error) {
    next(error);
  }
});

export default router;
