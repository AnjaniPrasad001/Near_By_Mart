import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError';
import config from '../config';

/**
 * Global error-handling middleware.
 * Must be registered LAST in the Express middleware chain.
 */
const errorHandler = (
  err: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Default values
  let statusCode = 500;
  let message = 'Internal server error';
  let isOperational = false;

  // If it's our custom ApiError, use its properties
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  }

  // Handle specific Mongoose / MongoDB errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
    isOperational = true;
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    isOperational = true;
  }

  // Duplicate key error (MongoDB code 11000)
  if ((err as any).code === 11000) {
    statusCode = 409;
    const field = Object.keys((err as any).keyValue || {})[0] || 'field';
    message = `Duplicate value for ${field}. This ${field} is already in use.`;
    isOperational = true;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    isOperational = true;
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired';
    isOperational = true;
  }

  // Log error details in development; only log unexpected errors in production
  if (config.nodeEnv === 'development') {
    console.error('❌ Error:', {
      statusCode,
      message: err.message,
      stack: err.stack,
    });
  } else if (!isOperational) {
    console.error('❌ Unexpected error:', err);
  }

  // Send response — never leak stack traces in production
  res.status(statusCode).json({
    success: false,
    message,
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
