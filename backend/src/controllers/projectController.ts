// src/controllers/projectController.ts
import { Request, Response } from 'express';
import { Project, IProject } from '../models/Project';

// POST /api/projects
export const createProject = async (req: Request, res: Response) => {
  try {
    const { title, description, goalAmount, deadline } = req.body;
    const creator = (req as any).userId;
    const project = await Project.create({
      title,
      description,
      goalAmount,
      deadline,
      creator,
    } as Partial<IProject>);
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: 'Create project failed', error: err });
  }
};

// GET /api/projects
export const listProjects = async (_req: Request, res: Response) => {
  try {
    const projects = await Project.find().populate('creator', 'name email');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'List projects failed', error: err });
  }
};

// GET /api/projects/:id
export const getProject = async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.id).populate('creator', 'name email');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Get project failed', error: err });
  }
};

// PUT /api/projects/:id
export const updateProject = async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.creator.toString() !== (req as any).userId)
      return res.status(403).json({ message: 'Not authorized' });

    const updates = (({ title, description, goalAmount, deadline }) => ({
      title, description, goalAmount, deadline,
    }))(req.body);

    Object.assign(project, updates);
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Update project failed', error: err });
  }
};

// DELETE /api/projects/:id
export const deleteProject = async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.creator.toString() !== (req as any).userId)
      return res.status(403).json({ message: 'Not authorized' });

    await Project.deleteOne({ _id: project._id });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete project failed', error: err });
  }
};

// PATCH /api/projects/:id/status
export const updateProjectStatus = async (req: Request, res: Response) => {
  const { status } = req.body;
  const { id } = req.params;
  if (!Object.values(ProjectStatus).includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  try {
    const project = await Project.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Status update failed', error: err });
  }
};

// GET /api/projects/:id/stats
export const getProjectStats = async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({
      goalAmount: project.goalAmount,
      currentAmount: project.currentAmount,
      percentFunded: project.percentFunded,
      status: project.status,
    });
  } catch (err) {
    res.status(500).json({ message: 'Stats fetch failed', error: err });
  }
};
