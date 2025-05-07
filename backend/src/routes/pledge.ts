import express from 'express';
import { createPledge, getPledgesForProject } from '../controllers/pledgeController';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

// POST /api/pledges - Create a pledge (requires authentication)
router.post('/', requireAuth, createPledge);

// GET /api/pledges/:projectId - Get all pledges for a specific project
router.get('/:projectId', getPledgesForProject);

export default router;
