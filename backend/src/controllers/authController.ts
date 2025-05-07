import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { User, IUser } from '../models/User';
import { sendVerificationEmail } from '../utils/sendEmail';
import { sendResetPasswordEmail } from '../utils/sendEmail';
import { validationResult } from 'express-validator';

const JWT_SECRET = process.env.JWT_SECRET!;

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Email format validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/auth/signup
export const signup = async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // pass to error handler
    return next({ status: 400, message: errors.array()[0].msg });
  }
  
  const { name, email, password } = req.body;

  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashed, isVerified: false });

    const verifyToken = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    await sendVerificationEmail(email, verifyToken);

    res.status(201).json({ message: 'Signup successful. Check your email to verify your account.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next({ status: 400, message: errors.array()[0].msg });

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return next({ status: 400, message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return next({ status: 400, message: 'Invalid credentials' });

    if (!user.isVerified) return next({ status: 403, message: 'Verify your email before logging in.' });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email } });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/verify-email/:token
export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next({ status: 400, message: errors.array()[0].msg });

  const { token } = req.params;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await User.findById(decoded.userId);
    if (!user) return next({ status: 400, message: 'Invalid token' });
    if (user.isVerified) return next({ status: 400, message: 'Email already verified' });

    user.isVerified = true;
    await user.save();
    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    next({ status: 400, message: 'Verification failed', error: err });
  }
};

// GET /api/auth/forgot-password
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next({ status: 400, message: errors.array()[0].msg });

  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return next({ status: 404, message: 'User not found' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 30;
    await user.save();

    await sendResetPasswordEmail(user.email, resetToken);
    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    next(err);
  }
};
// GET /api/auth/reset-password
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next({ status: 400, message: errors.array()[0].msg });

  const { token } = req.params;
  const { password } = req.body;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  try {
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return next({ status: 400, message: 'Invalid or expired token' });

    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/google
export const googleAuth = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next({ status: 400, message: errors.array()[0].msg });

  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return next({ status: 400, message: 'Google authentication failed' });
    }

    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = await User.create({
        name: payload.name,
        email: payload.email,
        isVerified: true,
        isGoogleUser: true,
        password: '', // empty for now
      });

      return res.status(201).json({
        newUser: true,
        message: 'Google sign-in successful. Please set your password.',
        email: user.email,
        token: jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' }),
      });
    }

    // if user already exists
    const authToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ token: authToken, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    next({ status: 500, message: 'Google login failed', error: err });
  }
};

// GET api/auth/set-password
export const setPassword = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next({ status: 400, message: errors.array()[0].msg });

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !user.isGoogleUser) {
      return next({ status: 400, message: 'Invalid request' });
    }

    user.password = await bcrypt.hash(password, 12);
    await user.save();

    res.json({ message: 'Password set successfully' });
  } catch (err) {
    next({ status: 500, message: 'Failed to set password', error: err });
  }
};
