<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useSessionStore } from '@/stores/session'
import PersonaSelector from '@/components/PersonaSelector.vue'

const chatStore = useChatStore()
const sessionStore = useSessionStore()

const messageInput = ref('')
const messagesContainer = ref<HTMLElement | null>(null)

const sendMessage = async () => {
  if (!messageInput.value.trim()) return
  
  await chatStore.sendMessage(messageInput.value.trim())
  messageInput.value = ''
  
  // Auto-scroll
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}
</script>

<template>
  <div class="app">
    <header class="header">
      <h1>VelvetSync</h1>
      <PersonaSelector />
      <div v-if="!chatStore.isConnected" class="connection-status">
        Verbinde mit Server...
      </div>
      <div class="status">
        <span :class="{ connected: chatStore.isConnected }">
          {{ chatStore.isConnected ? '● Verbunden' : '○ Getrennt' }}
        </span>
        <span class="session">Session: {{ sessionStore.sessionId }}</span>
      </div>
    </header>

    <div class="chat-container">
      <div ref="messagesContainer" class="messages">
        <div 
          v-for="msg in chatStore.messages" 
          :key="msg.id"
          :class="['message', msg.role]"
        >
          <div class="message-content">{{ msg.content }}</div>
          <div class="message-time">{{ new Date(msg.timestamp).toLocaleTimeString() }}</div>
        </div>
      </div>

      <div class="input-area">
        <input 
          v-model="messageInput"
          @keyup.enter="sendMessage"
          placeholder="Schreibe eine Nachricht..."
          :disabled="!chatStore.isConnected"
        />
        <button @click="sendMessage" :disabled="!messageInput.trim() || !chatStore.isConnected">
          Senden
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: system-ui, -apple-system, sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #333;
}

.header h1 {
  margin: 0;
  color: #e91e63;
}

.status {
  display: flex;
  gap: 15px;
  font-size: 14px;
}

.connected { color: #4caf50; }
.session { color: #888; }

.chat-container {
  border: 1px solid #333;
  border-radius: 12px;
  overflow: hidden;
  background: #1a1a1a;
}

.messages {
  height: 500px;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 18px;
  word-wrap: break-word;
}

.message.user {
  align-self: flex-end;
  background: #e91e63;
  color: white;
}

.message.assistant {
  align-self: flex-start;
  background: #333;
  color: #eee;
}

.message-time {
  font-size: 11px;
  opacity: 0.6;
  margin-top: 4px;
}

.input-area {
  display: flex;
  padding: 15px;
  background: #222;
  border-top: 1px solid #333;
}

.input-area input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #444;
  border-radius: 25px;
  background: #111;
  color: white;
  font-size: 16px;
}

.input-area input:focus {
  outline: none;
  border-color: #e91e63;
}

.input-area button {
  margin-left: 10px;
  padding: 12px 24px;
  background: #e91e63;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
}

.input-area button:disabled {
  background: #555;
  cursor: not-allowed;
}
</style>