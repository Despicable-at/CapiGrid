import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { connectDB } from './config/db';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: '*' }
});

// Middleware
app.use(express.json());

// DB Connection
connectDB();

// Routes placeholder
app.get('/api/status', (_req, res) => {
  res.json({ status: 'OK' });
});

// Socket.io setup
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
