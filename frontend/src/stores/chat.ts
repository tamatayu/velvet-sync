import { defineStore } from 'pinia';
import { io, Socket }  from 'socket.io-client';

import { DEBUG_SOCKET }     from '@/config';
import { VITE_BACKEND_URL } from '@/config';

export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date | string;
}

interface ChatResponsePayload {
    sessionId: string;
    message: Message;
}

interface ChatErrorPayload {
    code: string;
    message: string;
}

export const useChatStore = defineStore( 'chat', {
    state : () => ( {
        messages             : [] as Message[],
        isConnected          : false,
        isWaitingForResponse : false,
        socket               : null as Socket | null,
        sessionId            : '',
        error                : ''
    } ),

    actions : {
        /**
         * Connects the frontend to the backend websocket and joins a chat session.
         */
        connect( sessionId: string ): void {
            if ( this.socket ) {
                if ( DEBUG_SOCKET ) {
                    console.log( '[Socket] Socket already exists, skipping' );
                }

                return;
            }

            this.sessionId = sessionId;
            this.error = '';

            const startTime = Date.now();

            if ( DEBUG_SOCKET ) {
                console.log( `[Socket] Creating connection at ${ new Date().toISOString() }` );
                console.log( '[Socket] Creating connection for session:', sessionId );
            }

            this.socket = io( VITE_BACKEND_URL, {
                transports           : [ 'websocket' ],
                autoConnect          : false,
                reconnection         : true,
                reconnectionDelay    : 500,
                reconnectionDelayMax : 3000
            } );

            if ( DEBUG_SOCKET ) {
                this.socket.onAny( ( event, ...args ) => {
                    console.log( `[Socket] Event: ${ event }`, args );
                } );
            }

            this.socket.on( 'connect', () => {
                const connectTime = Date.now() - startTime;

                this.isConnected = true;
                this.error = '';

                if ( DEBUG_SOCKET ) {
                    console.log( `[Socket] Connected in ${ connectTime }ms` );
                } else {
                    console.log( 'Connected to VelvetSync server' );
                }

                this.socket?.emit( 'join-session', sessionId );
            } );

            this.socket.on( 'session-joined', data => {
                if ( DEBUG_SOCKET ) {
                    console.log( '[Socket] Session joined:', data );
                }
            } );

            this.socket.on( 'disconnect', reason => {
                this.isConnected = false;

                if ( DEBUG_SOCKET ) {
                    console.log( '[Socket] Disconnected:', reason );
                } else {
                    console.log( 'Disconnected from server' );
                }
            } );

            this.socket.on( 'connect_error', error => {
                this.isConnected = false;
                this.error = error.message;

                if ( DEBUG_SOCKET ) {
                    console.error( '[Socket] Connect error:', error.message );
                }
            } );

            this.socket.on( 'chat-response', ( payload: ChatResponsePayload ) => {
                if ( payload.sessionId !== this.sessionId ) {
                    return;
                }

                this.messages.push( payload.message );
                this.isWaitingForResponse = false;
            } );

            this.socket.on( 'chat-error', ( payload: ChatErrorPayload ) => {
                this.error = payload.message;
                this.isWaitingForResponse = false;

                console.error( `[Socket] Chat error: ${ payload.code }`, payload.message );
            } );

            this.socket.on( 'toy-status', status => {
                console.log( 'Toy status:', status );
            } );

            this.socket.connect();
        },

        /**
         * Sends a user message through the websocket connection.
         */
        sendMessage( content: string ): void {
            const trimmedContent = content.trim();

            if ( !trimmedContent ) {
                return;
            }

            if ( !this.socket || !this.isConnected ) {
                this.error = 'Keine Verbindung zum Backend.';

                console.error( 'Not connected' );
                return;
            }

            const userMessage: Message = {
                id        : `${ Date.now() }`,
                role      : 'user',
                content   : trimmedContent,
                timestamp : new Date()
            };

            this.messages.push( userMessage );
            this.isWaitingForResponse = true;
            this.error = '';

            this.socket.emit( 'chat-message', {
                sessionId : this.sessionId,
                content   : trimmedContent
            } );
        },

        /**
         * Clears the local chat history.
         */
        clearMessages(): void {
            this.messages = [];
            this.error = '';
            this.isWaitingForResponse = false;
        },

        /**
         * Disconnects the websocket connection and resets connection state.
         */
        disconnect(): void {
            if ( this.socket ) {
                this.socket.disconnect();
                this.socket = null;
            }

            this.isConnected = false;
            this.isWaitingForResponse = false;
            this.sessionId = '';
        }
    }
} );