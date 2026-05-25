<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import { useConfigurationStore, type ProfileSummary } from '@/stores/configuration';

const emit = defineEmits<{
    close: [];
}>();

const configurationStore = useConfigurationStore();

const showCreateForm = ref( false );
const editingProfileName = ref( '' );
const isSaving = ref( false );

const newProfile = ref( {
    profileName : '',
    userName    : '',
    persona     : '',
} );

const editProfile = ref( {
    userName : '',
    persona  : '',
} );

const activeProfile = computed( () => {
    return configurationStore.activeProfile;
} );

const canCreateProfile = computed( () => {
    return newProfile.value.profileName.trim().length > 0
        && newProfile.value.userName.trim().length > 0
        && newProfile.value.persona.trim().length > 0
        && !isSaving.value;
} );

const canUpdateProfile = computed( () => {
    return editingProfileName.value.trim().length > 0
        && editProfile.value.userName.trim().length > 0
        && editProfile.value.persona.trim().length > 0
        && !isSaving.value;
} );

onMounted( async () => {
    if ( !configurationStore.lastLoadedAt ) {
        await configurationStore.loadStartupConfiguration();
    }

    resetNewProfile();
} );

/**
 * Returns the display name for a persona id.
 */
function getPersonaName( personaId: string ): string {
    return configurationStore.personas.find( persona => {
        return persona.id === personaId;
    } )?.name ?? personaId;
}

/**
 * Resets the create form to safe defaults.
 */
function resetNewProfile(): void {
    newProfile.value = {
        profileName : '',
        userName    : '',
        persona     : configurationStore.personas[ 0 ]?.id ?? '',
    };
}

/**
 * Opens the edit form for the selected profile.
 */
function startEditProfile( profile: ProfileSummary ): void {
    showCreateForm.value = false;
    editingProfileName.value = profile.profileName;
    editProfile.value = {
        userName : profile.userName,
        persona  : profile.persona,
    };
}

/**
 * Closes the edit form without saving changes.
 */
function cancelEditProfile(): void {
    editingProfileName.value = '';
    editProfile.value = {
        userName : '',
        persona  : configurationStore.personas[ 0 ]?.id ?? '',
    };
}

/**
 * Creates a new profile using the configuration store.
 */
async function createProfile(): Promise<void> {
    if ( !canCreateProfile.value ) {
        return;
    }

    isSaving.value = true;

    try {
        const createdProfile = await configurationStore.createProfile( {
            profileName : newProfile.value.profileName.trim(),
            userName    : newProfile.value.userName.trim(),
            persona     : newProfile.value.persona,
        } );

        if ( !createdProfile ) {
            return;
        }

        resetNewProfile();
        showCreateForm.value = false;
    } finally {
        isSaving.value = false;
    }
}

/**
 * Updates the selected profile using the configuration store.
 */
async function updateProfile(): Promise<void> {
    if ( !canUpdateProfile.value ) {
        return;
    }

    isSaving.value = true;

    try {
        const updatedProfile = await configurationStore.updateProfile( editingProfileName.value, {
            userName : editProfile.value.userName.trim(),
            persona  : editProfile.value.persona,
        } );

        if ( !updatedProfile ) {
            return;
        }

        cancelEditProfile();
    } finally {
        isSaving.value = false;
    }
}

/**
 * Deletes a profile after confirmation.
 */
async function deleteProfile( profile: ProfileSummary ): Promise<void> {
    if ( activeProfile.value?.profileName === profile.profileName ) {
        configurationStore.error = 'Das aktive Profil kann nicht gelöscht werden.';
        return;
    }

    if ( !confirm( `Profil "${ profile.profileName }" wirklich löschen?` ) ) {
        return;
    }

    await configurationStore.deleteProfile( profile.profileName );
}
</script>

<template>
  <div class="modal-overlay">
    <div class="modal">
      <div class="header">
        <h2>Profile verwalten</h2>
        <button
          class="close-btn"
          type="button"
          @click="emit('close')"
        >
          ✕
        </button>
      </div>

      <div
        v-if="configurationStore.error"
        class="error-box"
      >
        {{ configurationStore.error }}
      </div>

      <div
        v-if="activeProfile"
        class="current-profile"
      >
        <strong>Aktuelles Profil:</strong>
        {{ activeProfile.profileName }} — {{ activeProfile.userName }} / {{ getPersonaName(activeProfile.persona) }}
      </div>

      <div
        v-if="configurationStore.loading"
        class="status-box"
      >
        Profile werden geladen …
      </div>

      <template v-else>
        <div class="profile-list">
          <div
            v-for="profile in configurationStore.profiles"
            :key="profile.profileName"
            :class="['profile-item', { active: profile.profileName === activeProfile?.profileName }]"
          >
            <div class="profile-info">
              <div class="name">
                {{ profile.profileName }}
              </div>
              <div class="meta">
                {{ profile.userName }} • {{ getPersonaName(profile.persona) }}
              </div>
            </div>

            <div class="item-actions">
              <button
                class="btn small"
                type="button"
                @click="startEditProfile(profile)"
              >
                Bearbeiten
              </button>

              <button
                class="btn small danger"
                :disabled="profile.profileName === activeProfile?.profileName"
                type="button"
                @click="deleteProfile(profile)"
              >
                Löschen
              </button>
            </div>
          </div>

          <div
            v-if="configurationStore.profiles.length === 0"
            class="empty-state"
          >
            Noch keine Profile vorhanden.
          </div>
        </div>

        <div
          v-if="editingProfileName"
          class="create-form"
        >
          <h4>Profil bearbeiten: {{ editingProfileName }}</h4>

          <div class="form-group">
            <label for="edit-user-name">Nutzername</label>
            <input
              id="edit-user-name"
              v-model="editProfile.userName"
              autocomplete="off"
              type="text"
            >
          </div>

          <div class="form-group">
            <label for="edit-persona">Persona</label>
            <select
              id="edit-persona"
              v-model="editProfile.persona"
            >
              <option
                v-for="persona in configurationStore.personas"
                :key="persona.id"
                :value="persona.id"
              >
                {{ persona.name }}
              </option>
            </select>
          </div>

          <div class="form-actions">
            <button
              class="btn"
              type="button"
              @click="cancelEditProfile"
            >
              Abbrechen
            </button>

            <button
              class="btn primary"
              :disabled="!canUpdateProfile"
              type="button"
              @click="updateProfile"
            >
              Speichern
            </button>
          </div>
        </div>

        <div
          v-else-if="showCreateForm"
          class="create-form"
        >
          <h4>Neues Profil anlegen</h4>

          <div class="form-group">
            <label for="new-profile-name">Profilname</label>
            <input
              id="new-profile-name"
              v-model="newProfile.profileName"
              autocomplete="off"
              placeholder="default"
              type="text"
            >
          </div>

          <div class="form-group">
            <label for="new-user-name">Nutzername</label>
            <input
              id="new-user-name"
              v-model="newProfile.userName"
              autocomplete="off"
              placeholder="Dein Name"
              type="text"
            >
          </div>

          <div class="form-group">
            <label for="new-persona">Persona</label>
            <select
              id="new-persona"
              v-model="newProfile.persona"
            >
              <option
                v-for="persona in configurationStore.personas"
                :key="persona.id"
                :value="persona.id"
              >
                {{ persona.name }}
              </option>
            </select>
          </div>

          <div class="form-actions">
            <button
              class="btn"
              type="button"
              @click="showCreateForm = false"
            >
              Abbrechen
            </button>

            <button
              class="btn primary"
              :disabled="!canCreateProfile"
              type="button"
              @click="createProfile"
            >
              Profil anlegen
            </button>
          </div>
        </div>

        <div
          v-else
          class="actions"
        >
          <button
            class="btn primary"
            type="button"
            @click="showCreateForm = true"
          >
            Neues Profil anlegen
          </button>

          <button
            class="btn"
            type="button"
            @click="emit('close')"
          >
            Fertig
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
  padding: 25px;
  border-radius: 16px;
  width: 90%;
  max-width: 560px;
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

.status-box,
.error-box,
.empty-state,
.current-profile {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
}

.status-box,
.empty-state,
.current-profile {
  background: #222;
}

.error-box {
  background: #3b1d24;
  color: #fecdd3;
}

.profile-list {
  margin-bottom: 20px;
}

.profile-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #222;
  border-radius: 8px;
  margin-bottom: 8px;
}

.profile-item.active {
  border: 2px solid #e91e63;
}

.profile-info {
  min-width: 0;
}

.profile-info .name {
  font-weight: 600;
}

.profile-info .meta {
  margin-top: 4px;
  font-size: 12px;
  color: #888;
}

.item-actions,
.actions,
.form-actions {
  display: flex;
  gap: 8px;
}

.item-actions {
  flex-shrink: 0;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
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

input,
select {
  width: 100%;
  box-sizing: border-box;
  padding: 8px 10px;
  background: #111;
  border: 1px solid #333;
  border-radius: 6px;
  color: white;
}

.form-actions {
  margin-top: 15px;
}
</style>