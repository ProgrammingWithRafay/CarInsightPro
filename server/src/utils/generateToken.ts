// Utility to generate JWT token and set as cookie
import { Response } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

export const generateToken = (res: Response, userId: mongoose.Types.ObjectId | string) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET as jwt.Secret, {
    expiresIn: (process.env.JWT_EXPIRE || '7d') as any,
  });

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};
