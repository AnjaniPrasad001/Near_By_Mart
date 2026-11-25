import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError';

/**
 * Collect express-validator errors and forward as ApiError.badRequest.
 */
const validate = (req: Request, _res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors
      .array()
      .map((e) => e.msg)
      .join(', ');
    next(ApiError.badRequest(message));
    return;
  }
  next();
};

export default validate;
