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

router.post('/signup', [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ], signup);

router.post('/login',  login);

router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;
