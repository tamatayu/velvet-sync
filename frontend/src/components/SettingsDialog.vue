<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import { useConfigurationStore } from '@/stores/configuration';

const emit = defineEmits<{
    close: [];
}>();

const configurationStore = useConfigurationStore();

const mode = ref<'existing' | 'new'>( 'existing' );
const selectedProfileName = ref( '' );
const newProfileName = ref( '' );
const newUserName = ref( '' );
const selectedPersona = ref( '' );
const isSaving = ref( false );

const hasExistingProfiles = computed( () => {
    return configurationStore.profiles.length > 0;
} );

const canSubmit = computed( () => {
    if ( isSaving.value || configurationStore.loading ) {
        return false;
    }

    if ( mode.value === 'existing' ) {
        return selectedProfileName.value.trim().length > 0;
    }

    return newProfileName.value.trim().length > 0
        && newUserName.value.trim().length > 0
        && selectedPersona.value.trim().length > 0;
} );

const selectedPersonaDescription = computed( () => {
    return configurationStore.personas.find( persona => {
        return persona.id === selectedPersona.value;
    } )?.description ?? 'Keine Beschreibung vorhanden.';
} );

onMounted( async () => {
    if ( !configurationStore.lastLoadedAt ) {
        await configurationStore.loadStartupConfiguration();
    }

    if ( configurationStore.latestProfileName ) {
        selectedProfileName.value = configurationStore.latestProfileName;
    } else if ( configurationStore.profiles.length > 0 ) {
        selectedProfileName.value = configurationStore.profiles[ 0 ].profileName;
    }

    if ( configurationStore.personas.length > 0 ) {
        selectedPersona.value = configurationStore.personas[ 0 ].id;
    }

    if ( configurationStore.profiles.length === 0 ) {
        mode.value = 'new';
    }
} );

/**
 * Creates or activates the selected profile and starts the configured session.
 */
async function saveAndClose(): Promise<void> {
    if ( !canSubmit.value ) {
        return;
    }

    isSaving.value = true;

    try {
        let profileName = selectedProfileName.value.trim();

        if ( mode.value === 'new' ) {
            const createdProfile = await configurationStore.createProfile( {
                profileName : newProfileName.value.trim(),
                userName    : newUserName.value.trim(),
                persona     : selectedPersona.value,
            } );

            if ( !createdProfile ) {
                return;
            }

            profileName = createdProfile.profileName;
        }

        const activated = await configurationStore.activateProfile( profileName );

        if ( !activated ) {
            return;
        }

        emit( 'close' );
    } finally {
        isSaving.value = false;
    }
}
</script>

<template>
  <div class="modal-overlay">
    <div class="modal">
      <h2>VelvetSync Einstellungen</h2>
      <p class="subtitle">
        Wähle ein Profil aus oder erstelle ein neues Profil. Die Persona wird nach dem Bestätigen im Backend für diese Server-Session aktiviert.
      </p>

      <div
        v-if="configurationStore.error"
        class="error-box"
      >
        {{ configurationStore.error }}
      </div>

      <div
        v-if="configurationStore.loading"
        class="status-box"
      >
        Konfiguration wird geladen …
      </div>

      <template v-else>
        <div
          v-if="hasExistingProfiles"
          class="mode-toggle"
        >
          <button
            :class="{ active: mode === 'existing' }"
            type="button"
            @click="mode = 'existing'"
          >
            Bestehendes Profil
          </button>

          <button
            :class="{ active: mode === 'new' }"
            type="button"
            @click="mode = 'new'"
          >
            Neues Profil
          </button>
        </div>

        <div
          v-if="mode === 'existing'"
          class="form-group"
        >
          <label for="profile">Profil</label>

          <select
            id="profile"
            v-model="selectedProfileName"
          >
            <option
              v-for="profile in configurationStore.profiles"
              :key="profile.profileName"
              :value="profile.profileName"
            >
              {{ profile.profileName }} — {{ profile.userName }}
            </option>
          </select>
        </div>

        <template v-else>
          <div class="form-group">
            <label for="new-profile-name">Profilname</label>
            <input
              id="new-profile-name"
              v-model="newProfileName"
              autocomplete="off"
              placeholder="default"
              type="text"
            >
          </div>

          <div class="form-group">
            <label for="new-user-name">Nutzername</label>
            <input
              id="new-user-name"
              v-model="newUserName"
              autocomplete="off"
              placeholder="Dein Name"
              type="text"
            >
          </div>

          <div class="form-group">
            <label for="persona">Persona</label>
            <select
              id="persona"
              v-model="selectedPersona"
            >
              <option
                v-for="persona in configurationStore.personas"
                :key="persona.id"
                :value="persona.id"
              >
                {{ persona.name }}
              </option>
            </select>

            <p class="field-hint">
              {{ selectedPersonaDescription }}
            </p>
          </div>
        </template>

        <div class="actions">
          <button
            class="btn primary"
            :disabled="!canSubmit"
            type="button"
            @click="saveAndClose"
          >
            {{ isSaving ? 'Wird gestartet …' : 'Speichern & Starten' }}
          </button>
        </div>
      </template>
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
  max-width: 460px;
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
  line-height: 1.4;
}

.status-box,
.error-box {
  padding: 12px;
  margin-bottom: 18px;
  border-radius: 8px;
  font-size: 14px;
}

.status-box {
  background: #222;
  color: #ccc;
}

.error-box {
  background: #3b1d24;
  color: #fecdd3;
}

.mode-toggle {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.mode-toggle button {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #333;
  border-radius: 8px;
  background: #111;
  color: #ccc;
  cursor: pointer;
}

.mode-toggle button.active {
  border-color: #e91e63;
  background: #2a1a22;
  color: #fff;
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

input,
select {
  width: 100%;
  padding: 10px 12px;
  background: #111;
  border: 1px solid #333;
  border-radius: 8px;
  color: white;
  font-size: 15px;
  box-sizing: border-box;
}

.field-hint {
  margin: 8px 0 0;
  color: #888;
  font-size: 13px;
  line-height: 1.35;
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

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.btn.primary {
  background: #e91e63;
  color: white;
}

.btn.primary:not(:disabled):hover {
  background: #c2185b;
}
</style>