// Admin Controller - Handles stats and user management
import { Request, Response } from 'express';
import User from '../models/User';
import Car from '../models/Car';
import Review from '../models/Review';

// Get admin stats
export const getStats = async (req: Request, res: Response) => {
  try {
    const totalCars = await Car.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalReviews = await Review.countDocuments();

    res.json({
      success: true,
      data: {
        totalCars,
        totalUsers,
        totalReviews,
        totalReports: 15400, // mock static data based on requirements
        carsTrend: 12,
        usersTrend: 8
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle block status of user
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

// Delete user
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
