import express from 'express';
import { getProfile, updateProfile, getUserPledges } from '../controllers/profileController';
import { requireAuth } from '../middleware/auth';


const router = express.Router();

// GET /api/profile - Get user profile
router.get('/', authenticate, getProfile);

// PUT /api/profile - Update user profile
router.put('/', authenticate, updateProfile);

// GET /api/profile/pledges - Get pledges made by the user
router.get('/pledges', authenticate, getUserPledges);

export default router;
