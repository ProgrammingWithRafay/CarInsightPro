import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || '');
    console.log('MongoDB Connected for Seeding');
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  await connectDB();

  try {
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
    const passwordToSet = process.env.SEED_ADMIN_PASSWORD || 'password123';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Admin user already exists. Skipping...');
      process.exit();
    }

    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash(passwordToSet, salt);

    await User.create({
      name: 'Admin User',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      isVerified: true
    });

    console.log(`Admin user created with email: ${adminEmail}`);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

seedDatabase();
