import { z }        from 'zod';
import { Util }    from './util.schema';

const AppProfile = z.object({}).passthrough();

const HandyProfile = z.object({
    apiKey         : z.string().min( 1 ),
    depth          : Util.MinMax,
    speed          : Util.MinMax,
    speedOverwrite : z.number().min( 0 ).max( 100 ),
});

const MemoryProfile= z.object({}).passthrough();

const ProfileFileData = z.object({
    profileID       : z.string().min( 1 ),
    personaID       : z.string().min( 1 ),
    userName        : z.string().min( 1 ),
    lastUsed        : z.string().datetime(),
    createdAt       : z.string().datetime(),

    app             : AppProfile,
    handy           : HandyProfile,
    memory          : MemoryProfile,
});

const PublicProfile = z.object({
    profileID       : z.string().min( 1 ),
    personaID       : z.string().min( 1 ),
    userName        : z.string().min( 1 ),
    lastUsed        : z.string().datetime(),
    createdAt       : z.string().datetime(),

    app             : AppProfile,
    handy           : HandyProfile,
});


export const Profile = {
    AppProfile,
    HandyProfile,
    MemoryProfile,
    ProfileFileData,
    PublicProfile,
}
