import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/appError.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: any = undefined;

  // Custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.details;
  }
  // Zod validation error
  else if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    errors = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
  }
  // JWT Errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired';
  }
  // Prisma known errors
  else if (err.code === 'P2002') {
    statusCode = 409;
    const target = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : err.meta?.target || 'field';
    message = `Duplicate value: a record with this ${target} already exists`;
  } else if (err.code === 'P2025') {
    statusCode = 404;
    message = err.meta?.cause || 'Requested record was not found';
  } else if (err.code === 'P2003') {
    statusCode = 400;
    message = 'Foreign key constraint violated';
  }

  // Log 5xx errors or unexpected errors
  if (statusCode >= 500) {
    logger.error(
      {
        err: {
          message: err.message,
          stack: env.NODE_ENV === 'development' ? err.stack : undefined,
          name: err.name,
          code: err.code,
        },
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
      },
      'Unhandled request error'
    );
  } else if (env.NODE_ENV === 'development') {
    logger.debug({ statusCode, message, url: req.originalUrl }, 'Client request error');
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
    ...(env.NODE_ENV === 'development' && statusCode >= 500 ? { stack: err.stack } : {}),
  });
};

export const notFoundMiddleware = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
};

