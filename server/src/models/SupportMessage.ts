import mongoose, { Document, Schema } from 'mongoose';

export interface IReply {
  message: string;
  isAdmin: boolean;
  createdAt: Date;
}

export interface ISupportMessage extends Document {
  user?: mongoose.Types.ObjectId;
  name?: string;
  email?: string;
  subject: string;
  message: string;
  status: 'Open' | 'Acknowledged' | 'Resolved';
  replies: IReply[];
  createdAt: Date;
  updatedAt: Date;
}

const SupportMessageSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  name: { type: String },
  email: { type: String },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['Open', 'Acknowledged', 'Resolved'], default: 'Open' },
  replies: [{
    message: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

export default mongoose.model<ISupportMessage>('SupportMessage', SupportMessageSchema);
