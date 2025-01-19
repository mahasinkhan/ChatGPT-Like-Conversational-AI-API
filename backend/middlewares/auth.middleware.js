import jwt from 'jsonwebtoken';
import redisClient from '../services/redis.service.js';


export const authUser = async (req, res, next) => {
  try {
    // Get token from cookies or Authorization header
    const token = req.cookies.token || req.header('Authorization')?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }

    // Check if the token is blacklisted in Redis
    const isBlackListed = await redisClient.get(token);

    if (isBlackListed) {
      return res.status(401).json({ error: 'Token is blacklisted, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user data to the request object (for access in the next middleware)
    req.user = decoded;

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error('Token verification error:', error.message);

    // Check if the error is related to the signature (e.g., invalid signature)
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token is not valid' });
    }

    // Handle token expiration errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired' });
    }

    // Default error handling
    return res.status(500).json({ error: 'Server error' });
  }
};
