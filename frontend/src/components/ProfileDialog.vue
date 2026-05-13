<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useSessionStore } from '@/stores/session'

const emit = defineEmits(['close'])

const sessionStore = useSessionStore()

const profiles = ref<any[]>([])
const currentProfile = ref<any>(null)
const showCreateForm = ref(false)

const newProfile = ref({
  name: '',
  gender: 'male',
  personaId: 'vanilla'
})

const genders = [
  { value: 'male', label: 'Männlich' },
  { value: 'female', label: 'Weiblich' },
  { value: 'non-binary', label: 'Non-Binary' }
]

const loadProfiles = async () => {
  try {
    const res = await axios.get('/api/profiles')
    profiles.value = res.data
    
    const current = await axios.get('/api/profiles/current')
    currentProfile.value = current.data
  } catch (e) {
    console.error('Failed to load profiles')
  }
}

const createProfile = async () => {
  if (!newProfile.value.name.trim()) return
  
  try {
    await axios.post('/api/profiles', newProfile.value)
    await loadProfiles()
    showCreateForm.value = false
    newProfile.value = { name: '', gender: 'male', personaId: 'vanilla' }
  } catch (e) {
    alert('Fehler beim Erstellen des Profils')
  }
}

const switchProfile = async (profileId: string) => {
  try {
    await axios.post(`/api/profiles/${profileId}/switch`)
    await loadProfiles()
    
    // Reload chat with new profile
    const newSessionId = 'profile-' + Date.now()
    sessionStore.setSessionId(newSessionId)
    // In real app we would reconnect chat here
  } catch (e) {
    alert('Fehler beim Wechseln des Profils')
  }
}

const deleteProfile = async (profileId: string) => {
  if (!confirm('Profil wirklich löschen? Alle Erinnerungen gehen verloren!')) return
  
  try {
    await axios.delete(`/api/profiles/${profileId}`)
    await loadProfiles()
  } catch (e) {
    alert('Fehler beim Löschen des Profils')
  }
}

onMounted(() => {
  loadProfiles()
})
</script>

<template>
  <div class="modal-overlay">
    <div class="modal">
      <div class="header">
        <h2>Profile verwalten</h2>
        <button @click="emit('close')" class="close-btn">✕</button>
      </div>

      <!-- Current Profile -->
      <div v-if="currentProfile" class="current-profile">
        <strong>Aktuelles Profil:</strong> {{ currentProfile.name }} ({{ currentProfile.gender }})
      </div>

      <!-- Profile List -->
      <div class="profile-list">
        <div 
          v-for="profile in profiles" 
          :key="profile.id"
          :class="['profile-item', { active: profile.id === currentProfile?.id }]"
        >
          <div class="profile-info">
            <div class="name">{{ profile.name }}</div>
            <div class="meta">{{ profile.gender }} • {{ profile.personaId }}</div>
          </div>
          
          <div class="actions">
            <button 
              v-if="profile.id !== currentProfile?.id"
              @click="switchProfile(profile.id)"
              class="btn small"
            >
              Wechseln
            </button>
            <button 
              @click="deleteProfile(profile.id)"
              class="btn small danger"
            >
              Löschen
            </button>
          </div>
        </div>
      </div>

      <!-- Create New Profile -->
      <div v-if="showCreateForm" class="create-form">
        <h4>Neues Profil anlegen</h4>
        
        <div class="form-group">
          <label>Name</label>
          <input v-model="newProfile.name" type="text" placeholder="Profilname" />
        </div>

        <div class="form-group">
          <label>Geschlecht</label>
          <select v-model="newProfile.gender">
            <option v-for="g in genders" :key="g.value" :value="g.value">
              {{ g.label }}
            </option>
          </select>
        </div>

        <div class="form-actions">
          <button @click="showCreateForm = false" class="btn">Abbrechen</button>
          <button @click="createProfile" class="btn primary">Profil anlegen</button>
        </div>
      </div>

      <div v-else class="actions">
        <button @click="showCreateForm = true" class="btn primary">Neues Profil anlegen</button>
        <button @click="emit('close')" class="btn">Fertig</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal {
  background: #1a1a1a;
  padding: 25px;
  border-radius: 16px;
  width: 90%;
  max-width: 480px;
  color: #eee;
  max-height: 80vh;
  overflow-y: auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.close-btn {
  background: none;
  border: none;
  color: #888;
  font-size: 20px;
  cursor: pointer;
}

.current-profile {
  background: #222;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
}

.profile-list {
  margin-bottom: 20px;
}

.profile-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #222;
  border-radius: 8px;
  margin-bottom: 8px;
}

.profile-item.active {
  border: 2px solid #e91e63;
}

.profile-info .name {
  font-weight: 600;
}

.profile-info .meta {
  font-size: 12px;
  color: #888;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
}

.btn.primary {
  background: #e91e63;
  color: white;
}

.btn.danger {
  background: #c62828;
  color: white;
}

.btn.small {
  padding: 4px 10px;
  font-size: 12px;
}

.create-form {
  background: #222;
  padding: 16px;
  border-radius: 8px;
  margin-top: 15px;
}

.form-group {
  margin-bottom: 12px;
}

label {
  display: block;
  margin-bottom: 4px;
  font-size: 13px;
  color: #ccc;
}

input, select {
  width: 100%;
  padding: 8px 10px;
  background: #111;
  border: 1px solid #333;
  border-radius: 6px;
  color: white;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}</style>