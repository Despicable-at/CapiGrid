import { Request, Response } from 'express';
import { Project } from '../models/Project';
import { User } from '../models/User';

// GET /api/admin/projects
export const listAllProjects = async (_req: Request, res: Response) => {
  try {
    const projects = await Project.find().populate('creator', 'name email');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Fetch projects failed', error: err });
  }
};

// GET /api/admin/users
export const listAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find().select('name email isVerified isGoogleUser');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Fetch users failed', error: err });
  }
};
