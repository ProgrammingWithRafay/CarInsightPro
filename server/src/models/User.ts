/**
 * Mongoose model for User accounts.
 * Handles authentication credentials, roles, user ranks, and linked data like bookmarked cars.
 * Includes pre-save hooks for password hashing.
 */
import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface UserDocument extends Document {
  name: string;
  email: string;
  pendingEmail?: string;
  password?: string;
  role: 'user' | 'admin';
  rank: 'Bronze' | 'Silver' | 'Gold';
  avatar: string;
  bookmarks: mongoose.Types.ObjectId[];
  isBlocked: boolean;
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  comparePassword(enteredPassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  pendingEmail: { type: String },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  rank: { type: String, enum: ['Bronze', 'Silver', 'Gold'], default: 'Bronze' },
  avatar: { type: String, default: '' },
  bookmarks: [{ type: Schema.Types.ObjectId, ref: 'Car' }],
  isBlocked: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationTokenExpires: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
}, {
  timestamps: true
});

/**
 * Pre-save middleware to automatically hash passwords.
 * Only runs if the password field has been modified to prevent double-hashing on other profile updates.
 */
UserSchema.pre<UserDocument>('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password as string, salt);
});

/**
 * Instance method to safely verify a provided password against the stored hash.
 */
UserSchema.methods.comparePassword = async function(enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model<UserDocument>('User', UserSchema);
