import { Router } from 'express';
import { signup, login } from '../controllers/authController';

const router = Router();

// Browser-friendly check (optional)
router.get('/', (_req, res) => {
  res.send('Auth routes are up! Use POST /signup and POST /login.');
});

// Actual auth endpoints
router.post('/signup', signup);
router.post('/login',  login);
router.get('/verify-email/:token', verifyEmail);

export default router;
