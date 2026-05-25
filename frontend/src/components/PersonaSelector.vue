<script setup lang="ts">
import { computed } from 'vue';

import { useConfigurationStore } from '@/stores/configuration';

const configurationStore = useConfigurationStore();

const activePersona = computed( () => {
    const activeProfile = configurationStore.activeProfile;

    if ( !activeProfile ) {
        return null;
    }

    return configurationStore.personas.find( persona => {
        return persona.id === activeProfile.persona;
    } ) ?? null;
} );

const personaInitial = computed( () => {
    return activePersona.value?.name?.[ 0 ]?.toUpperCase() ?? 'P';
} );
</script>

<template>
  <div class="persona-selector">
    <div class="selector-header">
      <h3>Persona</h3>
    </div>

    <div
      v-if="activePersona"
      class="persona-card active"
    >
      <div class="avatar">
        {{ personaInitial }}
      </div>

      <div class="info">
        <div class="name">
          {{ activePersona.name }}
        </div>

        <div class="description">
          {{ activePersona.description || 'Keine Beschreibung vorhanden.' }}
        </div>
      </div>
    </div>

    <div
      v-else
      class="persona-card empty"
    >
      <div class="avatar">
        P
      </div>

      <div class="info">
        <div class="name">
          Keine Persona aktiv
        </div>

        <div class="description">
          Bestätige zuerst die Startkonfiguration.
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.persona-selector {
  margin-bottom: 20px;
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.persona-card {
  padding: 12px;
  margin-top: 10px;
  background: #222;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s;
}

.persona-card.active {
  border: 2px solid #e91e63;
  background: #2a1a22;
}

.persona-card.empty {
  opacity: 0.7;
}

.avatar {
  width: 40px;
  height: 40px;
  background: #e91e63;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
}

.info {
  min-width: 0;
}

.name {
  font-weight: 700;
}

.description {
  margin-top: 4px;
  color: #aaa;
  font-size: 0.85rem;
  line-height: 1.3;
}
</style>