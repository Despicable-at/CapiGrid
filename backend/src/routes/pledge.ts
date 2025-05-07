import express from 'express';
import { createPledge, getPledgesForProject } from '../controllers/pledgeController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// POST /api/pledges - Create a pledge (requires authentication)
router.post('/', authenticate, createPledge);

// GET /api/pledges/:projectId - Get all pledges for a specific project
router.get('/:projectId', getPledgesForProject);

export default router;
