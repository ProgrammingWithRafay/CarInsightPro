import express from 'express';
import { registerUser, loginUser, logoutUser, getMe, updateProfile, verifyEmail, resendVerification, forgotPassword, resetPassword, evaluateRank } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/evaluate-rank', protect, evaluateRank);
router.get('/verify/:token', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;
