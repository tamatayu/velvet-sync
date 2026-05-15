import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './style.css'
import { useChatStore } from './stores/chat'
import { useSessionStore } from './stores/session'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

// Zentrale Socket-Verbindung (nur einmal!)
const sessionStore = useSessionStore(pinia)
const chatStore = useChatStore(pinia)

const sessionId = sessionStore.sessionId || 'demo-session'
sessionStore.setSessionId(sessionId)
chatStore.connect(sessionId)

app.mount('#app')