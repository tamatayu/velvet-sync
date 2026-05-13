<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePersonaStore } from '@/stores/persona'

const personaStore = usePersonaStore()
const showSettings = ref(false)
const selectedPersonaId = ref('')

onMounted(async () => {
  await personaStore.fetchPersonas()
  if (personaStore.personas.length > 0) {
    selectedPersonaId.value = personaStore.currentPersona?.id || personaStore.personas[0].id
  }
})

const selectPersona = async (id: string) => {
  selectedPersonaId.value = id
  await personaStore.setCurrentPersona(id)
}
</script>

<template>
  <div class="persona-selector">
    <div class="selector-header">
      <h3>Persona</h3>
      <button @click="showSettings = true" class="settings-btn">⚙️</button>
    </div>

    <div class="persona-list">
      <div 
        v-for="persona in personaStore.personas" 
        :key="persona.id"
        :class="['persona-card', { active: persona.id === selectedPersonaId }]"
        @click="selectPersona(persona.id)"
      >
        <div class="avatar">{{ persona.avatar?.[0]?.toUpperCase() || 'P' }}</div>
        <div class="info">
          <div class="name">{{ persona.name }}</div>
          <div class="tease">{{ persona.parameters?.teaseLevel || 70 }}% Tease</div>
        </div>
      </div>
    </div>

    <!-- Settings Modal -->
    <div v-if="showSettings" class="modal-overlay" @click="showSettings = false">
      <div class="modal" @click.stop>
        <h2>Einstellungen - {{ personaStore.currentPersona?.name }}</h2>
        
        <div class="setting">
          <label>Edging Schwierigkeit: {{ personaStore.currentPersona?.parameters?.edgingDifficulty || 5 }}/10</label>
          <input type="range" min="1" max="10" step="1" 
                 v-model="personaStore.currentPersona!.parameters.edgingDifficulty" />
        </div>

        <div class="setting">
          <label>Tease Level: {{ personaStore.currentPersona?.parameters?.teaseLevel || 70 }}%</label>
          <input type="range" min="0" max="100" step="5" 
                 v-model="personaStore.currentPersona!.parameters.teaseLevel" />
        </div>

        <div class="setting">
          <label>Min. Edges vor Orgasmus: {{ personaStore.currentPersona?.parameters?.minEdgesBeforeOrgasm || 3 }}</label>
          <input type="range" min="1" max="10" step="1" 
                 v-model="personaStore.currentPersona!.parameters.minEdgesBeforeOrgasm" />
        </div>

        <div class="modal-actions">
          <button @click="showSettings = false">Schließen</button>
          <button @click="personaStore.saveCurrentPersona(); showSettings = false" class="primary">Speichern</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.persona-selector { margin-bottom: 20px; }
.selector-header { display: flex; justify-content: space-between; align-items: center; }
.settings-btn { background: none; border: none; font-size: 18px; cursor: pointer; }

.persona-list { display: flex; gap: 10px; margin-top: 10px; }
.persona-card { 
  flex: 1; 
  padding: 12px; 
  background: #222; 
  border-radius: 10px; 
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s;
}
.persona-card.active { border: 2px solid #e91e63; background: #2a1a22; }
.persona-card:hover { background: #333; }

.avatar { 
  width: 40px; height: 40px; 
  background: #e91e63; 
  border-radius: 50%; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  font-weight: bold; 
  font-size: 18px;
}

.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}
.modal {
  background: #1a1a1a;
  padding: 30px;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
}
.setting { margin: 20px 0; }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 25px; }
button.primary { background: #e91e63; color: white; }
</style>