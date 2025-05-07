// src/routes/projects.ts
import { Router } from 'express';
import {
  createProject,
  listProjects,
  getProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Public
router.get('/', listProjects);
router.get('/:id', getProject);

// Protected
router.post('/', requireAuth, createProject);
router.put('/:id', requireAuth, updateProject);
router.delete('/:id', requireAuth, deleteProject);

export default router;
