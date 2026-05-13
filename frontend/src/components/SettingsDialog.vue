<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSessionStore } from '@/stores/session'
import axios from 'axios'

const emit = defineEmits(['close'])

const sessionStore = useSessionStore()

const name = ref('')
const gender = ref('male')
const description = ref('')
const activePersona = ref('vanilla')

const genders = [
  { value: 'male', label: 'Männlich' },
  { value: 'female', label: 'Weiblich' },
  { value: 'non-binary', label: 'Non-Binary' }
]

const personas = [
  { value: 'vanilla', label: 'Vanilla (Default)' }
]

onMounted(() => {
  // Load saved settings or use defaults
  const saved = localStorage.getItem('velvet-settings')
  if (saved) {
    try {
      const data = JSON.parse(saved)
      name.value = data.name || ''
      gender.value = data.gender || 'male'
      description.value = data.description || ''
      activePersona.value = data.activePersona || 'vanilla'
    } catch {}
  } else {
    // Default values for first start
    name.value = 'Alex'
    gender.value = 'male'
    description.value = 'Heterosexual middle-aged man'
    activePersona.value = 'vanilla'
  }
})

const saveAndClose = async () => {
  if (!name.value.trim()) {
    alert('Bitte gib einen Namen ein')
    return
  }

  try {
    // Create real Profile via backend
    const profileData = {
      name: name.value,
      gender: gender.value,
      personaId: activePersona.value
    }
    
    const profileRes = await axios.post('/api/profiles', profileData)
    const newProfile = profileRes.data

    // Also save local settings for backward compatibility
    const settings = {
      name: name.value,
      gender: gender.value,
      description: description.value,
      activePersona: activePersona.value,
      profileId: newProfile.id,
      savedAt: new Date().toISOString()
    }
    
    localStorage.setItem('velvet-settings', JSON.stringify(settings))
    sessionStore.setUserSettings(settings)
    
    emit('close')
  } catch (e) {
    alert('Fehler beim Erstellen des Profils')
  }
}
</script>

<template>
  <div class="modal-overlay">
    <div class="modal">
      <h2>VelvetSync Einstellungen</h2>
      <p class="subtitle">Bitte gib ein paar Infos über dich an</p>

      <div class="form-group">
        <label>Name</label>
        <input v-model="name" type="text" placeholder="Dein Name" />
      </div>

      <div class="form-group">
        <label>Geschlecht</label>
        <select v-model="gender">
          <option v-for="g in genders" :key="g.value" :value="g.value">
            {{ g.label }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>Beschreibung (kurz)</label>
        <input v-model="description" type="text" placeholder="z.B. Heterosexual middle-aged man" />
      </div>

      <div class="form-group">
        <label>Persona</label>
        <select v-model="activePersona">
          <option v-for="p in personas" :key="p.value" :value="p.value">
            {{ p.label }}
          </option>
        </select>
      </div>

      <div class="actions">
        <button @click="saveAndClose" class="btn primary">Speichern & Starten</button>
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
  padding: 30px;
  border-radius: 16px;
  width: 90%;
  max-width: 420px;
  color: #eee;
}

h2 {
  margin: 0 0 8px 0;
  color: #e91e63;
}

.subtitle {
  color: #888;
  margin-bottom: 25px;
  font-size: 14px;
}

.form-group {
  margin-bottom: 18px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  color: #ccc;
}

input, select {
  width: 100%;
  padding: 10px 12px;
  background: #111;
  border: 1px solid #333;
  border-radius: 8px;
  color: white;
  font-size: 15px;
}

.actions {
  margin-top: 25px;
  text-align: right;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
}

.btn.primary {
  background: #e91e63;
  color: white;
}

.btn.primary:hover {
  background: #c2185b;
}</style>