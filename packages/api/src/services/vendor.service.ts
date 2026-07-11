import { ObjectId } from 'mongodb';
import { getPrisma } from '../config/database';
import { getMongo } from '../config/database';
import { AppError } from '@zeyora/shared';
import type { CreateProductRequest, UpdateProductRequest } from '@zeyora/shared';

export class VendorService {
  async getVendorById(vendorId: string): Promise<any> {
    const prisma = getPrisma();

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!vendor) {
      throw new AppError('VENDOR_1201', 'Vendor not found', 404);
    }

    return vendor;
  }

  async getVendors(params: {
    latitude?: number;
    longitude?: number;
    radius?: number;
    category?: string;
    search?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  }): Promise<{ vendors: any[]; total: number }> {
    const prisma = getPrisma();
    const mongo = getMongo();

    const { latitude, longitude, radius = 5, category, search, sortBy = 'rating', page = 1, limit = 20 } = params;

    const where: any = {
      isActive: true,
      isOpen: true,
    };

    if (category) {
      where.businessType = category;
    }

    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const vendors = await prisma.vendor.findMany({
      where,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: sortBy === 'rating' ? { rating: 'desc' } : { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Filter by distance if coordinates provided
    let filteredVendors = vendors;
    if (latitude && longitude) {
      filteredVendors = vendors.filter((vendor) => {
        if (!vendor.latitude || !vendor.longitude) return true;
        const distance = this.calculateDistance(
          latitude,
          longitude,
          Number(vendor.latitude),
          Number(vendor.longitude)
        );
        return distance <= radius;
      });
    }

    const total = await prisma.vendor.count({ where });

    return {
      vendors: filteredVendors,
      total,
    };
  }

  async registerVendor(userId: string, data: any): Promise<any> {
    const prisma = getPrisma();

    // Check if user already has a vendor profile
    const existingVendor = await prisma.vendor.findUnique({
      where: { userId },
    });

    if (existingVendor) {
      throw new AppError('ERROR_1906', 'User already has a vendor profile', 409);
    }

    const vendor = await prisma.vendor.create({
      data: {
        userId,
        businessName: data.businessName,
        businessType: data.businessType,
        description: data.description,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        operatingHours: data.operatingHours || {},
        bankDetails: data.bankDetails || {},
      },
    });

    // Update user role
    await prisma.user.update({
      where: { id: userId },
      data: { role: 'vendor' },
    });

    return vendor;
  }

  async updateVendor(vendorId: string, userId: string, data: any): Promise<any> {
    const prisma = getPrisma();

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) {
      throw new AppError('VENDOR_1201', 'Vendor not found', 404);
    }

    if (vendor.userId !== userId) {
      throw new AppError('ERROR_1905', 'Access denied', 403);
    }

    const updatedVendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        businessName: data.businessName,
        description: data.description,
        operatingHours: data.operatingHours,
        isOpen: data.isOpen,
        minimumOrder: data.minimumOrder,
        deliveryFee: data.deliveryFee,
        averagePreparationTime: data.averagePreparationTime,
      },
    });

    return updatedVendor;
  }

  // Product Management (MongoDB)
  async getProducts(vendorId: string, params: {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ products: any[]; total: number }> {
    const mongo = getMongo();
    const { category, search, page = 1, limit = 50 } = params;

    const filter: any = { vendorId, isActive: true };

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const [products, total] = await Promise.all([
      mongo.collection('products')
        .find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
      mongo.collection('products').countDocuments(filter),
    ]);

    return { products, total };
  }

  async getProductById(productId: string): Promise<any> {
    const mongo = getMongo();

    const product = await mongo.collection('products').findOne({
      _id: new ObjectId(productId),
    });

    if (!product) {
      throw new AppError('PRODUCT_1601', 'Product not found', 404);
    }

    return product;
  }

  async createProduct(vendorId: string, data: CreateProductRequest): Promise<any> {
    const mongo = getMongo();

    const vendor = await getPrisma().vendor.findUnique({ where: { id: vendorId } });
    if (!vendor) {
      throw new AppError('VENDOR_1201', 'Vendor not found', 404);
    }

    const product = {
      vendorId,
      name: data.name,
      description: data.description,
      category: data.category,
      subcategory: data.subcategory,
      images: data.images || [],
      price: data.price,
      compareAtPrice: data.compareAtPrice,
      currency: data.currency || 'INR',
      unit: data.unit,
      inStock: data.inStock !== false,
      stockQuantity: data.stockQuantity || 0,
      variants: data.variants || [],
      addOns: data.addOns || [],
      preparationTime: data.preparationTime,
      tags: data.tags || [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await mongo.collection('products').insertOne(product);

    return { ...product, _id: result.insertedId };
  }

  async updateProduct(vendorId: string, productId: string, data: UpdateProductRequest): Promise<any> {
    const mongo = getMongo();

    const product = await mongo.collection('products').findOne({
      _id: new ObjectId(productId),
      vendorId,
    });

    if (!product) {
      throw new AppError('PRODUCT_1601', 'Product not found', 404);
    }

    const updateData: any = { ...data, updatedAt: new Date() };
    delete updateData._id;

    await mongo.collection('products').updateOne(
      { _id: new ObjectId(productId) },
      { $set: updateData }
    );

    return mongo.collection('products').findOne({ _id: new ObjectId(productId) });
  }

  async deleteProduct(vendorId: string, productId: string): Promise<void> {
    const mongo = getMongo();

    const result = await mongo.collection('products').updateOne(
      { _id: new ObjectId(productId), vendorId },
      { $set: { isActive: false, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      throw new AppError('PRODUCT_1601', 'Product not found', 404);
    }
  }

  async getVendorAnalytics(vendorId: string, period: 'day' | 'week' | 'month' = 'day'): Promise<any> {
    const prisma = getPrisma();

    const dateFrom = this.getDateFromPeriod(period);

    const [orders, totalRevenue] = await Promise.all([
      prisma.order.findMany({
        where: {
          vendorId,
          createdAt: { gte: dateFrom },
          status: 'delivered',
        },
        select: {
          id: true,
          total: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.order.aggregate({
        where: {
          vendorId,
          createdAt: { gte: dateFrom },
          status: 'delivered',
        },
        _sum: { total: true },
      }),
    ]);

    const dailyStats = this.groupOrdersByDay(orders);
    const totalOrders = orders.length;
    const revenue = Number(totalRevenue._sum.total) || 0;

    return {
      period,
      totalOrders,
      totalRevenue: revenue,
      averageOrderValue: totalOrders > 0 ? revenue / totalOrders : 0,
      dailyStats,
    };
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
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
        return new Date(now.setHours(0, 0, 0, 0));
    }
  }

  private groupOrdersByDay(orders: any[]): Record<string, { orders: number; revenue: number }> {
    const stats: Record<string, { orders: number; revenue: number }> = {};

    orders.forEach((order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!stats[date]) {
        stats[date] = { orders: 0, revenue: 0 };
      }
      stats[date].orders++;
      stats[date].revenue += Number(order.total);
    });

    return stats;
  }
}

export const vendorService = new VendorService();
