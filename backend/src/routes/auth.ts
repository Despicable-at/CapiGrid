import { Router } from 'express';
import { signup, login, verifyEmail, forgotPassword, resetPassword, googleAuth, setPassword } from '../controllers/authController';

const router = Router();

// Browser-friendly check (optional)
router.get('/', (_req, res) => {
  res.send('Auth routes are up! Use POST /signup and POST /login.');
});

// Actual auth endpoints
router.post('/google', googleAuth);
router.post('/set-password', setPassword);
router.post('/signup', signup);
router.post('/login',  login);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;
