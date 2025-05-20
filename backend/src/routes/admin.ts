import { Router } from 'express';
import { listAllProjects, listAllUsers } from '../controllers/adminController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// NOTE: You should extend `requireAuth` or add a `requireAdmin` middleware 
// that checks `req.userId` against an `isAdmin` flag on the User model.

// List all campaigns
router.get('/projects', requireAuth, listAllProjects);

// List all users
router.get('/users', requireAuth, listAllUsers);

export default router;
