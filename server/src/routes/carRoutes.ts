import express from 'express';
import { getCars, getCarById, compareCars, addCar, updateCar, deleteCar, recommendCars, getCarPriceHistory, getPublicStats, getFilterOptions } from '../controllers/carController';
import { protect } from '../middleware/authMiddleware';
import { admin } from '../middleware/adminMiddleware';
import { upload } from '../middleware/uploadMiddleware';

const router = express.Router();

router.get('/', getCars);
router.get('/compare', compareCars);
router.get('/recommend', recommendCars);
router.get('/stats', getPublicStats);
router.get('/filter-options', getFilterOptions);
router.get('/:id/price-history', getCarPriceHistory);
router.get('/:id', getCarById);

// Admin only routes
router.post('/', protect, admin, upload.array('images', 5), addCar);
router.put('/:id', protect, admin, upload.array('images', 5), updateCar);
router.delete('/:id', protect, admin, deleteCar);

export default router;
