import { getPrisma } from '../config/database';
import { AppError } from '@zeyora/shared';

export class PartnerService {
  async getPartnerById(partnerId: string): Promise<any> {
    const prisma = getPrisma();

    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!partner) {
      throw new AppError('PARTNER_1301', 'Partner not found', 404);
    }

    return partner;
  }

  async registerPartner(userId: string, data: any): Promise<any> {
    const prisma = getPrisma();

    const existingPartner = await prisma.partner.findUnique({
      where: { userId },
    });

    if (existingPartner) {
      throw new AppError('ERROR_1906', 'User already has a partner profile', 409);
    }

    const partner = await prisma.partner.create({
      data: {
        userId,
        vehicleType: data.vehicleType,
        vehicleNumber: data.vehicleNumber,
        licenseNumber: data.licenseNumber,
        kycStatus: 'pending',
        kycDocuments: data.kycDocuments || {},
        bankDetails: data.bankDetails || {},
      },
    });

    // Update user role
    await prisma.user.update({
      where: { id: userId },
      data: { role: 'partner' },
    });

    return partner;
  }

  async submitKYC(partnerId: string, documents: any): Promise<any> {
    const prisma = getPrisma();

    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
    });

    if (!partner) {
      throw new AppError('PARTNER_1301', 'Partner not found', 404);
    }

    const updatedPartner = await prisma.partner.update({
      where: { id: partnerId },
      data: {
        kycDocuments: documents,
        kycStatus: 'pending', // Will be verified by admin
      },
    });

    return updatedPartner;
  }

  async updateLocation(partnerId: string, location: {
    latitude: number;
    longitude: number;
    heading?: number;
    speed?: number;
  }): Promise<void> {
    const prisma = getPrisma();

    await prisma.partner.update({
      where: { id: partnerId },
      data: {
        currentLocation: {
          latitude: location.latitude,
          longitude: location.longitude,
          heading: location.heading,
          speed: location.speed,
          timestamp: new Date().toISOString(),
        },
      },
    });

    // In production, emit to WebSocket for real-time tracking
  }

  async toggleAvailability(partnerId: string, isAvailable: boolean): Promise<any> {
    const prisma = getPrisma();

    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
    });

    if (!partner) {
      throw new AppError('PARTNER_1301', 'Partner not found', 404);
    }

    if (partner.kycStatus !== 'verified' && isAvailable) {
      throw new AppError('PARTNER_1302', 'KYC must be verified to go online', 400);
    }

    const updatedPartner = await prisma.partner.update({
      where: { id: partnerId },
      data: { isAvailable },
    });

    return updatedPartner;
  }

  async getAvailableOrders(partnerId: string, location?: {
    latitude: number;
    longitude: number;
  }): Promise<any[]> {
    const prisma = getPrisma();

    // Get orders that are ready and don't have a partner assigned
    const orders = await prisma.order.findMany({
      where: {
        status: 'ready',
        partnerId: null,
      },
      include: {
        vendor: {
          select: {
            id: true,
            businessName: true,
            address: true,
            latitude: true,
            longitude: true,
          },
        },
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // If location provided, sort by distance
    if (location) {
      return orders.map((order) => ({
        ...order,
        distance: this.calculateDistance(
          location.latitude,
          location.longitude,
          order.vendor.latitude ? Number(order.vendor.latitude) : 0,
          order.vendor.longitude ? Number(order.vendor.longitude) : 0
        ),
      })).sort((a, b) => a.distance - b.distance);
    }

    return orders;
  }

  async acceptOrder(partnerId: string, orderId: string): Promise<any> {
    const prisma = getPrisma();

    const [partner, order] = await Promise.all([
      prisma.partner.findUnique({ where: { id: partnerId } }),
      prisma.order.findUnique({ where: { id: orderId } }),
    ]);

    if (!partner) {
      throw new AppError('PARTNER_1301', 'Partner not found', 404);
    }

    if (!order) {
      throw new AppError('ORDER_1401', 'Order not found', 404);
    }

    if (partner.kycStatus !== 'verified') {
      throw new AppError('PARTNER_1302', 'KYC must be verified to accept orders', 400);
    }

    if (!partner.isAvailable) {
      throw new AppError('PARTNER_1304', 'Partner is not available', 400);
    }

    if (order.status !== 'ready') {
      throw new AppError('ORDER_1404', 'Order is not ready for pickup', 400);
    }

    if (order.partnerId) {
      throw new AppError('ORDER_1404', 'Order already assigned to another partner', 400);
    }

    // Update order and partner
    const [updatedOrder] = await Promise.all([
      prisma.order.update({
        where: { id: orderId },
        data: {
          partnerId,
          status: 'assigned',
        },
      }),
      prisma.partner.update({
        where: { id: partnerId },
        data: { isAvailable: false },
      }),
      prisma.orderStatusHistory.create({
        data: {
          orderId,
          status: 'assigned',
          notes: `Order accepted by partner ${partnerId}`,
          changedBy: partnerId,
        },
      }),
    ]);

    return updatedOrder;
  }

  async rejectOrder(partnerId: string, orderId: string): Promise<void> {
    const prisma = getPrisma();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new AppError('ORDER_1401', 'Order not found', 404);
    }

    if (order.status !== 'ready') {
      throw new AppError('ORDER_1404', 'Order cannot be rejected', 400);
    }

    // Log rejection (in production, track rejection rate)
    // Could add to a rejection log or update partner stats
  }

  async getEarnings(partnerId: string, period: 'day' | 'week' | 'month' = 'week'): Promise<any> {
    const prisma = getPrisma();

    const dateFrom = this.getDateFromPeriod(period);

    const orders = await prisma.order.findMany({
      where: {
        partnerId,
        status: 'delivered',
        createdAt: { gte: dateFrom },
      },
      select: {
        id: true,
        total: true,
        deliveryFee: true,
        createdAt: true,
      },
    });

    const totalEarnings = orders.reduce((sum, order) => sum + Number(order.deliveryFee), 0);
    const orderCount = orders.length;
    const avgEarningPerOrder = orderCount > 0 ? totalEarnings / orderCount : 0;

    return {
      period,
      totalEarnings,
      orderCount,
      avgEarningPerOrder,
      dailyBreakdown: this.groupByDay(orders),
    };
  }

  async triggerSOS(partnerId: string, orderId?: string): Promise<void> {
    const prisma = getPrisma();

    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
      include: {
        user: true,
      },
    });

    if (!partner) {
      throw new AppError('PARTNER_1301', 'Partner not found', 404);
    }

    // In production:
    // 1. Create SOS alert in database
    // 2. Send push notification to emergency contacts
    // 3. Notify admin dashboard
    // 4. Alert local authorities if needed
    // 5. Share live location

    console.log(`SOS triggered by partner ${partnerId}`, {
      user: partner.user,
      orderId,
      location: partner.currentLocation,
      timestamp: new Date().toISOString(),
    });
  }

  async getAllPartners(params: {
    page?: number;
    limit?: number;
    kycStatus?: string;
    isAvailable?: boolean;
  } = {}): Promise<{ partners: any[]; total: number; pages: number }> {
    const prisma = getPrisma();
    const { page = 1, limit = 20, kycStatus, isAvailable } = params;

    const where: any = {};
    if (kycStatus) where.kycStatus = kycStatus;
    if (isAvailable !== undefined) where.isAvailable = isAvailable;

    const [partners, total] = await Promise.all([
      prisma.partner.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              email: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.partner.count({ where }),
    ]);

    return {
      partners,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  async updatePartnerStatus(partnerId: string, kycStatus: string): Promise<any> {
    const prisma = getPrisma();

    const partner = await prisma.partner.update({
      where: { id: partnerId },
      data: { kycStatus },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    return partner;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private getDateFromPeriod(period: string): Date {
    const now = new Date();
    switch (period) {
      case 'day':
        return new Date(now.setHours(0, 0, 0, 0));
      case 'week':
        return new Date(now.setDate(now.getDate() - 7));
      case 'month':
        return new Date(now.setMonth(now.getMonth() - 1));
      default:
        return new Date(now.setDate(now.getDate() - 7));
    }
  }

  private groupByDay(orders: any[]): Record<string, { count: number; earnings: number }> {
    const stats: Record<string, { count: number; earnings: number }> = {};

    orders.forEach((order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!stats[date]) {
        stats[date] = { count: 0, earnings: 0 };
      }
      stats[date].count++;
      stats[date].earnings += Number(order.deliveryFee);
    });

    return stats;
  }
}

export const partnerService = new PartnerService();
