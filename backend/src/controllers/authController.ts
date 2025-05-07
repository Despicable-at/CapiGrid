import { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { sendVerificationEmail } from '../utils/sendEmail';
import { sendResetPasswordEmail } from '../utils/sendEmail';

const JWT_SECRET = process.env.JWT_SECRET!;

// Email format validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/auth/signup
export const signup = async (req: Request, res: Response) => {
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
    res.status(500).json({ message: 'Signup failed', error: err });
  }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Verify your email before logging in.' });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email } });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err });
  }
};

// GET /api/auth/verify-email/:token
export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await User.findById(decoded.userId);

    if (!user) return res.status(400).json({ message: 'Invalid token' });
    if (user.isVerified) return res.status(400).json({ message: 'Email already verified' });

    user.isVerified = true;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    res.status(400).json({ message: 'Verification failed', error: err });
  }
};

// GET /api/auth/forgot-password
export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 30; // 30 mins
    await user.save();

    await sendResetPasswordEmail(user.email, resetToken);
    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    res.status(500).json({ message: 'Error sending reset email', error: err });
  }
};

// GET /api/auth/reset-password
export const resetPassword = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password } = req.body;

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  try {
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ message: 'Error resetting password', error: err });
  }
};
