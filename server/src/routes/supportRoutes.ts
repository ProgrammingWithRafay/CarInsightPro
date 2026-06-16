import express from 'express';
import { createMessage, getMessages, updateMessageStatus, getUserMessages, addReply, deleteMessage } from '../controllers/supportController';
import { protect, optionalProtect } from '../middleware/authMiddleware';
import { admin } from '../middleware/adminMiddleware';

const router = express.Router();

router.route('/')
  .post(optionalProtect, createMessage)
  .get(protect, admin, getMessages);

router.route('/my-tickets')
  .get(protect, getUserMessages);

router.route('/:id/status')
  .put(protect, admin, updateMessageStatus);

router.route('/:id')
  .delete(protect, admin, deleteMessage);

router.route('/:id/reply')
  .post(protect, admin, addReply);

export default router;
