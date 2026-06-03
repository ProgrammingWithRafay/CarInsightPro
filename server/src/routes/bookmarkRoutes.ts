import express from 'express';
import { getBookmarks, addBookmark, removeBookmark } from '../controllers/bookmarkController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', protect, getBookmarks);
router.post('/:carId', protect, addBookmark);
router.delete('/:carId', protect, removeBookmark);

export default router;
