// Bookmark Controller - Handles saving and removing cars from bookmarks
import { Request, Response } from 'express';
import User from '../models/User';

// Get user bookmarks
export const getBookmarks = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?._id).populate('bookmarks');
    res.json({ success: true, data: user?.bookmarks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add bookmark
export const addBookmark = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const carId: any = req.params.carId;
    if (!user.bookmarks.includes(carId)) {
      user.bookmarks.push(carId);
      await user.save();
    }

    res.json({ success: true, message: 'Car bookmarked', data: user.bookmarks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove bookmark
export const removeBookmark = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.bookmarks = user.bookmarks.filter(id => id.toString() !== req.params.carId);
    await user.save();

    res.json({ success: true, message: 'Bookmark removed', data: user.bookmarks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
