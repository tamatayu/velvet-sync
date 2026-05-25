export interface ProfileSummary {
    profileName: string;
    userName: string;
    persona: string;
    lastUsed: string;
    createdAt: string;
}

export interface CreateProfile {
    profileName: string;
    userName: string;
    persona: string;
}

export interface FullProfile {
    profileName: string;
    appConfig: AppConfig;
    userConfig: UserConfig;
    handyConfig: HandyConfig;
    personaConfig: PersonaConfig;
    personaMemory: PersonaMemory;
}

export interface AppConfig {
    lastUsed: string;
    createdAt: string;
}

export interface UserConfig {
    userName: string;
    persona: string;
}

export interface PersonaMemory {}

export interface GlobalConfig {
    activeProfile: string;
}

export interface HandyConfig {
    apiKey: string;
    depth: MinMax;
    speed: MinMax;
    speedOverwrite: number;
}

export interface PersonaConfig {
    id: string;
    name: string;
}

export interface PersonaSummary {
    id: string;
    name: string;
}

type MinMax = {
    min: number;
    max: number;
};