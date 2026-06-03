import express from 'express';
import { getStats, getAllUsers, toggleBlockUser, deleteUser } from '../controllers/adminController';
import { protect } from '../middleware/authMiddleware';
import { admin } from '../middleware/adminMiddleware';

const router = express.Router();

router.use(protect, admin); // Apply to all routes in this file

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.put('/users/:id/block', toggleBlockUser);
router.delete('/users/:id', deleteUser);

export default router;
