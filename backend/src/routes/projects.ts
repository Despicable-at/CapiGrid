// src/routes/projects.ts
import { Router } from 'express';
import {
  createProject,
  listProjects,
  getProject,
  updateProject,
  deleteProject,
  updateProjectStatus,
  getProjectStats,
} from '../controllers/projectController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Public
router.get('/', listProjects);
router.get('/:id', getProject);
router.get('/:id/stats', getProjectStats);

// Protected
router.post('/', requireAuth, createProject);
router.put('/:id', requireAuth, updateProject);
router.delete('/:id', requireAuth, deleteProject);
router.patch('/:id/status', requireAuth, updateProjectStatus);

export default router;
