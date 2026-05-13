<script setup lang="ts">
import { useSessionStore } from '@/stores/session'
import axios from 'axios'

const sessionStore = useSessionStore()

const shutdownServer = async () => {
  if (!confirm('Server wirklich komplett beenden?')) return
  
  try {
    await axios.post('/api/session/shutdown')
    alert('Server wird beendet...')
    setTimeout(() => window.close(), 800)
  } catch (e) {
    alert('Server konnte nicht beendet werden')
  }
}
</script>

<template>
  <div class="session-controls">
    <button @click="shutdownServer" class="btn danger">Server beenden</button>
  </div>
</template>

<style scoped>
.session-controls {
  margin-bottom: 15px;
}

.btn {
  padding: 8px 16px;
  background: #c62828;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.btn:hover {
  background: #b71c1c;
}</style>