import fs                                                   from 'fs';
import path                                                 from 'path';
import { z }                                                from 'zod';
import { FullProfile, ProfileSummary }                      from '../types/config.types';
import { AppConfig, GlobalConfig, HandyConfig, UserConfig } from '../types/config.types';
import { PersonaConfig, PersonaMemory, PersonaSummary }     from '../types/config.types';
import { CreateProfile }                                    from '../types/config.types';
import * as Schema                                          from '../types/schema';
import { injectable }                                       from 'tsyringe';

@injectable()
export class ConfigurationService {
    private readonly __dataDir__: string;
    private readonly __configPath__: string;

    private _globalConfig: GlobalConfig;
    private _availablePersonas: PersonaConfig[];
    private _availableProfiles: FullProfile[];

    private activeProfile: FullProfile | null = null;

    constructor() {
        this.__dataDir__ = path.join( __dirname, '../../data' );
        this.__configPath__ = path.join( this.__dataDir__, 'configuration.json' );

        this.ensureDataStructure();

        this._globalConfig = this.loadGlobalConfig();
        this._availablePersonas = this.loadAvailablePersonas();
        this._availableProfiles = this.loadAvailableProfiles();
    }

    private loadGlobalConfig(): GlobalConfig {
        const raw = fs.readFileSync( this.__configPath__, 'utf-8' );
        return Schema.GlobalConfigSchema.parse( JSON.parse( raw ) );
    }

    private loadAvailablePersonas(): PersonaConfig[] {
        const personaDir = path.join( this.__dataDir__, 'persona' );
        const availablePersonas: PersonaConfig[] = [];

        if ( !fs.existsSync( personaDir ) ) {
            console.warn( 'Persona directory does not exist' );
            return [];
        }

        const files = fs.readdirSync( personaDir ).filter( file => file.endsWith( '.json' ) );

        for ( const file of files ) {
            try {
                const filePath = path.join( personaDir, file );
                const raw = fs.readFileSync( filePath, 'utf-8' );
                const data = JSON.parse( raw );

                const validated = Schema.PersonaSchema.parse( data );

                availablePersonas.push( validated );
            } catch ( error ) {
                console.warn( `Invalid persona skipped: ${ file }`, error instanceof z.ZodError ? error.errors : error );
                // Datei wird stillschweigend ignoriert
            }
        }

        console.log( `Loaded ${ availablePersonas.length } valid personas` );
        return availablePersonas;
    }

    private loadAvailableProfiles(): FullProfile[] {
        const profileRootDir = path.join( this.__dataDir__, 'profile' );
        const availableProfiles: FullProfile[] = [];

        if ( !fs.existsSync( profileRootDir ) ) {
            console.warn( 'Profile directory does not exist' );
            return [];
        }

        const profileFolders = fs.readdirSync( profileRootDir ).filter( folder =>
            fs.statSync( path.join( profileRootDir, folder ) ).isDirectory()
        );

        for ( const folder of profileFolders ) {
            try {
                const profileDir = path.join( profileRootDir, folder );

                const appConfigRaw = fs.readFileSync( path.join( profileDir, 'appConfig.json' ), 'utf-8' );
                const appConfig = Schema.AppConfigSchema.parse( JSON.parse( appConfigRaw ) );

                const userConfigRaw = fs.readFileSync( path.join( profileDir, 'userConfig.json' ), 'utf-8' );
                const userConfig = Schema.UserConfigSchema.parse( JSON.parse( userConfigRaw ) );

                const handyConfigRaw = fs.readFileSync( path.join( profileDir, 'handyConfig.json' ), 'utf-8' );
                const handyConfig = Schema.HandyConfigSchema.parse( JSON.parse( handyConfigRaw ) );

                const personaMemoryRaw = fs.readFileSync( path.join( profileDir, 'personaMemory.json' ), 'utf-8' );
                const personaMemory = Schema.PersonaMemorySchema.parse( JSON.parse( personaMemoryRaw ) );

                const persona = this._availablePersonas.find( persona => persona.name === userConfig.persona );
                if ( !persona ) {
                    console.warn( `Invalid profile skipped: '${ folder }', persona '${ userConfig.persona }' not found!` );
                    continue;
                }

                availableProfiles.push( {
                    profileName   : folder,
                    personaConfig : persona,
                    appConfig,
                    userConfig,
                    handyConfig,
                    personaMemory
                } );
            } catch ( error ) {
                console.warn( `Invalid profile skipped: '${ folder }'`, error instanceof z.ZodError ? error.errors : error );
            }
        }

        console.log( `Loaded ${ availableProfiles.length } valid profiles` );
        return availableProfiles;
    }

    private ensureDataStructure() {
        // Erstellt alle notwendigen Ordner und Default-Dateien
        if ( !fs.existsSync( this.__dataDir__ ) ) fs.mkdirSync( this.__dataDir__, { recursive : true } );
        if ( !fs.existsSync( path.join( this.__dataDir__, 'persona' ) ) ) fs.mkdirSync( path.join( this.__dataDir__, 'persona' ) );
        if ( !fs.existsSync( path.join( this.__dataDir__, 'profile' ) ) ) fs.mkdirSync( path.join( this.__dataDir__, 'profile' ) );

        if ( !fs.existsSync( this.__configPath__ ) ) {
            this.createDefaultGlobalConfig();
        }
    }

    private createDefaultGlobalConfig(): void {
        const defaultConfig: GlobalConfig = {
            activeProfile : 'default',
        };
        fs.writeFileSync( this.__configPath__, JSON.stringify( defaultConfig, null, 2 ) );
    }

    private saveGlobalConfig(): void {
        fs.writeFileSync(
            this.__configPath__,
            JSON.stringify( this._globalConfig, null, 2 )
        );
    }

    private loadProfile( profileName: string ): boolean {
        const profile = this._availableProfiles.find( profile => profile.profileName === profileName );
        if ( !profile ) {
            console.error( `Profile not found '${ profileName }'` );
            return false;
        }
        this.activeProfile = profile;
        return true;
    }

    private getProfileDir( profileName: string ): string {
        return path.join( this.__dataDir__, 'profile', profileName );
    }

    /**
     * Checks if a persona exists by its configured name.
     */
    private personaExists( personaName: string ): boolean {
        return this._availablePersonas.some( persona => {
            return persona.name === personaName;
        } );
    }

    /**
     * Converts a full profile into the lightweight frontend summary.
     */
    private toProfileSummary( profile: FullProfile ): ProfileSummary {
        return {
            profileName : profile.profileName,
            userName    : profile.userConfig.userName,
            persona     : profile.userConfig.persona,
            lastUsed    : profile.appConfig.lastUsed,
            createdAt   : profile.appConfig.createdAt,
        };
    }

    /**
     * Persists all profile files to disk.
     */
    private saveProfile( profile: FullProfile ): void {
        const profileDir = this.getProfileDir( profile.profileName );

        if ( !fs.existsSync( profileDir ) ) {
            fs.mkdirSync( profileDir, { recursive : true } );
        }

        fs.writeFileSync( path.join( profileDir, 'appConfig.json' ), JSON.stringify( profile.appConfig, null, 2 ) );
        fs.writeFileSync( path.join( profileDir, 'userConfig.json' ), JSON.stringify( profile.userConfig, null, 2 ) );
        fs.writeFileSync( path.join( profileDir, 'handyConfig.json' ), JSON.stringify( profile.handyConfig, null, 2 ) );
        fs.writeFileSync( path.join( profileDir, 'personaMemory.json' ), JSON.stringify( profile.personaMemory, null, 2 ) );
    }

    // ==================== PUBLIC API ====================

    public getLatestProfileName(): string {
        return this._globalConfig.activeProfile;
    }

    public getAvailableProfiles(): ProfileSummary[] {
        return this._availableProfiles.map( profile => {
            return {
                profileName : profile.profileName,
                userName    : profile.userConfig.userName,
                persona     : profile.userConfig.persona,
                lastUsed    : profile.appConfig.lastUsed,
                createdAt   : profile.appConfig.createdAt,
            };
        } );
    }

    public getAvailablePersonas(): PersonaSummary[] {
        return this._availablePersonas.map( persona => {
            return {
                id   : persona.id,
                name : persona.name,
            };
        } );
    }

    public activateProfile( profileName: string ): boolean {
        const success = this.loadProfile( profileName );

        if ( success ) {
            this._globalConfig.activeProfile = profileName;
            this.activeProfile!.appConfig.lastUsed = new Date().toISOString();

            this.saveGlobalConfig();
            this.saveActiveProfile();
        }

        return success;
    }

    public saveActiveProfile(): void {
        if ( !this.activeProfile ) return;

        this.saveProfile( this.activeProfile );
    }

    public updateProfile( profileName: string, profile: Partial<ProfileSummary> ): ProfileSummary | null {
        const existingProfile = this._availableProfiles.find( availableProfile => {
            return availableProfile.profileName === profileName;
        } );

        if ( !existingProfile ) {
            return null;
        }

        if ( profile.persona !== undefined ) {
            if ( !this.personaExists( profile.persona ) ) {
                throw new Error( 'Persona not found.' );
            }

            const personaConfig = this._availablePersonas.find( persona => {
                return persona.name === profile.persona;
            } )!;

            existingProfile.userConfig.persona = profile.persona;
            existingProfile.personaConfig = personaConfig;
        }

        if ( profile.userName !== undefined ) {
            existingProfile.userConfig.userName = profile.userName.trim();
        }

        this.saveProfile( existingProfile );

        if ( this.activeProfile?.profileName === profileName ) {
            this.activeProfile = existingProfile;
        }

        return this.toProfileSummary( existingProfile );
    }

    public deleteProfile( profileName: string ): boolean {
        const existingProfileIndex = this._availableProfiles.findIndex( profile => {
            return profile.profileName === profileName;
        } );

        if ( existingProfileIndex === -1 ) {
            return false;
        }

        if ( this.activeProfile?.profileName === profileName ) {
            throw new Error( 'Cannot delete active profile.' );
        }

        const profileDir = this.getProfileDir( profileName );

        if ( fs.existsSync( profileDir ) ) {
            fs.rmSync( profileDir, {
                recursive : true,
                force     : true,
            } );
        }

        this._availableProfiles.splice( existingProfileIndex, 1 );

        if ( this._globalConfig.activeProfile === profileName ) {
            this._globalConfig.activeProfile = this._availableProfiles[0]?.profileName ?? '';
            this.saveGlobalConfig();
        }

        return true;
    }

    public createProfile( profile: CreateProfile ): ProfileSummary {
        const profileName = profile.profileName.trim();

        if ( !profileName ) {
            throw new Error( 'Profile name is required.' );
        }

        if ( this._availableProfiles.some( existingProfile => existingProfile.profileName === profileName ) ) {
            throw new Error( 'Profile already exists.' );
        }

        if ( !this.personaExists( profile.persona ) ) {
            throw new Error( 'Persona not found.' );
        }

        const personaConfig = this._availablePersonas.find( persona => {
            return persona.name === profile.persona;
        } )!;

        const now = new Date().toISOString();

        const newProfile: FullProfile = {
            profileName,
            appConfig     : {
                createdAt : now,
                lastUsed  : now,
            },
            userConfig    : {
                userName : profile.userName.trim(),
                persona  : profile.persona,
            },
            handyConfig   : {
                apiKey         : '',
                depth          : {
                    min : 0,
                    max : 100
                },
                speed          : {
                    min : 0,
                    max : 100
                },
                speedOverwrite : 0,
            },
            personaConfig,
            personaMemory : {},
        };

        this.saveProfile( newProfile );
        this._availableProfiles.push( newProfile );

        return this.toProfileSummary( newProfile );
    }

    // ==================== GETTER ====================

    public get profile(): FullProfile | null {
        return this.activeProfile;
    }

    public get appConfig(): AppConfig | null {
        return this.activeProfile?.appConfig || null;
    }

    public get userConfig(): UserConfig | null {
        return this.activeProfile?.userConfig || null;
    }

    public get handyConfig(): HandyConfig | null {
        return this.activeProfile?.handyConfig || null;
    }

    public get personaConfig(): PersonaConfig | null {
        return this.activeProfile?.personaConfig ?? null;
    }

    public get personaMemory(): PersonaMemory | null {
        return this.activeProfile?.personaMemory ?? null;
    }
}