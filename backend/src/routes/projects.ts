import { Router } from 'express';
import {
  createProject,
  listProjects,
  getFeaturedProjects,
  getCategoryCounts,
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
router.get('/featured', getFeaturedProjects);
router.get('/categories', getCategoryCounts);
router.get('/:id', getProject);
router.get('/:id/stats', getProjectStats);

// Protected
router.post('/', requireAuth, createProject);
router.put('/:id', requireAuth, updateProject);
router.patch('/:id/status', requireAuth, updateProjectStatus);
router.delete('/:id', requireAuth, deleteProject);

export default router;
