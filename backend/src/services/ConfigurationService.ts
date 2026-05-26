import fs                                                   from 'fs';
import path                                                 from 'path';
import { z }                                                from 'zod';
import { fileURLToPath }                                    from 'url';
import { ModeConfiguration }                                from '../types/mode.types';
import { PersonaMemory }                                    from '../types/persona.types';
import { ModelOptions }                                     from '../types/persona.types';
import { HandyConfig }                                      from '../types/handy.types';
import * as Schema                                          from '../schema';
import { singleton }                                        from 'tsyringe';

const __filename = fileURLToPath( import.meta.url );
const __dirname = path.dirname( __filename );

@singleton()
export class ConfigurationService {
    private readonly __profileDir__: string;
    private readonly __personaDir__: string;
    
    private _availablePersonas: PersonaFileData[];
    private _availableProfiles: ProfileFileData[];

    private activeProfile: ActiveProfile | null = null;

    constructor() {
        const __dataDir__ = path.join( __dirname, '../../data' );
        this.__profileDir__ = path.join( __dataDir__, 'profile' );
        this.__personaDir__ = path.join( __dataDir__, 'persona' );

        this.ensureDataStructure();
        
        this._availablePersonas = this.loadAvailablePersonas();
        this._availableProfiles = this.loadAvailableProfiles();
    }

    private loadAvailablePersonas(): PersonaFileData[] {
        const availablePersonas: PersonaFileData[] = [];

        if ( !fs.existsSync( this.__personaDir__ ) ) {
            console.warn( 'Persona directory does not exist' );
            return [];
        }

        const files = fs.readdirSync( this.__personaDir__ ).filter( file => file.endsWith( '.json' ) );

        for ( const file of files ) {
            try {
                const filePath = path.join( this.__personaDir__, file );
                const raw = fs.readFileSync( filePath, 'utf-8' );
                const data = JSON.parse( raw );

                const validated = Schema.Persona.PersonaFileData.parse( data );

                availablePersonas.push( validated );
            } catch ( error ) {
                console.warn( `Invalid persona skipped: ${ file }`, error instanceof z.ZodError ? error.errors : error );
                // ignore file
            }
        }

        console.log( `Loaded ${ availablePersonas.length } valid personas` );
        return availablePersonas;
    }

    private loadAvailableProfiles(): ProfileFileData[] {
        const availableProfiles: ProfileFileData[] = [];

        if ( !fs.existsSync( this.__profileDir__ ) ) {
            console.warn( 'Profile directory does not exist' );
            return [];
        }

        const files = fs.readdirSync( this.__profileDir__ ).filter( file => file.endsWith( '.json' ) );

        for ( const file of files ) {
            try {
                const filePath = path.join( this.__profileDir__, file );
                const raw = fs.readFileSync( filePath, 'utf-8' );
                const data = JSON.parse( raw );

                const validated = Schema.Profile.ProfileFileData.parse( data );

                availableProfiles.push( validated );
            } catch ( error ) {
                console.warn( `Invalid profile skipped: ${ file }`, error instanceof z.ZodError ? error.errors : error );
                // ignore file
            }
        }
        
        console.log( `Loaded ${ availableProfiles.length } valid profiles` );
        return availableProfiles;
    }

    private ensureDataStructure(): void {
        if ( !fs.existsSync( this.__personaDir__ ) ) fs.mkdirSync( this.__personaDir__ , { recursive : true });
        if ( !fs.existsSync( this.__profileDir__ ) ) fs.mkdirSync( this.__profileDir__ , { recursive : true });
    }

    private loadProfile( profileID: string ): boolean {
        const profile = this._availableProfiles.find( profile => profile.profileID === profileID );
        if ( !profile ) {
            console.error( `Profile not found '${ profileID }'` );
            return false;
        }
        const persona = this._availablePersonas.find( profile => profile.personaID === profile.personaID );
        if ( !persona ) {
            console.error( `Persona not found '${ profile.personaID }'` );
            return false;
        }

        this.activeProfile = {
            profileID           : profileID,
            userName            : profile.userName,
            lastUsed            : profile.lastUsed,
            createdAt           : profile.createdAt,

            app                 : profile.app,
            handy               : profile.handy,
            persona             : {
                ...persona,
                memories            : profile.memory,
            }
        };
        return true;
    }

    /**
     * Checks if a persona exists by its configured name.
     */
    private personaExists( personaID: string ): boolean {
        if (typeof personaID !== 'string' || personaID.length === 0 ) return false;
        return this._availablePersonas.some( persona => persona.personaID === personaID );
    }

    /**
     * Converts a full profile into the lightweight frontend summary.
     */
    private toPublicProfile( profile: ProfileFileData ): PublicProfile {
        return {
            profileID   : profile.profileID,
            personaID   : profile.personaID,
            userName    : profile.userName,
            lastUsed    : profile.lastUsed,
            createdAt   : profile.createdAt,
            app         : profile.app,
            handy       : profile.handy,
        };
    }

    /**
     * Persists all profile files to disk.
     */
    private saveProfile( profile: ProfileFileData ): void {
        if ( !fs.existsSync( this.__profileDir__ ) ) {
            fs.mkdirSync( this.__profileDir__, { recursive : true } );
        }

        const filePath = path.join( this.__profileDir__, profile.profileID + '.json' );
        fs.writeFileSync( filePath, JSON.stringify( profile, null, 2 ) );
    }

    // ==================== PUBLIC API ====================

    public getPublicProfiles(): PublicProfile[] {
        return this._availableProfiles.map( profile => this.toPublicProfile(profile));
    }

    public getPublicPersonas(): PublicPersona[] {
        return this._availablePersonas.map( persona => {
            return {
                personaID       : persona.personaID,
                name            : persona.name,
                description     : persona.description,
                coreIdentity    : persona.coreIdentity,
                difficulty      : persona.difficulty,
                strictness      : persona.strictness,
            };
        } );
    }

    public activateProfile( profileID: string ): boolean {
        const success = this.loadProfile( profileID );

        if ( success ) {
            this.activeProfile!.lastUsed = new Date().toISOString();
            this.saveActiveProfile();
        }

        return success;
    }

    public saveActiveProfile(): void {
        if ( !this.activeProfile ) return;

        this.saveProfile({
            profileID           : this.activeProfile.profileID,
            personaID           : this.activeProfile.persona.personaID,
            userName            : this.activeProfile.userName,
            createdAt           : this.activeProfile.createdAt,
            lastUsed            : this.activeProfile.lastUsed,
            app                 : { ...this.activeProfile.app },
            handy               : { ...this.activeProfile.handy },
            memory              : { ...this.activeProfile.persona.memories },
        });
    }

    public updateProfile( profileID: string, profile: PublicProfile ): void {
        const profileIndex = this._availableProfiles.findIndex( profile => profile.profileID === profileID );
        if ( profileIndex >= 0 ) {
            throw new Error( 'Profile not found.' );
        }
        if ( !this.personaExists( this._availableProfiles[profileIndex].personaID ) ) {
            throw new Error( 'Persona not found.' );
        }

        this._availableProfiles[profileIndex].app = { ...profile.app };
        this._availableProfiles[profileIndex].handy = { ...profile.handy };
        this.saveProfile( this._availableProfiles[profileIndex] );

        if ( this.activeProfile?.profileID === profileID ) {
            this.activeProfile.app = { ...profile.app };
            this.activeProfile.handy = { ...profile.handy };
        }
    }

    public deleteProfile( profileID: string ): void {
        const existingProfileIndex = this._availableProfiles.findIndex( profile => {
            return profile.profileID === profileID;
        } );

        if ( existingProfileIndex === -1 ) {
            throw new Error( 'Profile not found.' );
        }

        if ( this.activeProfile?.profileID === profileID ) {
            throw new Error( 'Cannot delete active profile.' );
        }
        
        const filePath = path.join( this.__profileDir__, profileID + '.json' );
        if ( fs.existsSync( filePath ) ) {
            fs.rmSync( filePath, { force: true } );
        }

        this._availableProfiles.splice( existingProfileIndex, 1 );
    }

    public createProfile( profile: CreateProfile ): PublicProfile {
        const profileID = profile.profileID?.trim() ?? '';

        if ( typeof profileID !== 'string' || profileID.length === 0 ) {
            throw new Error( 'Profile name is required.' );
        }

        if ( this._availableProfiles.some( existingProfile => existingProfile.profileID === profileID ) ) {
            throw new Error( 'Profile already exists.' );
        }

        if ( !this.personaExists( profile.personaID ) ) {
            throw new Error( 'Persona not found.' );
        }
        const personaConfig = this._availablePersonas.find( p => p.personaID === p.personaID)!;

        const now = new Date().toISOString();

        const newProfile: ProfileFileData = {
            profileID           : profileID,
            personaID           : personaConfig.personaID,
            userName            : profile.userName,
            createdAt           : now,
            lastUsed            : now,

            app                 : { ...profile.app },
            handy               : { ...profile.handy },
            memory              : {},
        };

        this.saveProfile( newProfile );
        this._availableProfiles.push( newProfile );

        return this.toPublicProfile( newProfile );
    }

    // ==================== GETTER ====================

    public get profile(): ActiveProfile | null {
        return this.activeProfile;
    }

    public get publicProfile(): PublicProfile | null {
        if (!this.activeProfile) return null;

        const profile = this._availableProfiles.find( p => p.personaID === this.activeProfile!.profileID );
        if (!profile) return null;

        return this.toPublicProfile( profile );
    }
}

// active configuration types
export interface ActiveProfile {
    profileID           : string;
    userName            : string;
    lastUsed            : string;
    createdAt           : string;

    app                 : AppConfig;
    handy               : HandyConfig;
    persona             : ActivePersona;
}
export interface ActivePersona extends PersonaFileData {
    memories            : PersonaMemory;
}

// public (frontend) configuration types
export interface PublicProfile {
    profileID   : string;
    personaID   : string;
    userName    : string;
    lastUsed    : string;
    createdAt   : string;
    app         : AppConfig;
    handy       : HandyConfig;
}
export interface PublicPersona {
    personaID       : string;
    name            : string;
    description     : string;
    coreIdentity    : string[]; // tone and language rules
    difficulty      : number;
    strictness      : number;
}

// local file data types
interface PersonaFileData {
    personaID           : string;       // filename
    name                : string;       // Display & AI Name
    description         : string;       // Persona Description
    coreIdentity        : string[];     // tone and language rules
    difficulty          : number;       // 1 - 10 >> low value = easy / high value = hard
    strictness          : number;       // 1 - 10 >> low value = easy / high value = hard

    modeConfiguration   : ModeConfiguration;
    modelOptions        : ModelOptions;
}
interface ProfileFileData {
    profileID           : string;
    personaID           : string;
    userName            : string;
    lastUsed            : string;
    createdAt           : string;

    app                 : AppConfig;
    handy               : HandyConfig;
    memory              : PersonaMemory;
}

// sub types
interface AppConfig {
    // placeholder
}

// request types
export interface CreateProfile {
    profileID   : string;
    personaID   : string;
    userName    : string;
    app         : AppConfig;
    handy       : HandyConfig;
}