// Global error handler
import { Request, Response, NextFunction } from 'express';

/**
 * Global error handling middleware for Express.
 * Catches all uncaught exceptions, formatting them into a standard JSON response.
 * Safely hides the error stack trace in production environments.
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
