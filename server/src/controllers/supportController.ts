import { Request, Response } from 'express';
import SupportMessage from '../models/SupportMessage';
import { sendSupportTicketUpdateEmail, sendSupportTicketCreatedEmail } from '../utils/emailService';

export const createMessage = async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;
    const userId = req.user?._id; // optionalProtect middleware will set this if logged in

    if (!userId && (!name || !email)) {
       return res.status(400).json({ success: false, message: 'Name and email are required for unauthenticated users' });
    }

    const newMessage = await SupportMessage.create({
      user: userId || undefined,
      name: userId ? undefined : name,
      email: userId ? undefined : email,
      subject,
      message
    });

    if (!userId && email) {
      await sendSupportTicketCreatedEmail(email, name || 'Guest', subject);
    }

    res.status(201).json({ success: true, data: newMessage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const messages = await SupportMessage.find().populate('user', 'name email').sort('-createdAt');
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getUserMessages = async (req: Request, res: Response) => {
  try {
    const messages = await SupportMessage.find({ user: req.user?._id }).sort('-createdAt');
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const updateMessageStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!['Open', 'Acknowledged', 'Resolved'].includes(status)) {
       return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const message = await SupportMessage.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    if (!message.user && message.email) {
      await sendSupportTicketUpdateEmail(
        message.email,
        message.name || 'Guest',
        message.subject,
        message.status
      );
    }

    res.status(200).json({ success: true, data: message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const addReply = async (req: Request, res: Response) => {
  try {
    const { message, status } = req.body;
    const supportMsg = await SupportMessage.findById(req.params.id);
    
    if (!supportMsg) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    if (supportMsg.replies && supportMsg.replies.length > 0) {
      return res.status(400).json({ success: false, message: 'A reply has already been sent for this ticket' });
    }

    supportMsg.replies.push({
      message,
      isAdmin: true,
      createdAt: new Date()
    });

    if (status && ['Open', 'Acknowledged', 'Resolved'].includes(status)) {
      supportMsg.status = status;
    }

    await supportMsg.save();

    if (!supportMsg.user && supportMsg.email) {
      await sendSupportTicketUpdateEmail(
        supportMsg.email,
        supportMsg.name || 'Guest',
        supportMsg.subject,
        supportMsg.status,
        message
      );
    }

    res.status(200).json({ success: true, data: supportMsg });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
