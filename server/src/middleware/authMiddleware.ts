// Middleware to check if user is authenticated
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

interface JwtPayload {
  id: string;
}

/**
 * Primary authentication middleware.
 * Intercepts requests to protected routes, verifies the JWT token from the cookies,
 * and attaches the full user object to the request. Also blocks users with an 'isBlocked' status.
 */
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  // Check for token in cookies
  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    // Get user from token
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'User is blocked' });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

/**
 * Soft authentication middleware.
 * Used for routes that can be accessed by both guests and authenticated users
 * (e.g., submitting a support ticket). Attaches the user object if a valid token
 * is present, but allows the request to proceed normally if it isn't.
 */
export const optionalProtect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    const user = await User.findById(decoded.id).select('-password');
    if (user && !user.isBlocked) {
      req.user = user;
    }
  } catch (error) {
    // Just ignore errors for optional protect, let it pass as guest
  }
  next();
};
