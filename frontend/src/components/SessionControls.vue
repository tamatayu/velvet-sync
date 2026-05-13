<script setup lang="ts">
import { useChatStore } from '@/stores/chat'
import { useSessionStore } from '@/stores/session'
import axios from 'axios'

const chatStore = useChatStore()
const sessionStore = useSessionStore()

const endSession = async () => {
  if (!confirm('Session wirklich beenden?')) return
  
  try {
    const res = await axios.post(`/api/session/${sessionStore.sessionId}/end`)
    
    if (res.data.finalSummary) {
      alert('Session beendet!\n\nZusammenfassung:\n' + res.data.finalSummary.summary)
    }
    
    // Start new session
    startNewSession()
  } catch (e) {
    alert('Fehler beim Beenden der Session')
  }
}

const startNewSession = () => {
  const newSessionId = 'session-' + Date.now()
  sessionStore.setSessionId(newSessionId)
  chatStore.disconnect()
  chatStore.connect(newSessionId)
}

const shutdownServer = async () => {
  if (!confirm('Server wirklich komplett beenden?')) return
  
  try {
    await axios.post('/api/session/shutdown')
    alert('Server wird beendet...')
    // Close window after short delay
    setTimeout(() => window.close(), 1000)
  } catch (e) {
    alert('Server konnte nicht beendet werden')
  }
}
</script>

<template>
  <div class="session-controls">
    <button @click="endSession" class="btn">Session beenden</button>
    <button @click="startNewSession" class="btn">Neue Session</button>
    <button @click="shutdownServer" class="btn danger">Server beenden</button>
  </div>
</template>

<style scoped>
.session-controls {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
}

.btn {
  padding: 8px 16px;
  background: #333;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.btn:hover {
  background: #444;
}

.btn.danger {
  background: #c62828;
}

.btn.danger:hover {
  background: #b71c1c;
}</style>