import { Request, Response, NextFunction } from 'express';
import { ValidationError, NotFoundError, ForbiddenError, ConflictError, UnauthorizedError } from '../utils/customErrors';
// import { Logger } from 'winston';
// import logger from '../utils/logger';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // logger.error(`${err.name}: ${err.message}`, {
  //   requestId: req.id, // Assuming requestId is added for traceability
  //   path: req.path,
  //   method: req.method,
  // });

  if (err instanceof UnauthorizedError) {
    return res.status(401).json({ error: err.message });
  }
  if (err instanceof ValidationError) {
    return res.status(400).json({ error: err.message });
  }
  if (err instanceof NotFoundError) {
    return res.status(404).json({ error: err.message });
  }
  if (err instanceof ForbiddenError) {
    return res.status(403).json({ error: err.message });
  }
  if (err instanceof ConflictError) {
    return res.status(409).json({ error: err.message });
  }
  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(500).json({ error: 'Database error occurred' });
  }

  // Default to 500 for unhandled errors
  res.status(500).json({ error: 'Internal server error' });
};