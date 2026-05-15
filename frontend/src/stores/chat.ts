import { defineStore } from 'pinia'
import { io, Socket } from 'socket.io-client'
import { DEBUG_SOCKET } from '@/config'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system' | 'thought'
  content: string
  timestamp: Date
}

export const useChatStore = defineStore('chat', {
  state: () => ({
    messages: [] as Message[],
    isConnected: false,
    socket: null as Socket | null,
    sessionId: ''
  }),

  actions: {
    connect(sessionId: string) {
      // Guard: Nur einmal pro Session verbinden
      if (this.socket && this.isConnected) {
        if (DEBUG_SOCKET) console.log('[Socket] Already connected, skipping')
        return
      }

      this.sessionId = sessionId

      const startTime = Date.now()

      if (DEBUG_SOCKET) {
        console.log(`[Socket] Creating connection at ${new Date().toISOString()}`)
        console.log('[Socket] Creating connection for session:', sessionId)
      }

      this.socket = io('http://localhost:3000', {
        transports: ['websocket'],
        autoConnect: false,
        reconnection: false,
        reconnectionDelay: 200,
        reconnectionDelayMax: 1000
      })

      // Logging
      if (DEBUG_SOCKET) {
        this.socket.onAny((event, ...args) => {
          console.log(`[Socket] Event: ${event}`, args)
        })
      }

      this.socket.on('connect', () => {
        const connectTime = Date.now() - startTime
        this.isConnected = true

        if (DEBUG_SOCKET) {
          console.log(`[Socket] Connected in ${connectTime}ms`)
        } else {
          console.log('Connected to VelvetSync server')
        }

        // Join session room
        this.socket?.emit('join-session', sessionId)
      })

      this.socket.on('disconnect', (reason) => {
        this.isConnected = false
        if (DEBUG_SOCKET) {
          console.log('[Socket] Disconnected:', reason)
        } else {
          console.log('Disconnected from server')
        }
      })

      this.socket.on('connect_error', (err) => {
        if (DEBUG_SOCKET) {
          console.error('[Socket] Connect error:', err.message)
        }
      })

      this.socket.on('chat-response', (message: Message) => {
        this.messages.push(message)
      })

      this.socket.on('error', (error: any) => {
        console.error('Socket error:', error)
      })

      this.socket.on('toy-status', (status: any) => {
        console.log('Toy status:', status)
      })

      // Manuell verbinden (so früh wie möglich)
      this.socket.connect()
    },

    async sendMessage(content: string) {
      if (!this.socket || !this.isConnected) {
        console.error('Not connected')
        return
      }

      // Add user message immediately
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content,
        timestamp: new Date()
      }
      this.messages.push(userMessage)

      // Send to server
      this.socket.emit('chat-message', {
        sessionId: this.sessionId,
        content
      })
    },

    disconnect() {
      if (this.socket) {
        this.socket.disconnect()
        this.socket = null
      }
      this.isConnected = false
    }
  }
})