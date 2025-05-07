const router = Router();

// Browser-friendly check
router.get('/', (_req, res) => {
  res.send('Auth routes are up! Use POST /signup and POST /login.');
});

import { Router } from 'express';
import { signup, login } from '../controllers/authController';

const router = Router();
router.post('/signup', signup);
router.post('/login',  login);

export default router;
