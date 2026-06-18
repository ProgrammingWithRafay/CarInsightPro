import { Request, Response } from 'express';
import SupportMessage from '../models/SupportMessage';
import User from '../models/User';
import { sendSupportTicketUpdateEmail, sendSupportTicketCreatedEmail } from '../utils/emailService';

/**
 * Submits a new support ticket/message.
 * 
 * Can handle both authenticated users (using their JWT token) and unauthenticated guests 
 * (requiring them to provide a name and email). Sends an automated email confirmation 
 * once the ticket is successfully created.
 */
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
      sendSupportTicketCreatedEmail(targetEmail, targetName, subject).catch((err) => {
        console.error('Failed to send support email asynchronously:', err);
      });
    }

    res.status(201).json({ success: true, data: newMessage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * Retrieves all support tickets across the platform (Admin only).
 * 
 * Returns messages sorted by creation date (newest first), populated with basic user details.
 */
export const getMessages = async (req: Request, res: Response) => {
  try {
    const messages = await SupportMessage.find().populate('user', 'name email').sort('-createdAt');
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * Fetches the support tickets created by the authenticated user.
 * 
 * Used for the user dashboard to let them track their ongoing support requests.
 */
export const getUserMessages = async (req: Request, res: Response) => {
  try {
    const messages = await SupportMessage.find({ user: req.user?._id }).sort('-createdAt');
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * Updates the status of a specific support ticket (Admin only).
 * 
 * Validates the status against allowed values ('Open', 'Acknowledged', 'Resolved').
 * Sends an email notification to the user informing them of the status change.
 */
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
      sendSupportTicketUpdateEmail(
        targetEmail,
        targetName,
        message.subject,
        message.status
      ).catch(err => console.error('Failed to send update email async:', err));
    }

    res.status(200).json({ success: true, data: message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * Adds an admin reply to a support ticket.
 * 
 * Allows an admin to respond to a user's ticket and optionally update its status simultaneously.
 * Currently restricts replies to one per ticket. Sends the reply content to the user via email.
 */
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
      sendSupportTicketUpdateEmail(
        targetEmail,
        targetName,
        supportMsg.subject,
        supportMsg.status,
        message
      ).catch(err => console.error('Failed to send reply email async:', err));
    }

    res.status(200).json({ success: true, data: supportMsg });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * Permanently deletes a support ticket (Admin only).
 * 
 * Removes the ticket document from the database entirely.
 */
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
