import { Request, Response } from 'express';
import SupportMessage from '../models/SupportMessage';
import User from '../models/User';
import { sendSupportTicketUpdateEmail, sendSupportTicketCreatedEmail } from '../utils/emailService';

export const createMessage = async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;
    let userId = req.user?._id; // optionalProtect middleware will set this if logged in

    // If not logged in but provided an email, check if they are a registered user
    if (!userId && email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        userId = existingUser._id;
      }
    }

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

    const targetEmail = userId ? req.user?.email || email : email;
    const targetName = userId ? req.user?.name || name : (name || 'Guest');

    if (targetEmail) {
      await sendSupportTicketCreatedEmail(targetEmail, targetName, subject);
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

    const message = await SupportMessage.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true }).populate('user', 'name email');
    
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    const targetEmail = message.user ? (message.user as any).email : message.email;
    const targetName = message.user ? (message.user as any).name : (message.name || 'Guest');

    if (targetEmail) {
      await sendSupportTicketUpdateEmail(
        targetEmail,
        targetName,
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
    const supportMsg = await SupportMessage.findById(req.params.id).populate('user', 'name email');
    
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

    const targetEmail = supportMsg.user ? (supportMsg.user as any).email : supportMsg.email;
    const targetName = supportMsg.user ? (supportMsg.user as any).name : (supportMsg.name || 'Guest');

    if (targetEmail) {
      await sendSupportTicketUpdateEmail(
        targetEmail,
        targetName,
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

export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const message = await SupportMessage.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    res.status(200).json({ success: true, message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
