// Auth Controller - Handles login, register, logout, getMe, email verification, password reset
import { Request, Response } from 'express';
import crypto from 'crypto';
import User from '../models/User';
import { generateToken } from '../utils/generateToken';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/emailService';

/**
 * Handles the registration of a new user.
 * 
 * This function checks if the email is already in use. If not, it creates a new user account,
 * generates a unique verification token that expires in 24 hours, and sends a verification email.
 * The user is created in an unverified state and cannot log in until they click the link in the email.
 */
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await User.create({
      name,
      email,
      password,
      isVerified: false,
      verificationToken,
      verificationTokenExpires,
    });

    if (user) {
      // Send verification email asynchronously so it doesn't block the response
      sendVerificationEmail(email, name, verificationToken).catch((emailError: any) => {
        console.error('Failed to send verification email (async):', emailError.message);
      });

      res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        data: {
          email: user.email,
          requiresVerification: true,
          rank: user.rank
        }
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error: any) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ success: false, message: error.message });
  }
};

/**
 * Authenticates a user and issues a JWT token.
 * 
 * Verifies the user's email and password against the database. It enforces that the user must
 * be email-verified and must not be blocked by an admin before allowing them to log in.
 * On success, it returns the user's profile data along with the auth token.
 */
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.comparePassword(password))) {
      // Check if email is verified
      if (!user.isVerified) {
        res.status(403);
        throw new Error('Please verify your email address before logging in. Check your inbox for the verification link.');
      }

      if (user.isBlocked) {
        res.status(403);
        throw new Error('User account is blocked');
      }

      generateToken(res, user._id.toString());
      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          rank: user.rank,
          avatar: user.avatar,
        }
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error: any) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ success: false, message: error.message });
  }
};

/**
 * Verifies a user's email address using a token sent to their inbox.
 * 
 * Validates the token provided in the URL params. If the token is valid and hasn't expired,
 * it marks the user's `isVerified` status as true, enabling them to log in.
 */
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    // Find user by token regardless of expiration first
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      res.status(400);
      throw new Error('Invalid verification token. Please request a new one.');
    }

    // If user is already verified, just return success
    if (user.isVerified) {
      return res.json({
        success: true,
        message: 'Email is already verified! You can now log in.',
      });
    }

    // Check if token has expired
    if (user.verificationTokenExpires && user.verificationTokenExpires < new Date()) {
      res.status(400);
      throw new Error('Verification token has expired. Please request a new one.');
    }

    user.isVerified = true;
    // We intentionally keep the token in the DB so that if an email client pre-fetches 
    // the link, the actual user clicking it later won't get an "Invalid token" error.
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully! You can now log in.',
    });
  } catch (error: any) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ success: false, message: error.message });
  }
};

/**
 * Resends the verification email for an unverified account.
 * 
 * Useful when the original verification email was lost or expired. Generates a new 
 * verification token, updates the user record, and sends out a fresh email.
 */
export const resendVerification = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404);
      throw new Error('No account found with this email address.');
    }

    if (user.isVerified) {
      res.status(400);
      throw new Error('This email is already verified. You can log in.');
    }

    // Generate new token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;
    await user.save();

    sendVerificationEmail(email, user.name, verificationToken).catch((err) => console.error(err));

    res.json({
      success: true,
      message: 'Verification email resent! Please check your inbox.',
    });
  } catch (error: any) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ success: false, message: error.message });
  }
};

/**
 * Logs out the currently authenticated user.
 * 
 * Achieves logout by clearing the HttpOnly 'jwt' cookie on the client side,
 * setting its expiration date to a time in the past.
 */
export const logoutUser = async (req: Request, res: Response) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.json({ success: true, message: 'Logged out successfully' });
};

/**
 * Fetches the currently authenticated user's profile.
 * 
 * Uses the user ID attached to the request (via authMiddleware) to retrieve the user's details,
 * purposefully excluding sensitive information like the password hash.
 */
export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?._id).select('-password');
    if (user) {
      res.json({ success: true, data: user });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error: any) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ success: false, message: error.message });
  }
};

/**
 * Updates the profile information (name and/or email) for the authenticated user.
 * 
 * If an email update is requested, this function validates the new email format
 * and ensures it isn't already claimed by another user before saving the changes.
 */
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const { name, email } = req.body;

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400);
        throw new Error('Please provide a valid email address.');
      }

      // Check if email is already taken by another user
      if (email !== user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          res.status(400);
          throw new Error('This email address is already registered to another account.');
        }
      }
    }

    user.name = name || user.name;
    user.email = email || user.email;
    
    const updatedUser = await user.save();
    
    res.json({
      success: true,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        rank: updatedUser.rank,
        avatar: updatedUser.avatar,
      }
    });
  } catch (error: any) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ success: false, message: error.message });
  }
};

/**
 * Evaluates and upgrades a user's rank (Bronze -> Silver -> Gold).
 * 
 * The rank is determined dynamically based on the user's activity metrics,
 * such as the number of reviews they've written, cars they've bookmarked,
 * or reports they've generated.
 */
export const evaluateRank = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const { reportsCount } = req.body;
    const numReports = parseInt(reportsCount) || 0;
    
    const mongoose = require('mongoose');
    const Review = mongoose.models.Review || mongoose.model('Review');
    const reviewsCount = await Review.countDocuments({ user: user._id });

    const bookmarksCount = user.bookmarks.length;

    const rankValues = { 'Bronze': 1, 'Silver': 2, 'Gold': 3 };
    let currentRankValue = rankValues[user.rank as keyof typeof rankValues] || 1;
    let newRankValue = currentRankValue;

    if (reviewsCount >= 2) {
      newRankValue = Math.max(newRankValue, 3);
    } else if (numReports >= 3 || bookmarksCount >= 5) {
      newRankValue = Math.max(newRankValue, 2);
    }

    let updated = false;
    if (newRankValue > currentRankValue) {
      const newRankName = Object.keys(rankValues).find(key => rankValues[key as keyof typeof rankValues] === newRankValue);
      if (newRankName) {
        user.rank = newRankName as 'Bronze' | 'Silver' | 'Gold';
        await user.save();
        updated = true;
      }
    }

    res.json({
      success: true,
      message: updated ? `Rank upgraded to ${user.rank}!` : 'No upgrade needed.',
      data: {
        rank: user.rank,
        updated
      }
    });
  } catch (error: any) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ success: false, message: error.message });
  }
};

/**
 * Initiates the password reset flow.
 * 
 * Generates a short-lived (1 hour) reset token and emails it to the user.
 * For security reasons, it always returns a success message to prevent 
 * malicious actors from enumerating valid email addresses on the platform.
 */
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      // Return a generic success message to prevent email enumeration
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Send email asynchronously
    sendPasswordResetEmail(email, user.name, resetToken).catch((emailError: any) => {
      console.error('Failed to send password reset email (async):', emailError.message);
    });

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error: any) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ success: false, message: error.message });
  }
};

/**
 * Resets the user's password using a valid reset token.
 * 
 * Expects the token in the URL params and the new password in the request body.
 * If the token is valid, it updates the user's password and clears the token fields.
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters long.');
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      res.status(400);
      throw new Error('Invalid or expired password reset token. Please request a new one.');
    }

    // Set new password (the pre-save hook will hash it)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password has been reset successfully! You can now log in with your new password.',
    });
  } catch (error: any) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ success: false, message: error.message });
  }
};
