// Utility to generate JWT token and set as cookie
import { Response } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

/**
 * Cryptographically signs a new JSON Web Token using the user's ID and the server's secret.
 * Instead of returning the token in the JSON body, it securely attaches it to an HttpOnly
 * cookie on the response, mitigating XSS risks.
 */
export const generateToken = (res: Response, userId: mongoose.Types.ObjectId | string) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET as jwt.Secret, {
    expiresIn: (process.env.JWT_EXPIRE || '7d') as any,
  });

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};
