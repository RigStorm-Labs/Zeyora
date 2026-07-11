import { Router } from 'express';
import { body } from 'express-validator';
import { authService } from '../services/auth.service';
import { validateRequest } from '../middleware/error';
import { authLimiter } from '../middleware/rateLimit';
import { AppError } from '@zeyora/shared';

const router = Router();

// Register
router.post(
  '/register',
  authLimiter,
  [
    body('email').optional().isEmail().withMessage('Invalid email'),
    body('phone').optional().matches(/^[6-9]\d{9}$/).withMessage('Invalid phone number'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('firstName').isLength({ min: 2 }).withMessage('First name is required'),
    body('lastName').isLength({ min: 2 }).withMessage('Last name is required'),
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({
        success: true,
        data: result,
        message: 'Registration successful',
      });
    } catch (error) {
      next(error);
    }
  }
);

// Login
router.post(
  '/login',
  authLimiter,
  [
    body('email').optional().isEmail().withMessage('Invalid email'),
    body('phone').optional().matches(/^[6-9]\d{9}$/).withMessage('Invalid phone number'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const result = await authService.login(req.body);
      res.json({
        success: true,
        data: result,
        message: 'Login successful',
      });
    } catch (error) {
      next(error);
    }
  }
);

// Social Login
router.post('/social', async (req, res, next) => {
  try {
    const result = await authService.socialLogin(req.body);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// Refresh Token
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new AppError('VALIDATION_1901', 'Refresh token is required', 400);
    }
    const tokens = await authService.refreshToken(refreshToken);
    res.json({
      success: true,
      data: tokens,
    });
  } catch (error) {
    next(error);
  }
});

// Logout
router.post('/logout', async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (userId) {
      await authService.logout(userId);
    }
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Forgot Password
router.post(
  '/forgot-password',
  authLimiter,
  [body('email').isEmail().withMessage('Valid email is required')],
  validateRequest,
  async (req, res, next) => {
    try {
      await authService.forgotPassword(req.body.email);
      res.json({
        success: true,
        message: 'If an account exists with this email, a password reset link will be sent',
      });
    } catch (error) {
      next(error);
    }
  }
);

// Reset Password
router.post(
  '/reset-password',
  [body('token').notEmpty().withMessage('Token is required'), body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')],
  validateRequest,
  async (req, res, next) => {
    try {
      const { token, newPassword } = req.body;
      await authService.resetPassword(token, newPassword);
      res.json({
        success: true,
        message: 'Password reset successful',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
