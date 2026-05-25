import {injectable} from 'tsyringe';

export interface StopGoConfig {
    baseDuration: number;                    // z. B. 900 Sekunden (15 Min)
    durationVariance: number;                // Minimum 60 Sekunden
    targetIntensityAtMinDuration: number;    // 75
    intensityDropOnPause: number;            // 25 (%)
    intensityAfterExtension: number;         // 75
    extensionBaseDuration: number;           // 300 Sekunden (5 Min)
    extensionVariance: number;               // 60 Sekunden
    pauseDurationBase: number;               // z. B. 30 Sekunden
}

@injectable()
export class ModeConfigService {
    private stopGoConfig: StopGoConfig = {
        baseDuration                 : 900,                    // 15 Minuten
        durationVariance             : 180,                // ±3 Minuten (Minimum 60s wird erzwungen)
        targetIntensityAtMinDuration : 75,
        intensityDropOnPause         : 25,
        intensityAfterExtension      : 75,
        extensionBaseDuration        : 300,           // 5 Minuten
        extensionVariance            : 60,
        pauseDurationBase            : 30
    };

    getStopGoConfig(): StopGoConfig {
        // Stelle sicher, dass Variance mindestens 60 Sekunden beträgt
        const config = {...this.stopGoConfig};
        if (config.durationVariance < 60) {
            config.durationVariance = 60;
        }
        return config;
    }

    // Später: User-Einstellungen + AI-Anpassungen hier laden
    getDynamicMinDuration(baseDuration: number, variance: number): number {
        const minDuration = baseDuration - variance;
        return Math.max(60, minDuration); // Mindestens 1 Minute
    }
}