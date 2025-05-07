import { Router } from 'express';
import { body, param } from 'express-validator';
import { signup, login, verifyEmail, forgotPassword, resetPassword, googleAuth, setPassword } from '../controllers/authController';

const router = Router();

// Browser-friendly check (optional)
router.get('/', (_req, res) => {
  res.send('Auth routes are up! Use POST /signup and POST /login.');
});

// Actual auth endpoints
// Google OAuth
router.post('/google', [
  body('token').notEmpty().withMessage('Google token is required'),
], googleAuth);

// Set password (for Google users)
router.post('/set-password', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], setPassword);

// Signup
router.post('/signup', [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ], signup);

// Login
router.post('/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
], login);

// Email verification
router.get('/verify-email/:token', [
  param('token').notEmpty().withMessage('Verification token is required'),
], verifyEmail);

// Forgot Password
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Valid email required'),
], forgotPassword);

// Reset Password
router.post('/reset-password/:token', [
  param('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], resetPassword);

export default router;
