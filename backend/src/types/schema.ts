import { z } from 'zod';

export const PersonaSchema = z.object( {
    id   : z.string(),
    name : z.string(),
} );

export const AppConfigSchema = z.object( {
    lastUsed  : z.string().datetime(),
    createdAt : z.string().datetime(),
} );

export const UserConfigSchema = z.object( {
    userName : z.string(),
    persona  : z.string(),
    // language   : z.string(),
    // stopAndGo  : z.object( {
    //     baseDuration     : z.number().min( 60 ),
    //     durationVariance : z.number().min( 0 ),
    //     // ... weitere Stop&Go Einstellungen
    // } ).optional(),
    // // weitere User-Einstellungen
} );

export const PersonaMemorySchema = z.object( {
    shortTermMemory : z.array( z.any() ).default( [] ),
    longTermFacts   : z.array( z.any() ).default( [] ),
    lastInteraction : z.string().datetime(),
} );

export const HandyConfigSchema = z.object( {
    apiKey         : z.string(),
    depth          : z.object( {
        min : z.number().min( 0 ).max( 100 ),
        max : z.number().min( 0 ).max( 100 ),
    } ),
    speed          : z.object( {
        min : z.number().min( 0 ).max( 100 ),
        max : z.number().min( 0 ).max( 100 ),
    } ),
    speedOverwrite : z.number().min( 0 ).max( 100 ),
} );