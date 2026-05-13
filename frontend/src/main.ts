import { createApp } from 'vue';
import { createPinia } from 'pinia';
// @ts-ignore
import App from './App.vue';
import './style.css';
import { useChatStore } from './stores/chat';
import { useSessionStore } from './stores/session';

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

// ⚡ Sofort nach App-Start Verbindung aufbauen
const sessionStore = useSessionStore()
const chatStore = useChatStore()
chatStore.connect(sessionStore.sessionId)

app.mount('#app')