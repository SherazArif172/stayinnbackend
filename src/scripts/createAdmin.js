import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import connectDB from '../config/db.js';

// Load environment variables
dotenv.config();

/**
 * Script to create an admin user
 * Usage: node src/scripts/createAdmin.js
 */
const createAdmin = async () => {
  try {
    // Connect to database
    await connectDB();

    // Get admin details from command line arguments or use defaults
    const args = process.argv.slice(2);
    const email = args[0] || 'admin@stayinnhostels.com';
    const password = args[1] || 'admin123456';
    const fullName = args[2] || 'Admin User';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email, role: 'admin' });

    if (existingAdmin) {
      console.log('❌ Admin user already exists with this email:', email);
      process.exit(1);
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create admin user
    const admin = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: 'admin',
      isEmailVerified: true, // Auto-verify admin email
      cnicFront: 'admin-cnic-front', // Placeholder
      cnicBack: 'admin-cnic-back', // Placeholder
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', admin.email);
    console.log('👤 Full Name:', admin.fullName);
    console.log('🔑 Password:', password);
    console.log('⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

// Run the script
createAdmin();

