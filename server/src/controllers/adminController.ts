// Admin Controller - Handles stats and user management
import { Request, Response } from 'express';
import User from '../models/User';
import Car from '../models/Car';
import Review from '../models/Review';

import SupportMessage from '../models/SupportMessage';

/**
 * Aggregates high-level platform statistics for the admin dashboard.
 * 
 * Returns the total count of cars, users, reviews, and support tickets in the system.
 */
export const getStats = async (req: Request, res: Response) => {
  try {
    const totalCars = await Car.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalReviews = await Review.countDocuments();
    const totalTickets = await SupportMessage.countDocuments();

    res.json({
      success: true,
      data: {
        totalCars,
        totalUsers,
        totalReviews,
        totalTickets
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Retrieves a list of all registered users on the platform.
 * 
 * Used by admins to manage the user base. Excludes sensitive fields like passwords
 * and sorts the users by creation date (newest first).
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Toggles the 'isBlocked' status of a user account.
 * 
 * A blocked user will not be able to log in. This function prevents admins
 * from accidentally or maliciously blocking other admins.
 */
export const toggleBlockUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot block an admin' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({ success: true, message: `User ${user.isBlocked ? 'blocked' : 'unblocked'}` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Permanently deletes a user account from the system.
 * 
 * Ensures that admins cannot be deleted. Also cleans up the database by
 * cascade-deleting all reviews associated with the deleted user.
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete an admin' });
    }

    await user.deleteOne();
    // Also remove their reviews
    await Review.deleteMany({ user: user._id });

    res.json({ success: true, message: 'User deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
