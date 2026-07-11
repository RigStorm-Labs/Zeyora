import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { validationResult } from 'express-validator';
import { AppError, isAppError } from '@zeyora/shared';
import { logger } from '../utils/logger';

export class ErrorResponse {
  success = false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };

  constructor(code: string, message: string, details?: Record<string, string[]>) {
    this.error = { code, message, details };
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error(`${req.method} ${req.path}: ${err.message}`, {
    stack: err.stack,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  if (err instanceof AppError) {
    res.status(err.statusCode).json(new ErrorResponse(err.code, err.message, err.details));
    return;
  }

  if (err instanceof ZodError) {
    const details: Record<string, string[]> = {};
    err.errors.forEach((e) => {
      const path = e.path.join('.');
      if (!details[path]) {
        details[path] = [];
      }
      details[path].push(e.message);
    });
    res.status(400).json(new ErrorResponse('VALIDATION_1901', 'Validation failed', details));
    return;
  }

  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as { code: string; meta?: { target?: string[] } };
    if (prismaError.code === 'P2002') {
      const field = prismaError.meta?.target?.join(', ') || 'field';
      res.status(409).json(new ErrorResponse('ERROR_1906', `${field} already exists`));
      return;
    }
    if (prismaError.code === 'P2025') {
      res.status(404).json(new ErrorResponse('ERROR_1904', 'Resource not found'));
      return;
    }
  }

  if (err.name === 'MulterError') {
    const multerError = err as { code: string; message: string };
    let message = 'File upload error';
    if (multerError.code === 'LIMIT_FILE_SIZE') {
      message = 'File too large';
    } else if (multerError.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Unexpected file field';
    }
    res.status(400).json(new ErrorResponse('VALIDATION_1901', message));
    return;
  }

  // Default error
  const statusCode = err.message.includes('not found') ? 404 : 500;
  res.status(statusCode).json(
    new ErrorResponse('ERROR_1902', config.node === 'production' ? 'Internal server error' : err.message)
  );
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json(new ErrorResponse('ERROR_1904', `Route ${req.method} ${req.path} not found`));
};

export const validateRequest = (req: Request, res: Response, next: () => void): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details: Record<string, string[]> = {};
    errors.array().forEach((error) => {
      const field = (error as { path: string }).path;
      if (!details[field]) {
        details[field] = [];
      }
      details[field].push(error.msg);
    });
    res.status(400).json(new ErrorResponse('VALIDATION_1901', 'Validation failed', details));
    return;
  }
  next();
};
