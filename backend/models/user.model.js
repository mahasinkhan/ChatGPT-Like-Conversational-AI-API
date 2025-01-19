import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'; // Import bcrypt for password hashing
import jwt from 'jsonwebtoken';

// Define the User schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minLength: [6, 'Email must be at least 6 characters long'],
    maxLength: [50, 'Email must be less than 50 characters long'],
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, 'Please enter a valid email address'],
  },
  password: {
    type: String,
    select: false,
    required: true,
    minLength: [6, 'Password must be at least 6 characters long'],
  },
});

// Static method to hash password
userSchema.statics.hashPassword = async function (password) {
  return await bcrypt.hash(password, 10); // Correct function call
};

// Instance method to validate password
userSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password); // Compare plain-text with hashed password
};

// Method to generate JWT token
userSchema.methods.generateJWT = function () {
  return jwt.sign({ email: this.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Create and export the User model
const User = mongoose.model('User', userSchema);
export default User;
