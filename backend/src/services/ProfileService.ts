import { injectable } from 'tsyringe';
import fs from 'node:fs';
import path from 'node:path';

export interface Profile {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'non-binary';
  personaId: string;
  createdAt: string;
  lastUsed: string;
}

@injectable()
export class ProfileService {
  private readonly profilesFile: string;
  private profiles: Map<string, Profile> = new Map();
  private currentProfileId: string | null = null;

  constructor() {
    this.profilesFile = path.resolve('data/profiles.json');
    this.loadProfiles();
  }

  private loadProfiles() {
    try {
      if (fs.existsSync(this.profilesFile)) {
        const data = JSON.parse(fs.readFileSync(this.profilesFile, 'utf8'));
        data.profiles?.forEach((p: Profile) => this.profiles.set(p.id, p));
        this.currentProfileId = data.currentProfileId || null;
      }
    } catch (e) {
      console.warn('[ProfileService] Could not load profiles');
    }
  }

  private saveProfiles() {
    try {
      const dir = path.dirname(this.profilesFile);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const data = {
        currentProfileId: this.currentProfileId,
        profiles: Array.from(this.profiles.values())
      };
      fs.writeFileSync(this.profilesFile, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('[ProfileService] Failed to save profiles');
    }
  }

  getAllProfiles(): Profile[] {
    return Array.from(this.profiles.values());
  }

  getCurrentProfile(): Profile | null {
    if (!this.currentProfileId) return null;
    return this.profiles.get(this.currentProfileId) || null;
  }

  createProfile(data: { name: string; gender: 'male' | 'female' | 'non-binary'; personaId: string }): Profile {
    const profile: Profile = {
      id: 'profile-' + Date.now(),
      name: data.name,
      gender: data.gender,
      personaId: data.personaId,
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString()
    };

    this.profiles.set(profile.id, profile);
    this.currentProfileId = profile.id;
    this.saveProfiles();

    return profile;
  }

  switchProfile(profileId: string): Profile | null {
    const profile = this.profiles.get(profileId);
    if (!profile) return null;

    this.currentProfileId = profileId;
    profile.lastUsed = new Date().toISOString();
    this.saveProfiles();

    return profile;
  }

  deleteProfile(profileId: string): boolean {
    if (!this.profiles.has(profileId)) return false;

    this.profiles.delete(profileId);

    if (this.currentProfileId === profileId) {
      // Switch to first available profile or null
      this.currentProfileId = this.profiles.size > 0 
        ? Array.from(this.profiles.keys())[0] 
        : null;
    }

    this.saveProfiles();
    return true;
  }

  updateProfile(profileId: string, updates: Partial<Profile>): Profile | null {
    const profile = this.profiles.get(profileId);
    if (!profile) return null;

    Object.assign(profile, updates);
    profile.lastUsed = new Date().toISOString();
    this.saveProfiles();

    return profile;
  }
}