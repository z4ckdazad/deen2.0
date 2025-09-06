import { AppError } from './errorHandler.js';

/**
 * 404 Not Found middleware
 * This middleware should be placed at the end of all routes
 * to catch any requests that don't match any defined routes
 */
export const notFound = (req, res, next) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};
