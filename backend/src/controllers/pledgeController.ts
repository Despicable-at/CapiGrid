import { Request, Response } from 'express';
import { Pledge } from '../models/Pledge';

// POST /api/pledges
export const createPledge = async (req: Request, res: Response) => {
  const { backer, project, amount } = req.body;
  
  try {
    const pledge = new Pledge({ backer, project, amount });
    await pledge.save();
    res.status(201).json(pledge);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create pledge', error: err });
  }
};

// GET /api/pledges/:projectId
export const getPledgesForProject = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  
  try {
    const pledges = await Pledge.find({ project: projectId }).populate('backer', 'name email');
    res.json(pledges);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve pledges', error: err });
  }
};
