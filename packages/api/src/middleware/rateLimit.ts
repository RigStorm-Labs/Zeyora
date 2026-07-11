import rateLimit from 'express-rate-limit';
import { config } from '../config';

export const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT',
      message: 'Too many requests, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT',
      message: 'Too many authentication attempts, please try again after 15 minutes',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

export const otpLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT',
      message: 'Too many OTP requests, please try again after a minute',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT',
      message: 'Too many search requests, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
