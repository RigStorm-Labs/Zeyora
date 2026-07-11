import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { userService } from '../services/user.service';
import { vendorService } from '../services/vendor.service';
import { partnerService } from '../services/partner.service';
import { orderService } from '../services/order.service';
import { getPrisma } from '../config/database';

const router = Router();

// All routes require admin authentication
router.use(authenticate, authorize('admin'));

// Dashboard stats
router.get('/dashboard', async (req, res, next) => {
  try {
    const prisma = getPrisma();
    
    const [
      totalUsers,
      totalVendors,
      totalPartners,
      totalOrders,
      recentOrders,
      pendingKYC,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.vendor.count(),
      prisma.partner.count(),
      prisma.order.count(),
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          customer: { select: { firstName: true, lastName: true } },
          vendor: { select: { businessName: true } },
        },
      }),
      prisma.partner.findMany({
        where: { kycStatus: 'pending' },
        include: {
          user: { select: { firstName: true, lastName: true, phone: true } },
        },
        take: 10,
      }),
    ]);

    const todayRevenue = await prisma.order.aggregate({
      where: {
        status: 'delivered',
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
      _sum: { total: true },
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalVendors,
          totalPartners,
          totalOrders,
          todayRevenue: Number(todayRevenue._sum.total) || 0,
        },
        recentOrders,
        pendingKYC,
      },
    });
  } catch (error) {
    next(error);
  }
});

// User management
router.get('/users', async (req, res, next) => {
  try {
    const result = await userService.getAllUsers({
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
      role: req.query.role as string,
      status: req.query.status as string,
      search: req.query.search as string,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.put('/users/:id/suspend', async (req, res, next) => {
  try {
    await userService.suspendUser(req.params.id);
    res.json({ success: true, message: 'User suspended' });
  } catch (error) {
    next(error);
  }
});

router.put('/users/:id/reactivate', async (req, res, next) => {
  try {
    await userService.reactivateUser(req.params.id);
    res.json({ success: true, message: 'User reactivated' });
  } catch (error) {
    next(error);
  }
});

// Vendor management
router.get('/vendors', async (req, res, next) => {
  try {
    const prisma = getPrisma();
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const [vendors, total] = await Promise.all([
      prisma.vendor.findMany({
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.vendor.count(),
    ]);

    res.json({
      success: true,
      data: {
        vendors,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

router.put('/vendors/:id/approve', async (req, res, next) => {
  try {
    const prisma = getPrisma();
    const vendor = await prisma.vendor.update({
      where: { id: req.params.id },
      data: { isActive: true },
    });
    res.json({ success: true, data: vendor });
  } catch (error) {
    next(error);
  }
});

router.put('/vendors/:id/suspend', async (req, res, next) => {
  try {
    const prisma = getPrisma();
    const vendor = await prisma.vendor.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });
    res.json({ success: true, data: vendor });
  } catch (error) {
    next(error);
  }
});

// Partner management
router.get('/partners', async (req, res, next) => {
  try {
    const result = await partnerService.getAllPartners({
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
      kycStatus: req.query.kycStatus as string,
      isAvailable: req.query.isAvailable ? req.query.isAvailable === 'true' : undefined,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.put('/partners/:id/kyc/approve', async (req, res, next) => {
  try {
    const partner = await partnerService.updatePartnerStatus(req.params.id, 'verified');
    res.json({ success: true, data: partner });
  } catch (error) {
    next(error);
  }
});

router.put('/partners/:id/kyc/reject', async (req, res, next) => {
  try {
    const partner = await partnerService.updatePartnerStatus(req.params.id, 'rejected');
    res.json({ success: true, data: partner });
  } catch (error) {
    next(error);
  }
});

// Order management
router.get('/orders', async (req, res, next) => {
  try {
    const result = await orderService.getAllOrders(
      parseInt(req.query.page as string) || 1,
      parseInt(req.query.limit as string) || 20,
      {
        status: req.query.status as string,
        vendorId: req.query.vendorId as string,
        partnerId: req.query.partnerId as string,
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
      }
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// Analytics
router.get('/analytics', async (req, res, next) => {
  try {
    const prisma = getPrisma();
    const period = (req.query.period as 'day' | 'week' | 'month') || 'week';
    
    const dateFrom = new Date();
    switch (period) {
      case 'day':
        dateFrom.setHours(0, 0, 0, 0);
        break;
      case 'week':
        dateFrom.setDate(dateFrom.getDate() - 7);
        break;
      case 'month':
        dateFrom.setMonth(dateFrom.getMonth() - 1);
        break;
    }

    const [
      totalOrders,
      deliveredOrders,
      totalRevenue,
      avgOrderValue,
      ordersByStatus,
      topVendors,
    ] = await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: dateFrom } } }),
      prisma.order.count({ where: { status: 'delivered', createdAt: { gte: dateFrom } } }),
      prisma.order.aggregate({
        where: { status: 'delivered', createdAt: { gte: dateFrom } },
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where: { status: 'delivered', createdAt: { gte: dateFrom } },
        _avg: { total: true },
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: { id: true },
        where: { createdAt: { gte: dateFrom } },
      }),
      prisma.order.groupBy({
        by: ['vendorId'],
        _count: { id: true },
        _sum: { total: true },
        where: { status: 'delivered', createdAt: { gte: dateFrom }, vendorId: { not: null } },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
    ]);

    res.json({
      success: true,
      data: {
        period,
        totalOrders,
        deliveredOrders,
        totalRevenue: Number(totalRevenue._sum.total) || 0,
        avgOrderValue: Number(avgOrderValue._avg.total) || 0,
        ordersByStatus: ordersByStatus.reduce((acc, item) => {
          acc[item.status] = item._count.id;
          return acc;
        }, {} as Record<string, number>),
        topVendors,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Update commission rates
router.put('/commissions', async (req, res, next) => {
  try {
    const prisma = getPrisma();
    const { vendorId, commissionRate } = req.body;
    
    const vendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: { commissionRate },
    });
    
    res.json({ success: true, data: vendor });
  } catch (error) {
    next(error);
  }
});

// Coupons management
router.get('/coupons', async (req, res, next) => {
  try {
    const prisma = getPrisma();
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: coupons });
  } catch (error) {
    next(error);
  }
});

router.post('/coupons', async (req, res, next) => {
  try {
    const prisma = getPrisma();
    const coupon = await prisma.coupon.create({
      data: req.body,
    });
    res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    next(error);
  }
});

router.put('/coupons/:id', async (req, res, next) => {
  try {
    const prisma = getPrisma();
    const coupon = await prisma.coupon.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: coupon });
  } catch (error) {
    next(error);
  }
});

export default router;
