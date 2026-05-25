import { Server as SocketIOServer } from 'socket.io';
import { Logger }                   from 'pino';
import { container }                from 'tsyringe';

import { ChatService } from '../services';

type ChatMessagePayload = {
    sessionId?: string;
    content?: string;
};

type ToyCommandPayload = {
    sessionId: string;
    command: string;
    intensity?: number;
};

/**
 * Registers all Socket.io event handlers for client connections.
 */
export function bindSocket( io: SocketIOServer, logger: Logger ): void {
    io.on( 'connection', socket => {
        logger.info( { socketId : socket.id }, 'Client connected' );

        socket.on( 'join-session', ( sessionId: string ) => {
            if ( !sessionId ) {
                socket.emit( 'chat-error', {
                    code    : 'INVALID_SESSION',
                    message : 'Missing session id.',
                } );

                return;
            }

            socket.join( `session:${ sessionId }` );

            logger.info(
                {
                    socketId : socket.id,
                    sessionId,
                },
                'Joined session room',
            );

            socket.emit( 'session-joined', {
                sessionId,
            } );
        } );

        socket.on( 'chat-message', async ( data: ChatMessagePayload ) => {
            const sessionId = data?.sessionId;
            const content = data?.content?.trim();

            if ( !sessionId || !content ) {
                socket.emit( 'chat-error', {
                    code    : 'INVALID_CHAT_MESSAGE',
                    message : 'Missing session id or message content.',
                } );

                return;
            }

            try {
                logger.info(
                    {
                        socketId : socket.id,
                        sessionId,
                    },
                    'Chat message received',
                );

                const chatService = container.resolve( ChatService );
                const result = await chatService.sendUserMessage( sessionId, content );

                io.to( `session:${ sessionId }` ).emit( 'chat-response', {
                    sessionId,
                    message : result.message,
                } );
            } catch ( error ) {
                const message = error instanceof Error
                    ? error.message
                    : 'Failed to process message.';

                logger.error(
                    {
                        error,
                        socketId : socket.id,
                        sessionId,
                    },
                    'Chat message error',
                );

                socket.emit( 'chat-error', {
                    code : message.includes( 'No active profile' )
                        ? 'NO_ACTIVE_PROFILE'
                        : 'CHAT_MESSAGE_FAILED',
                    message,
                } );
            }
        } );

        socket.on( 'toy-command', ( data: ToyCommandPayload ) => {
            logger.info(
                {
                    socketId : socket.id,
                    data,
                },
                'Toy command received',
            );

            // TODO: Integrate with HandyAdapter.
            io.to( `session:${ data.sessionId }` ).emit( 'toy-status', {
                status  : 'received',
                command : data.command,
            } );
        } );

        socket.on( 'disconnect', reason => {
            logger.info(
                {
                    socketId : socket.id,
                    reason,
                },
                'Client disconnected',
            );
        } );
    } );
}