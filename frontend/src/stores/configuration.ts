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

export const useConfigurationStore = defineStore( 'configuration', {
    state : () => ( {
        profiles          : [] as ProfileSummary[],
        personas          : [] as PersonaSummary[],
        latestProfileName : '' as string,
        activeProfile     : null as ProfileSummary | null,
        loading           : false,
        error             : '' as string,
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
            } catch ( error ) {
                console.error( 'Failed to load startup configuration', error );
                this.error = 'Die Konfiguration konnte nicht geladen werden.';
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

                this.profiles.push( profile );

                return profile;
            } catch ( error ) {
                console.error( 'Failed to create profile', error );
                this.error = 'Das Profil konnte nicht erstellt werden.';

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
                this.error = 'Das Profil konnte nicht aktiviert werden.';

                return false;
            }
        },
    },
} );