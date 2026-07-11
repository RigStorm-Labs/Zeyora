import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getPrisma } from '../config/database';
import { config } from '../config';
import { AppError } from '@zeyora/shared';
import type { RegisterRequest, LoginRequest, SocialLoginRequest } from '@zeyora/shared';
import type { User } from '@prisma/client';

const BCRYPT_ROUNDS = 12;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthUser {
  id: string;
  email?: string | null;
  phone?: string | null;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  role: string;
  status: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: Date;
}

export class AuthService {
  private generateTokens(user: Pick<User, 'id' | 'email' | 'phone' | 'role'>): AuthTokens {
    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.accessExpiry }
    );

    const refreshToken = jwt.sign(
      { id: user.id, type: 'refresh' },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiry }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  async register(data: RegisterRequest): Promise<{ user: AuthUser; tokens: AuthTokens }> {
    const prisma = getPrisma();

    // Check for existing user
    if (data.email) {
      const existingEmail = await prisma.user.findUnique({ where: { email: data.email } });
      if (existingEmail) {
        throw new AppError('AUTH_1005', 'Email already registered', 409);
      }
    }

    if (data.phone) {
      const existingPhone = await prisma.user.findUnique({ where: { phone: data.phone } });
      if (existingPhone) {
        throw new AppError('AUTH_1006', 'Phone number already registered', 409);
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        phone: data.phone,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role || 'customer',
      },
    });

    // Generate wallet for user
    await prisma.wallet.create({
      data: { userId: user.id },
    });

    // Generate loyalty program
    await prisma.loyaltyProgram.create({
      data: { userId: user.id },
    });

    const tokens = this.generateTokens(user);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  async login(data: LoginRequest): Promise<{ user: AuthUser; tokens: AuthTokens }> {
    const prisma = getPrisma();

    // Find user by email or phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { phone: data.phone }],
      },
    });

    if (!user || !user.passwordHash) {
      throw new AppError('AUTH_1001', 'Invalid credentials', 401);
    }

    // Check if account is locked
    if (user.status === 'suspended') {
      throw new AppError('USER_1103', 'Account is suspended', 403);
    }

    // Verify password
    const isValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValid) {
      throw new AppError('AUTH_1001', 'Invalid credentials', 401);
    }

    const tokens = this.generateTokens(user);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  async socialLogin(data: SocialLoginRequest): Promise<{ user: AuthUser; tokens: AuthTokens; isNewUser: boolean }> {
    const prisma = getPrisma();

    // For now, we'll use a simple verification
    // In production, verify the token with Google/Apple
    const isNewUser = false;
    let user: User;

    // Check if user exists with this email
    if (data.provider === 'google') {
      // In real implementation, decode JWT and get email
      throw new AppError('AUTH_1003', 'Google login not fully implemented', 501);
    }

    if (!user) {
      throw new AppError('AUTH_1001', 'User not found', 404);
    }

    const tokens = this.generateTokens(user);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      user: this.sanitizeUser(user),
      tokens,
      isNewUser,
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const prisma = getPrisma();

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as { id: string; type: string };
    if (decoded.type !== 'refresh') {
      throw new AppError('AUTH_1003', 'Invalid refresh token', 401);
    }

    // Check if token exists in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new AppError('AUTH_1002', 'Refresh token expired', 401);
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      throw new AppError('USER_1101', 'User not found', 404);
    }

    // Delete old refresh token
    await prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });

    // Generate new tokens
    const tokens = this.generateTokens(user);

    // Store new refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return tokens;
  }

  async logout(userId: string): Promise<void> {
    const prisma = getPrisma();
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  async forgotPassword(email: string): Promise<void> {
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({ where: { email } });
    
    // Always return success to prevent email enumeration
    if (!user) {
      return;
    }

    // Generate reset token and send email
    // In production, send email with reset link
    // await sendPasswordResetEmail(user.email, resetToken);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const prisma = getPrisma();
    
    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret) as { id: string; type: string };
    if (decoded.type !== 'password_reset') {
      throw new AppError('AUTH_1003', 'Invalid reset token', 401);
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    // Update password
    await prisma.user.update({
      where: { id: decoded.id },
      data: { passwordHash },
    });

    // Invalidate all refresh tokens
    await prisma.refreshToken.deleteMany({
      where: { userId: decoded.id },
    });
  }

  private sanitizeUser(user: User): AuthUser {
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
      createdAt: user.createdAt,
    };
  }

  async getUserById(userId: string): Promise<AuthUser | null> {
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    return user ? this.sanitizeUser(user) : null;
  }
}

export const authService = new AuthService();
