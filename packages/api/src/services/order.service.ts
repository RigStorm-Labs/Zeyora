import { getPrisma } from '../config/database';
import { getMongo } from '../config/database';
import { AppError, generateOrderNumber, calculateOrderPrice, calculateTax } from '@zeyora/shared';
import type { CreateOrderRequest } from '@zeyora/shared';

interface OrderItemInput {
  productId: string;
  quantity: number;
  price: number;
  variants?: Record<string, string>;
  addOns?: { name: string; price: number }[];
}

export class OrderService {
  async createOrder(customerId: string, data: CreateOrderRequest): Promise<any> {
    const prisma = getPrisma();
    const mongo = getMongo();

    // Get vendor details
    const vendor = await prisma.vendor.findUnique({
      where: { id: data.vendorId },
    });

    if (!vendor || !vendor.isActive || !vendor.isOpen) {
      throw new AppError('VENDOR_1202', 'Vendor is not available', 400);
    }

    // Get customer's delivery address
    const address = await prisma.userAddress.findUnique({
      where: { id: data.deliveryAddressId },
    });

    if (!address || address.userId !== customerId) {
      throw new AppError('ADDRESS_1801', 'Address not found', 404);
    }

    // Get products from MongoDB
    const productsCollection = mongo.collection('products');
    const productIds = data.items.map((item) => item.productId);
    const products = await productsCollection
      .find({ _id: { $in: productIds.map((id) => ({ $oid: id })) } })
      .toArray();

    if (products.length !== data.items.length) {
      throw new AppError('PRODUCT_1601', 'Some products not found', 404);
    }

    // Validate stock and calculate prices
    const orderItems: OrderItemInput[] = [];
    let subtotal = 0;

    for (const item of data.items) {
      const product = products.find((p) => p._id.toString() === item.productId);
      if (!product) {
        throw new AppError('PRODUCT_1601', 'Product not found', 404);
      }

      if (!product.inStock || product.stockQuantity < item.quantity) {
        throw new AppError('PRODUCT_1602', `Product ${product.name} is out of stock`, 400);
      }

      // Calculate item price with variants and add-ons
      let itemPrice = product.price;

      // Add variant prices
      if (item.variants) {
        for (const variant of product.variants || []) {
          const selectedOption = variant.options.find((o) => o.name === item.variants![variant.name]);
          if (selectedOption) {
            itemPrice += selectedOption.price;
          }
        }
      }

      // Add add-on prices
      if (item.addOns) {
        for (const addOn of item.addOns) {
          itemPrice += addOn.price;
        }
      }

      const itemTotal = itemPrice * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: itemPrice,
        variants: item.variants,
        addOns: item.addOns,
      });
    }

    // Calculate minimum order
    if (subtotal < Number(vendor.minimumOrder)) {
      throw new AppError(
        'ORDER_1405',
        `Minimum order value is ₹${vendor.minimumOrder}`,
        400
      );
    }

    // Calculate delivery fee (simplified)
    const deliveryFee = Number(vendor.deliveryFee);
    const packingFee = 10; // Simplified
    const tax = calculateTax(subtotal + packingFee);

    // Apply promo code if provided
    let discount = 0;
    if (data.promoCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: data.promoCode },
      });

      if (!coupon || !coupon.isActive) {
        throw new AppError('COUPON_1701', 'Invalid coupon code', 400);
      }

      if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) {
        throw new AppError('COUPON_1702', 'Coupon has expired', 400);
      }

      if (subtotal < Number(coupon.minimumOrder)) {
        throw new AppError('COUPON_1704', `Minimum order ₹${coupon.minimumOrder} for this coupon`, 400);
      }

      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        throw new AppError('COUPON_1705', 'Coupon usage limit reached', 400);
      }

      // Calculate discount
      if (coupon.discountType === 'percentage') {
        discount = (subtotal * Number(coupon.discountValue)) / 100;
        if (coupon.maximumDiscount && discount > Number(coupon.maximumDiscount)) {
          discount = Number(coupon.maximumDiscount);
        }
      } else {
        discount = Number(coupon.discountValue);
      }
    }

    const total = subtotal + deliveryFee + packingFee + tax - discount;

    // Create order
    const orderNumber = generateOrderNumber();
    const estimatedDelivery = new Date(Date.now() + vendor.averagePreparationTime * 60 * 1000);

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId,
        vendorId: data.vendorId,
        status: 'pending',
        orderType: data.orderType,
        items: orderItems,
        subtotal,
        deliveryFee,
        packingFee,
        tax,
        discount,
        total,
        paymentMethod: data.paymentMethod,
        paymentStatus: 'pending',
        deliveryAddress: {
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          latitude: address.latitude ? Number(address.latitude) : 0,
          longitude: address.longitude ? Number(address.longitude) : 0,
          label: address.label,
        },
        pickupAddress: {
          addressLine1: vendor.address,
          latitude: vendor.latitude ? Number(vendor.latitude) : 0,
          longitude: vendor.longitude ? Number(vendor.longitude) : 0,
        },
        specialInstructions: data.specialInstructions,
        promoCode: data.promoCode,
        promoDiscount: discount,
        estimatedDelivery,
      },
      include: {
        customer: {
          select: { id: true, firstName: true, lastName: true, phone: true },
        },
        vendor: {
          select: { id: true, businessName: true },
        },
      },
    });

    // Update coupon usage
    if (data.promoCode) {
      await prisma.coupon.update({
        where: { code: data.promoCode },
        data: { usedCount: { increment: 1 } },
      });

      await prisma.couponUsage.create({
        data: {
          couponId: (await prisma.coupon.findUnique({ where: { code: data.promoCode } }))!.id,
          userId: customerId,
          orderId: order.id,
          discountAmount: discount,
        },
      });
    }

    // Create initial status history
    await prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: 'pending',
        changedBy: customerId,
      },
    });

    // Deduct stock
    for (const item of data.items) {
      await productsCollection.updateOne(
        { _id: { $in: productIds.map((id) => ({ $oid: id })) } },
        { $inc: { stockQuantity: -item.quantity } }
      );
    }

    return order;
  }

  async getOrderById(orderId: string, userId: string, userRole: string): Promise<any> {
    const prisma = getPrisma();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: {
          select: { id: true, firstName: true, lastName: true, phone: true, email: true },
        },
        vendor: {
          select: { id: true, businessName: true, businessType: true },
        },
        partner: {
          select: { id: true, user: { select: { firstName: true, lastName: true, phone: true } } },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      throw new AppError('ORDER_1401', 'Order not found', 404);
    }

    // Check access
    if (
      userRole !== 'admin' &&
      order.customerId !== userId &&
      order.vendor?.id !== userId &&
      order.partner?.id !== userId
    ) {
      throw new AppError('ERROR_1905', 'Access denied', 403);
    }

    return order;
  }

  async getOrdersByCustomer(
    customerId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ orders: any[]; total: number; pages: number }> {
    const prisma = getPrisma();

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { customerId },
        include: {
          vendor: { select: { id: true, businessName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where: { customerId } }),
    ]);

    return {
      orders,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  async getOrdersByVendor(
    vendorId: string,
    page: number = 1,
    limit: number = 20,
    status?: string
  ): Promise<{ orders: any[]; total: number; pages: number }> {
    const prisma = getPrisma();

    const where: any = { vendorId };
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: { select: { id: true, firstName: true, lastName: true, phone: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  async getOrdersByPartner(
    partnerId: string,
    page: number = 1,
    limit: number = 20,
    status?: string
  ): Promise<{ orders: any[]; total: number; pages: number }> {
    const prisma = getPrisma();

    const where: any = { partnerId };
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          vendor: { select: { id: true, businessName: true, address: true } },
          customer: { select: { id: true, firstName: true, lastName: true, phone: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  async updateOrderStatus(
    orderId: string,
    newStatus: string,
    userId: string,
    notes?: string
  ): Promise<any> {
    const prisma = getPrisma();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new AppError('ORDER_1401', 'Order not found', 404);
    }

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['ready', 'cancelled'],
      ready: ['assigned', 'cancelled'],
      assigned: ['picked_up', 'cancelled'],
      picked_up: ['in_transit'],
      in_transit: ['delivered'],
    };

    if (!validTransitions[order.status]?.includes(newStatus)) {
      throw new AppError('ORDER_1404', `Cannot transition from ${order.status} to ${newStatus}`, 400);
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        actualDelivery: newStatus === 'delivered' ? new Date() : undefined,
      },
    });

    // Add status history
    await prisma.orderStatusHistory.create({
      data: {
        orderId,
        status: newStatus,
        notes,
        changedBy: userId,
      },
    });

    return updatedOrder;
  }

  async cancelOrder(orderId: string, userId: string, reason: string): Promise<any> {
    const prisma = getPrisma();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new AppError('ORDER_1401', 'Order not found', 404);
    }

    // Only customer or admin can cancel
    if (order.customerId !== userId) {
      throw new AppError('ERROR_1905', 'Only the customer can cancel this order', 403);
    }

    // Check if order can be cancelled
    if (['preparing', 'ready', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'].includes(order.status)) {
      throw new AppError('ORDER_1402', 'Order cannot be cancelled at this stage', 400);
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'cancelled',
        cancellationReason: reason,
      },
    });

    // Add status history
    await prisma.orderStatusHistory.create({
      data: {
        orderId,
        status: 'cancelled',
        notes: reason,
        changedBy: userId,
      },
    });

    // Refund if payment was made
    if (order.paymentStatus === 'completed') {
      // Trigger refund logic
      await prisma.transaction.create({
        data: {
          orderId,
          userId: order.customerId,
          type: 'refund',
          amount: order.total,
          status: 'pending',
          paymentMethod: order.paymentMethod || 'wallet',
        },
      });
    }

    return updatedOrder;
  }

  async assignPartner(orderId: string, partnerId: string): Promise<any> {
    const prisma = getPrisma();

    const [order, partner] = await Promise.all([
      prisma.order.findUnique({ where: { id: orderId } }),
      prisma.partner.findUnique({ where: { id: partnerId } }),
    ]);

    if (!order) {
      throw new AppError('ORDER_1401', 'Order not found', 404);
    }

    if (!partner) {
      throw new AppError('PARTNER_1301', 'Partner not found', 404);
    }

    if (partner.kycStatus !== 'verified') {
      throw new AppError('PARTNER_1302', 'Partner KYC not verified', 400);
    }

    if (!partner.isAvailable) {
      throw new AppError('PARTNER_1304', 'Partner not available', 400);
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        partnerId,
        status: 'assigned',
      },
    });

    await prisma.orderStatusHistory.create({
      data: {
        orderId,
        status: 'assigned',
        notes: `Partner assigned: ${partnerId}`,
      },
    });

    return updatedOrder;
  }

  async rateOrder(
    orderId: string,
    userId: string,
    rating: number,
    review?: string
  ): Promise<any> {
    const prisma = getPrisma();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new AppError('ORDER_1401', 'Order not found', 404);
    }

    if (order.customerId !== userId) {
      throw new AppError('ERROR_1905', 'Only the customer can rate this order', 403);
    }

    if (order.status !== 'delivered') {
      throw new AppError('ORDER_1404', 'Can only rate delivered orders', 400);
    }

    if (rating < 1 || rating > 5) {
      throw new AppError('VALIDATION_1901', 'Rating must be between 1 and 5', 400);
    }

    // Update order
    await prisma.order.update({
      where: { id: orderId },
      data: { rating, review },
    });

    // Create review
    const reviewRecord = await prisma.review.create({
      data: {
        orderId,
        userId,
        vendorId: order.vendorId || undefined,
        partnerId: order.partnerId || undefined,
        rating,
        review,
      },
    });

    // Update vendor rating
    if (order.vendorId) {
      const vendorReviews = await prisma.review.findMany({
        where: { vendorId: order.vendorId },
        select: { rating: true },
      });

      const avgRating =
        vendorReviews.reduce((sum, r) => sum + r.rating, 0) / vendorReviews.length;

      await prisma.vendor.update({
        where: { id: order.vendorId },
        data: {
          rating: avgRating,
          totalRatings: vendorReviews.length,
        },
      });
    }

    // Update partner rating
    if (order.partnerId) {
      const partnerReviews = await prisma.review.findMany({
        where: { partnerId: order.partnerId },
        select: { rating: true },
      });

      const avgRating =
        partnerReviews.reduce((sum, r) => sum + r.rating, 0) / partnerReviews.length;

      await prisma.partner.update({
        where: { id: order.partnerId },
        data: {
          rating: avgRating,
          totalDeliveries: { increment: 1 },
        },
      });
    }

    return reviewRecord;
  }

  async getAllOrders(
    page: number = 1,
    limit: number = 20,
    filters: {
      status?: string;
      vendorId?: string;
      partnerId?: string;
      dateFrom?: string;
      dateTo?: string;
    } = {}
  ): Promise<{ orders: any[]; total: number; pages: number }> {
    const prisma = getPrisma();

    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.vendorId) {
      where.vendorId = filters.vendorId;
    }

    if (filters.partnerId) {
      where.partnerId = filters.partnerId;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.createdAt.lte = new Date(filters.dateTo);
      }
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: { select: { id: true, firstName: true, lastName: true } },
          vendor: { select: { id: true, businessName: true } },
          partner: { select: { id: true, user: { select: { firstName: true, lastName: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      total,
      pages: Math.ceil(total / limit),
    };
  }
}

export const orderService = new OrderService();
