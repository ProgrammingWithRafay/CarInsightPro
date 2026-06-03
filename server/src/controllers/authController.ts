// Auth Controller - Handles login, register, logout, getMe, email verification, password reset
import { Request, Response } from 'express';
import crypto from 'crypto';
import User from '../models/User';
import { generateToken } from '../utils/generateToken';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/emailService';

// Register user
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
      // Send verification email
      try {
        await sendVerificationEmail(email, name, verificationToken);
      } catch (emailError: any) {
        console.error('Failed to send verification email:', emailError.message);
        // Don't block registration if email fails, but log it
      }

      res.status(201).json({
        success: true,
        message: 'Registration successful! Please check your email to verify your account.',
        data: {
          email: user.email,
          requiresVerification: true,
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

// Login user
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

// Verify email
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

// Resend verification email
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

    await sendVerificationEmail(email, user.name, verificationToken);

    res.json({
      success: true,
      message: 'Verification email resent! Please check your inbox.',
    });
  } catch (error: any) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ success: false, message: error.message });
  }
};

// Logout user
export const logoutUser = async (req: Request, res: Response) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.json({ success: true, message: 'Logged out successfully' });
};

// Get current user profile
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

// Forgot password - send reset email
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

    // Send email
    try {
      await sendPasswordResetEmail(email, user.name, resetToken);
    } catch (emailError: any) {
      console.error('Failed to send password reset email:', emailError.message);
      // Clear tokens if email fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      res.status(500);
      throw new Error('Failed to send password reset email. Please try again later.');
    }

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error: any) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ success: false, message: error.message });
  }
};

// Reset password using token
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
