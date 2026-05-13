import { defineStore } from 'pinia'
import axios from 'axios'

interface Persona {
  id: string
  name: string
  description: string
  avatar: string
  parameters: {
    edgingDifficulty: number
    minEdgesBeforeOrgasm: number
    intensityRampSpeed: number
    teaseLevel: number
    favoriteModes: string[]
    defaultTemperature: number
  }
}

export const usePersonaStore = defineStore('persona', {
  state: () => ({
    personas: [] as Persona[],
    currentPersona: null as Persona | null,
    loading: false
  }),

  actions: {
    async fetchPersonas() {
      this.loading = true
      try {
        const res = await axios.get('/api/personas')
        this.personas = res.data
        if (!this.currentPersona && this.personas.length > 0) {
          this.currentPersona = this.personas[0]
        }
      } catch (e) {
        console.error('Failed to fetch personas', e)
      } finally {
        this.loading = false
      }
    },

    async setCurrentPersona(id: string) {
      const persona = this.personas.find(p => p.id === id)
      if (persona) {
        this.currentPersona = persona
        // TODO: Notify backend about persona change for current session
      }
    },

    async saveCurrentPersona() {
      if (!this.currentPersona) return
      try {
        await axios.put(`/api/personas/${this.currentPersona.id}`, this.currentPersona)
      } catch (e) {
        console.error('Failed to save persona', e)
      }
    }
  }
})