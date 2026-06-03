import express from 'express';
import { getReviews, addReview, updateReview, deleteReview, markHelpful } from '../controllers/reviewController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/:carId', getReviews);
router.post('/:carId', protect, addReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.put('/:id/helpful', protect, markHelpful);

export default router;
