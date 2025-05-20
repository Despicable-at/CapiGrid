import { Router } from 'express';
import { searchProjects } from '../controllers/searchController';

const router = Router();

// GET /api/search/projects?q=keyword&status=active
router.get('/projects', searchProjects);

export default router;
