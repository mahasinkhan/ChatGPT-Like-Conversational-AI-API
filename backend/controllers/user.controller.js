import userModel from '../models/user.model.js';
import * as userService from '../services/user.service.js';
import { validationResult } from 'express-validator';
import redisClient from '../services/redis.service.js';
import jwt from 'jsonwebtoken';



export const createUserController = async (req, res) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    try {
      const user = await userService.createUser(req.body);
  
      const token = await user.generateJWT();
  
      // Avoid sending sensitive information like passwords
      delete user._doc.password;
  
      res.status(201).json({ user, token });
    } catch (error) {
      console.error('Error creating user:', error); // Log for debugging
      res.status(400).json({ message: error.message });
    }
  };
  

  export const loginController = async (req, res) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    try {
      const { email, password } = req.body;
  
      // Find user by email and include the password field
      const user = await userModel.findOne({ email }).select('+password');
  
      if (!user) {
        return res.status(401).json({ errors: 'Invalid credentials' });
      }
  
      // Compare provided password with the stored hashed password
      const isMatch = await user.isValidPassword(password);
  
      if (!isMatch) {
        return res.status(401).json({ errors: 'Invalid credentials' });
      }
  
      // Generate JWT token
      const token = user.generateJWT();
  
      // Remove sensitive information from the user object
      const { password: _, ...userWithoutPassword } = user._doc;
  
      res.status(200).json({
        message: 'Login successful!',
        user: userWithoutPassword,
        token,
      });
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: err.message });
    }
  };
  
export const profileController = async (req, res) => {

    res.status(200).json({
        message: 'User profile data',
        user: req.user
    });

}

export const logoutController = async (req, res) => {
    try {
      // Retrieve token from cookies or Authorization header
      const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  
      if (!token) {
        return res.status(400).json({ message: 'Token not found. User is not authenticated.' });
      }
  
      // Verify the token expiration time (in case it's necessary to match Redis expiration time with the JWT expiration time)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const expirationTime = decoded.exp - Math.floor(Date.now() / 1000); // Expiration time in seconds
  
      // Store token in Redis with a logout state and set expiration time
      await redisClient.set(token, 'logout', 'EX', expirationTime); // Expire at the same time as JWT expiration
  
      // Optionally, you can delete the cookie or invalidate the session
      res.clearCookie('token'); // Clear the token cookie if using cookies for session management
  
      res.status(200).json({
        message: 'Logged out successfully'
      });
  
    } catch (err) {
      console.error('Logout error:', err);
      res.status(500).json({ message: 'An error occurred during logout' });
    }
  };

  export const getAllUsersController = async (req, res) => {
    try {

        const loggedInUser = await userModel.findOne({
            email: req.user.email
        })

        const allUsers = await userService.getAllUsers({ userId: loggedInUser._id });

        return res.status(200).json({
            users: allUsers
        })

    } catch (err) {

        console.log(err)

        res.status(400).json({ error: err.message })

    }
};