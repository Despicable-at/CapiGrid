import { Request, Response } from 'express';
import { Project } from '../models/Project';

export const searchProjects = async (req: Request, res: Response) => {
  const { q, status } = req.query;
  const filter: any = {};

  if (q) {
    filter.$text = { $search: String(q) };
  }
  if (status) {
    filter.status = String(status);
  }

  try {
    const projects = await Project.find(filter).populate('creator', 'name email');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Search failed', error: err });
  }
};
