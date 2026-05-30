import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIO } from 'socket.io';
import dotenv from 'dotenv';
import resumeRoutes from './routes/resume.js';
import interviewRoutes from './routes/interview.js';
import reportRoutes from './routes/report.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new SocketIO(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/resume', resumeRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/report', reportRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'InsightTrove Interview Agent' }));

// Real-time interview socket events
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-interview', (sessionId) => {
    socket.join(sessionId);
    console.log(`Socket ${socket.id} joined session ${sessionId}`);
  });

  socket.on('answer-submitted', ({ sessionId, answer }) => {
    io.to(sessionId).emit('processing', { message: 'Evaluating your answer...' });
  });

  socket.on('body-language-update', ({ sessionId, data }) => {
    // Relay body language data for display
    socket.to(sessionId).emit('body-language-data', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`InsightTrove Interview Agent server running on port ${PORT}`);
});
