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

export const PersonaResponseFormatSchema = z.object( {
    type              : z.enum( [
        'text',
        'json'
    ] ).default( 'text' ),
    schemaDescription : z.string().optional(),
} );

export const ModelOptionsSchema = z.object( {
    temperature    : z.number().min( 0 ).max( 2 ).optional(),
    num_predict    : z.number().int().min( 1 ).optional(),
    top_p          : z.number().min( 0 ).max( 1 ).optional(),
    repeat_penalty : z.number().min( 0 ).optional(),
} );

export const PersonaSchema = z.object( {
    id             : z.string().min( 1 ),
    name           : z.string().min( 1 ),
    description    : z.string().optional(),
    systemPrompt   : z.string().min( 1 ),
    responseFormat : PersonaResponseFormatSchema.optional(),
    modelOptions   : ModelOptionsSchema.optional(),
} );

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