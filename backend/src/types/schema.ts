import { z } from 'zod';

export const MinMaxSchema = z
    .object( {
        min : z.number().min( 0 ).max( 100 ),
        max : z.number().min( 0 ).max( 100 ),
    } )
    .refine(
        value => {
            return value.min <= value.max;
        },
        {
            message : 'min must be less than or equal to max',
        },
    );

export const PersonaSchema = z.object( {
    id   : z.string().min( 1 ),
    name : z.string().min( 1 ),
} ).passthrough();

export const PersonaSummarySchema = z.object( {
    id   : z.string().min( 1 ),
    name : z.string().min( 1 ),
} );

export const AppConfigSchema = z.object( {
    lastUsed  : z.string().datetime(),
    createdAt : z.string().datetime(),
} );

export const UserConfigSchema = z.object( {
    userName : z.string().min( 1 ),
    persona  : z.string().min( 1 ),
} );

export const HandyConfigSchema = z.object( {
    apiKey         : z.string(),
    depth          : MinMaxSchema,
    speed          : MinMaxSchema,
    speedOverwrite : z.number().min( 0 ).max( 100 ),
} );

export const PersonaMemorySchema = z.object( {} ).passthrough();

export const GlobalConfigSchema = z.object( {
    activeProfile : z.string(),
} );

export const ProfileSummarySchema = z.object( {
    profileName : z.string().min( 1 ),
    userName    : z.string().min( 1 ),
    persona     : z.string().min( 1 ),
    lastUsed    : z.string().datetime(),
    createdAt   : z.string().datetime(),
} );

export const CreateProfileSchema = z.object( {
    profileName : z.string().min( 1 ),
    userName    : z.string().min( 1 ),
    persona     : z.string().min( 1 ),
} );

export const UpdateProfileSchema = z.object( {
    userName : z.string().min( 1 ).optional(),
    persona  : z.string().min( 1 ).optional(),
} );