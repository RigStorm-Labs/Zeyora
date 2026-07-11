import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { getPrisma } from '../config/database';
import { AppError } from '@zeyora/shared';

export interface AuthenticatedUser {
  id: string;
  email?: string;
  phone?: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('AUTH_1003', 'No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret) as AuthenticatedUser;

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, status: true, role: true },
    });

    if (!user) {
      throw new AppError('USER_1101', 'User not found', 404);
    }

    if (user.status !== 'active') {
      throw new AppError('USER_1103', 'Account is suspended', 403);
    }

    req.user = {
      id: user.id,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('AUTH_1002', 'Token expired', 401));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('AUTH_1003', 'Invalid token', 401));
    } else {
      next(error);
    }
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError('AUTH_1003', 'Authentication required', 401));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AppError('ERROR_1905', 'Insufficient permissions', 403));
      return;
    }

    next();
  };
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret) as AuthenticatedUser;

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, status: true, role: true },
    });

    if (user && user.status === 'active') {
      req.user = {
        id: user.id,
        role: user.role,
      };
    }
  } catch {
    // Token invalid or expired, but that's okay for optional auth
  }
  next();
};
