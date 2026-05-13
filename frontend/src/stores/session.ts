import { defineStore } from 'pinia'

export const useSessionStore = defineStore('session', {
  state: () => ({
    sessionId: localStorage.getItem('velvet-session-id') || 'demo-' + Date.now(),
    personaId: localStorage.getItem('velvet-persona-id') || 'luna'
  }),

  actions: {
    setSessionId(id: string) {
      this.sessionId = id
      localStorage.setItem('velvet-session-id', id)
    },

    setPersonaId(id: string) {
      this.personaId = id
      localStorage.setItem('velvet-persona-id', id)
    }
  }
})