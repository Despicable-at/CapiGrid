import { Request, Response } from 'express';
import { User } from '../models/User';
import { Pledge } from '../models/Pledge';

// GET /api/profile - Get current user profile
export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.userId); // Get user from JWT
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user profile', error: err });
  }
};

// PUT /api/profile - Update user profile
export const updateProfile = async (req: Request, res: Response) => {
  const { name, email } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, email },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ message: 'Error updating user profile', error: err });
  }
};

// GET /api/profile/pledges - Get pledges made by the user
export const getUserPledges = async (req: Request, res: Response) => {
  try {
    const pledges = await Pledge.find({ backer: req.userId }).populate('project');
    res.json(pledges);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching pledges', error: err });
  }
};
