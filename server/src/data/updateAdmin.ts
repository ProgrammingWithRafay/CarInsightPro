import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User'; // Adjust path if needed
import { connectDB } from '../config/db'; // Adjust path if needed

dotenv.config();

const updateAdmin = async () => {
  await connectDB();

  try {
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@carinsight.com';

    if (!process.env.SEED_ADMIN_PASSWORD) {
      throw new Error('SEED_ADMIN_PASSWORD is missing in .env file!');
    }

    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD, salt);

    const user = await User.findOneAndUpdate(
      { email: adminEmail },
      { password: adminPassword },
      { new: true }
    );

    if (user) {
      console.log(`✅ Admin password successfully updated for ${adminEmail}!`);
    } else {
      console.log(`❌ Admin account ${adminEmail} not found! Run the seed script first.`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error updating admin:', error);
    process.exit(1);
  }
};

updateAdmin();
