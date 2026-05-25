<script setup lang="ts">
import axios from 'axios';

import { useChatStore } from '@/stores/chat';

const chatStore = useChatStore();

/**
 * Requests a backend shutdown and clears the local websocket state.
 */
const shutdownServer = async () => {
    if ( !confirm( 'Server wirklich komplett beenden?' ) ) return;

    try {
        chatStore.disconnect();
        chatStore.clearMessages();

        await axios.post( '/api/session/shutdown' );
        alert( 'Server wird beendet...' );

        setTimeout( () => window.close(), 800 );
    } catch ( e ) {
        alert( 'Server konnte nicht beendet werden' );
    }
};
</script>

<template>
  <div class="session-controls">
    <button
      class="btn danger"
      type="button"
      @click="shutdownServer"
    >
      Server beenden
    </button>
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
}
</style>