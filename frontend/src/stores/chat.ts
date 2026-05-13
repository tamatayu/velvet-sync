import { defineStore } from 'pinia'
import { io, Socket } from 'socket.io-client'

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
      this.sessionId = sessionId
      
      this.socket = io('http://localhost:3000', {
        transports: ['websocket']
      })

      this.socket.on('connect', () => {
        this.isConnected = true
        console.log('Connected to VelvetSync server')
        
        // Join session room
        this.socket?.emit('join-session', sessionId)
      })

      this.socket.on('disconnect', () => {
        this.isConnected = false
        console.log('Disconnected from server')
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