import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import config from '../config';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import { AuthRequest } from '../middleware/auth';

const signToken = (id: string, role: string): string => {
  return jwt.sign({ id, role }, config.jwtSecret as jwt.Secret, {
    expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });
};

const sanitizeUser = (user: any) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone || '',
});

export const register = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { name, email, password, role, phone } = req.body;

    const existing = await User.findOne({ email: String(email).toLowerCase() });
    if (existing) {
      throw ApiError.conflict('An account with this email already exists');
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role === 'seller' ? 'seller' : 'buyer',
      phone: phone || '',
    });

    const token = signToken(user._id.toString(), user.role);
    ApiResponse.created(
      res,
      { user: sanitizeUser(user), token },
      'Account registered successfully',
    );
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email).toLowerCase() }).select(
      '+password',
    );

    if (!user || !(await user.comparePassword(password))) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const token = signToken(user._id.toString(), user.role);
    ApiResponse.success(
      res,
      { user: sanitizeUser(user), token },
      200,
      'Logged in successfully',
    );
  } catch (err) {
    next(err);
  }
};

export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized('Not authenticated');
    }
    ApiResponse.success(res, { user: sanitizeUser(req.user) });
  } catch (err) {
    next(err);
  }
};
