import { Server as SocketIOServer } from 'socket.io';
import { Logger } from 'pino';
import { container } from 'tsyringe';
import { ChatService } from '../services';

type ChatMessagePayload = {
  sessionId: string;
  content: string;
  personaId?: string;
};

type ToyCommandPayload = {
  sessionId: string;
  command: string;
  intensity?: number;
};

/**
 * Registers all Socket.io event handlers for client connections.
 */
export function bindSocket(io: SocketIOServer, logger: Logger): void {
  io.on('connection', (socket) => {
    logger.info({ socketId: socket.id }, 'Client connected');

    socket.on('join-session', (sessionId: string) => {
      socket.join(`session:${sessionId}`);
      logger.info({ socketId: socket.id, sessionId }, 'Joined session room');
      socket.emit('session-joined', { sessionId });
    });

    socket.on('chat-message', async (data: ChatMessagePayload) => {
      try {
        logger.info({ socketId: socket.id, sessionId: data.sessionId }, 'Chat message received');

        const chatService = container.resolve(ChatService);
        const result = await chatService.sendUserMessage(data.sessionId, data.content);

        io.to(`session:${data.sessionId}`).emit('chat-response', result.message);
      } catch (error) {
        logger.error({ error, socketId: socket.id }, 'Chat message error');
        socket.emit('error', { message: 'Failed to process message' });
      }
    });

    socket.on('toy-command', (data: ToyCommandPayload) => {
      logger.info({ socketId: socket.id, data }, 'Toy command received');

      // TODO: Integrate with HandyAdapter
      io.to(`session:${data.sessionId}`).emit('toy-status', {
        status: 'received',
        command: data.command
      });
    });

    socket.on('disconnect', (reason) => {
      logger.info({ socketId: socket.id, reason }, 'Client disconnected');
    });
  });
}
