import { z } from 'zod';

const ModeConfiguration = z.object({ }).passthrough();

const ModelOptions = z.object({
    temperature    : z.number().min( 0 ).max( 2 ),
    num_predict    : z.number().int().min( 1 ),
    top_p          : z.number().min( 0 ).max( 1 ),
    repeat_penalty : z.number().min( 0 ),
});

const PersonaFileData = z.object({
    personaID           : z.string().min( 1 ),
    name                : z.string().min( 1 ),
    description         : z.string().min( 1 ),
    coreIdentity        : z.array( z.string().min( 1 ) ).min( 1 ),
    difficulty          : z.number().min( 1 ).max( 10 ),
    strictness          : z.number().min( 1 ).max( 10 ),

    modelOptions        : ModelOptions,
    modeConfiguration   : ModeConfiguration,
});


export const Persona = {
    ModelOptions,
    ModeConfiguration,
    PersonaFileData,
}
