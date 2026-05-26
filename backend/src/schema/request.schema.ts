import { z }                from 'zod';
import { Profile }          from './profil.schema';

const CreateProfile = z.object({
    profileID   : z.string().min( 1 ),
    personaID   : z.string().min( 1 ),
    userName    : z.string().min( 1 ),
    app         : Profile.AppProfile,
    handy       : Profile.HandyProfile,
});

const UpdateProfile = Profile.PublicProfile;

export const Request = {
    Profile: {
        Create: CreateProfile,
        Update: UpdateProfile,
    }
};