import { defineStore } from 'pinia';
import axios           from 'axios';

export interface ProfileSummary {
    profileName: string;
    userName: string;
    persona: string;
    lastUsed: string;
    createdAt: string;
}

export interface PersonaSummary {
    id: string;
    name: string;
    description?: string;
}

export interface CreateProfile {
    profileName: string;
    userName: string;
    persona: string;
}

export interface UpdateProfile {
    userName?: string;
    persona?: string;
}

export const useConfigurationStore = defineStore( 'configuration', {
    state : () => ( {
        profiles          : [] as ProfileSummary[],
        personas          : [] as PersonaSummary[],
        latestProfileName : '' as string,
        activeProfile     : null as ProfileSummary | null,
        loading           : false,
        error             : '' as string,
        lastLoadedAt      : null as Date | null,
    } ),

    getters : {
        latestProfile( state ): ProfileSummary | null {
            return state.profiles.find( profile => {
                return profile.profileName === state.latestProfileName;
            } ) ?? null;
        },

        isConfigured( state ): boolean {
            return state.activeProfile !== null;
        },
    },

    actions : {
        /**
         * Loads all startup configuration data required by the setup dialog.
         */
        async loadStartupConfiguration(): Promise<void> {
            this.loading = true;
            this.error = '';

            try {
                const [ profileResponse, personaResponse ] = await Promise.all( [
                    axios.get( '/api/profiles' ),
                    axios.get( '/api/personas' ),
                ] );

                this.profiles = profileResponse.data.profiles ?? [];
                this.latestProfileName = profileResponse.data.latestProfileName ?? '';
                this.personas = personaResponse.data.personas ?? [];
                this.lastLoadedAt = new Date();
            } catch ( error ) {
                console.error( 'Failed to load startup configuration', error );
                this.error = this.extractErrorMessage( error, 'Die Konfiguration konnte nicht geladen werden.' );
            } finally {
                this.loading = false;
            }
        },

        /**
         * Creates a new profile on the backend and adds it to the local profile list.
         */
        async createProfile( payload: CreateProfile ): Promise<ProfileSummary | null> {
            this.error = '';

            try {
                const response = await axios.post( '/api/profiles', payload );
                const profile = response.data.profile as ProfileSummary;

                this.upsertProfile( profile );

                return profile;
            } catch ( error ) {
                console.error( 'Failed to create profile', error );
                this.error = this.extractErrorMessage( error, 'Das Profil konnte nicht erstellt werden.' );

                return null;
            }
        },

        /**
         * Activates a profile for the current backend session.
         */
        async activateProfile( profileName: string ): Promise<boolean> {
            this.error = '';

            try {
                const response = await axios.post( `/api/profiles/${ profileName }/activate` );

                this.activeProfile = response.data.profile ?? null;
                this.latestProfileName = profileName;

                return this.activeProfile !== null;
            } catch ( error ) {
                console.error( 'Failed to activate profile', error );
                this.error = this.extractErrorMessage( error, 'Das Profil konnte nicht aktiviert werden.' );

                return false;
            }
        },

        /**
         * Updates an existing profile and refreshes the local profile list.
         */
        async updateProfile( profileName: string, payload: UpdateProfile ): Promise<ProfileSummary | null> {
            this.error = '';

            try {
                const response = await axios.put( `/api/profiles/${ profileName }`, payload );
                const profile = response.data.profile as ProfileSummary;

                this.upsertProfile( profile );

                if ( this.activeProfile?.profileName === profile.profileName ) {
                    this.activeProfile = profile;
                }

                return profile;
            } catch ( error ) {
                console.error( 'Failed to update profile', error );
                this.error = this.extractErrorMessage( error, 'Das Profil konnte nicht aktualisiert werden.' );

                return null;
            }
        },

        /**
         * Deletes an existing profile and removes it from the local profile list.
         */
        async deleteProfile( profileName: string ): Promise<boolean> {
            this.error = '';

            try {
                await axios.delete( `/api/profiles/${ profileName }` );

                this.profiles = this.profiles.filter( profile => {
                    return profile.profileName !== profileName;
                } );

                if ( this.latestProfileName === profileName ) {
                    this.latestProfileName = this.profiles[ 0 ]?.profileName ?? '';
                }

                if ( this.activeProfile?.profileName === profileName ) {
                    this.activeProfile = null;
                }

                return true;
            } catch ( error ) {
                console.error( 'Failed to delete profile', error );
                this.error = this.extractErrorMessage( error, 'Das Profil konnte nicht gelöscht werden.' );

                return false;
            }
        },

        /**
         * Clears the active frontend configuration state without changing backend data.
         */
        clearActiveProfile(): void {
            this.activeProfile = null;
        },

        /**
         * Inserts or replaces a profile in the local profile list.
         */
        upsertProfile( profile: ProfileSummary ): void {
            const existingIndex = this.profiles.findIndex( existingProfile => {
                return existingProfile.profileName === profile.profileName;
            } );

            if ( existingIndex === -1 ) {
                this.profiles.push( profile );
                return;
            }

            this.profiles.splice( existingIndex, 1, profile );
        },

        /**
         * Extracts a user-facing error message from an API error response.
         */
        extractErrorMessage( error: unknown, fallbackMessage: string ): string {
            if ( axios.isAxiosError( error ) ) {
                const responseError = error.response?.data?.error;

                if ( typeof responseError === 'string' && responseError.trim().length > 0 ) {
                    return responseError;
                }
            }

            return fallbackMessage;
        },
    },
} );