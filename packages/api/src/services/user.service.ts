import { getPrisma } from '../config/database';
import { AppError } from '@zeyora/shared';
import type { UpdateProfileRequest, AddAddressRequest } from '@zeyora/shared';

export class UserService {
  async getProfile(userId: string): Promise<any> {
    const prisma = getPrisma();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallet: true,
        loyaltyProgram: true,
      },
    });

    if (!user) {
      throw new AppError('USER_1101', 'User not found', 404);
    }

    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      wallet: user.wallet,
      loyalty: user.loyaltyProgram,
      createdAt: user.createdAt,
    };
  }

  async updateProfile(userId: string, data: UpdateProfileRequest): Promise<any> {
    const prisma = getPrisma();

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        avatarUrl: data.avatarUrl,
      },
    });

    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      role: user.role,
      status: user.status,
    };
  }

  async getAddresses(userId: string): Promise<any[]> {
    const prisma = getPrisma();

    const addresses = await prisma.userAddress.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return addresses.map((addr) => ({
      id: addr.id,
      label: addr.label,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
      latitude: addr.latitude ? Number(addr.latitude) : undefined,
      longitude: addr.longitude ? Number(addr.longitude) : undefined,
      isDefault: addr.isDefault,
    }));
  }

  async addAddress(userId: string, data: AddAddressRequest): Promise<any> {
    const prisma = getPrisma();

    // If this is the first address or marked as default, update others
    if (data.isDefault) {
      await prisma.userAddress.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const address = await prisma.userAddress.create({
      data: {
        userId,
        label: data.label,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country || 'India',
        latitude: data.latitude,
        longitude: data.longitude,
        isDefault: data.isDefault || false,
      },
    });

    return address;
  }

  async updateAddress(userId: string, addressId: string, data: Partial<AddAddressRequest>): Promise<any> {
    const prisma = getPrisma();

    const address = await prisma.userAddress.findUnique({
      where: { id: addressId },
    });

    if (!address || address.userId !== userId) {
      throw new AppError('ADDRESS_1801', 'Address not found', 404);
    }

    // If setting as default, remove default from others
    if (data.isDefault) {
      await prisma.userAddress.updateMany({
        where: { userId, id: { not: addressId } },
        data: { isDefault: false },
      });
    }

    const updatedAddress = await prisma.userAddress.update({
      where: { id: addressId },
      data,
    });

    return updatedAddress;
  }

  async deleteAddress(userId: string, addressId: string): Promise<void> {
    const prisma = getPrisma();

    const address = await prisma.userAddress.findUnique({
      where: { id: addressId },
    });

    if (!address || address.userId !== userId) {
      throw new AppError('ADDRESS_1801', 'Address not found', 404);
    }

    await prisma.userAddress.delete({
      where: { id: addressId },
    });

    // If deleted address was default, set another as default
    if (address.isDefault) {
      const anotherAddress = await prisma.userAddress.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      if (anotherAddress) {
        await prisma.userAddress.update({
          where: { id: anotherAddress.id },
          data: { isDefault: true },
        });
      }
    }
  }

  async updateFcmToken(userId: string, fcmToken: string): Promise<void> {
    const prisma = getPrisma();

    await prisma.user.update({
      where: { id: userId },
      data: { fcmToken },
    });
  }

  async getWallet(userId: string): Promise<any> {
    const prisma = getPrisma();

    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!wallet) {
      // Create wallet if doesn't exist
      const newWallet = await prisma.wallet.create({
        data: { userId },
        include: { transactions: { take: 20 } },
      });
      return newWallet;
    }

    return wallet;
  }

  async addWalletBalance(userId: string, amount: number, description: string): Promise<any> {
    const prisma = getPrisma();

    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new AppError('USER_1101', 'Wallet not found', 404);
    }

    const newBalance = Number(wallet.balance) + amount;

    const [updatedWallet, transaction] = await prisma.$transaction([
      prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance },
      }),
      prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'credit',
          amount,
          balanceBefore: wallet.balance,
          balanceAfter: newBalance,
          description,
        },
      }),
    ]);

    return { wallet: updatedWallet, transaction };
  }

  async getLoyaltyProgram(userId: string): Promise<any> {
    const prisma = getPrisma();

    let program = await prisma.loyaltyProgram.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!program) {
      program = await prisma.loyaltyProgram.create({
        data: { userId },
        include: { transactions: { take: 20 } },
      });
    }

    return program;
  }

  async getAllUsers(params: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
    search?: string;
  } = {}): Promise<{ users: any[]; total: number; pages: number }> {
    const prisma = getPrisma();
    const { page = 1, limit = 20, role, status, search } = params;

    const where: any = {};
    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          phone: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          role: true,
          status: true,
          emailVerified: true,
          phoneVerified: true,
          createdAt: true,
          _count: {
            select: {
              orders: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  async suspendUser(userId: string): Promise<void> {
    const prisma = getPrisma();

    await prisma.user.update({
      where: { id: userId },
      data: { status: 'suspended' },
    });

    // Invalidate all refresh tokens
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  async reactivateUser(userId: string): Promise<void> {
    const prisma = getPrisma();

    await prisma.user.update({
      where: { id: userId },
      data: { status: 'active' },
    });
  }
}

export const userService = new UserService();
