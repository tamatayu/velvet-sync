import { MinMax } from './global.types';

export interface HandyConfig {
    apiKey          : string;
    depth           : MinMax;           // 0 - 100
    speed           : MinMax;           // 0 - 100
    speedOverwrite  : number;           // speed + speedOverwrite caps at 100
}