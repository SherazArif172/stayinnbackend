import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate JWT token
 * @param {Object} payload - Data to encode in token (should include userId and optionally role)
 * @param {string} expiresIn - Token expiration time (default: 7d)
 * @returns {string} JWT token
 */
export const generateToken = (payload, expiresIn = JWT_EXPIRES_IN) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn,
  });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Generate email verification token
 * @returns {string} Random token string
 */
export const generateEmailToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Generate password reset token
 * @returns {string} Random token string
 */
export const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

