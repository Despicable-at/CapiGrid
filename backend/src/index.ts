// src/index.ts
import dotenv from 'dotenv';
dotenv.config();

import authRoutes from './routes/auth';
import { requireAuth } from './middleware/auth';

import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { connectDB } from './config/db';
import { User } from './models/User';
import { Project } from './models/Project';
import { Pledge } from './models/Pledge';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: '*' }
});

// Middleware
app.use(express.json());

app.use('/api/auth', authRoutes);

// DB Connection
connectDB();

// Health-check
app.get('/api/status', (_req, res) => {
  res.json({ status: 'OK' });
});

// Test models load
app.get('/api/test-models', async (_req, res) => {
  try {
    const userCount = await User.countDocuments();
    const projectCount = await Project.countDocuments();
    const pledgeCount = await Pledge.countDocuments();
    res.json({ userCount, projectCount, pledgeCount });
  } catch (err) {
    res.status(500).json({ error: 'Model load failed', details: err });
  }
});

// Socket.io setup
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
// src/index.ts (just above server.listen)
app.get('/', (_req, res) => {
  res.send('🚀 Capigrid API is live! Hit /api/status for health-check.');
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
