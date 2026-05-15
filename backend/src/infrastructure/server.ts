import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import pino from 'pino';
import { container } from 'tsyringe';
import { ChatService } from '../services/ChatService';
import personaRoutes from '../routes/persona.routes';
import userRoutes from '../routes/user.routes';
import profileRoutes from '../routes/profile.routes';

dotenv.config();

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: { colorize: true }
  } : undefined
});

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket'],
  pingInterval: 10000,
  pingTimeout: 5000,
  allowEIO3: false
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/personas', personaRoutes);
app.use('/api/user', userRoutes);
app.use('/api/profiles', profileRoutes);

app.get('/api/status', (req, res) => {
  res.json({
    server: 'VelvetSync',
    version: '2.0.0',
    services: {
      ollama: 'connected',
      handy: 'disconnected'
    }
  });
});

// Socket.io Connection Handling
io.on('connection', (socket) => {
  logger.info({ socketId: socket.id }, 'Client connected');

  // Join session room
  socket.on('join-session', (sessionId: string) => {
    socket.join(`session:${sessionId}`);
    logger.info({ socketId: socket.id, sessionId }, 'Joined session room');
    socket.emit('session-joined', { sessionId });
  });

  // Chat message
  socket.on('chat-message', async (data: { sessionId: string; content: string; personaId?: string }) => {
    try {
      logger.info({ socketId: socket.id, sessionId: data.sessionId }, 'Chat message received');
      
      const chatService = container.resolve(ChatService);
      const result = await chatService.sendUserMessage(data.sessionId, data.content);

      // Broadcast to session room
      io.to(`session:${data.sessionId}`).emit('chat-response', result.message);
    } catch (error) {
      logger.error({ error, socketId: socket.id }, 'Chat message error');
      socket.emit('error', { message: 'Failed to process message' });
    }
  });

  // Toy control (placeholder)
  socket.on('toy-command', (data: { sessionId: string; command: string; intensity?: number }) => {
    logger.info({ socketId: socket.id, data }, 'Toy command received');
    // TODO: Integrate with HandyAdapter
    io.to(`session:${data.sessionId}`).emit('toy-status', { 
      status: 'received', 
      command: data.command 
    });
  });

  // Disconnect
  socket.on('disconnect', (reason) => {
    logger.info({ socketId: socket.id, reason }, 'Client disconnected');
  });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error({ err, path: req.path }, 'Unhandled error');
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
httpServer.listen(PORT, () => {
  logger.info(`🚀 VelvetSync Server running on port ${PORT}`);
  logger.info(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`   Socket.io enabled`);
});

export { app, io, httpServer };