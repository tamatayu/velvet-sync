import { Router }               from 'express';
import { container }            from 'tsyringe';
import * as Schema              from '../types/schema';
import { ConfigurationService } from '../services';

const router = Router();
const configurationService = container.resolve( ConfigurationService );

/**
 * Returns all available profile summaries for the startup configuration dialog.
 */
router.get( '/', ( req, res ) => {
    res.json( {
        profiles          : configurationService.getAvailableProfiles(),
        latestProfileName : configurationService.getLatestProfileName(),
    } );
} );

router.post( '/', ( req, res ) => {
    try {
        const payload = Schema.CreateProfileSchema.parse( req.body );
        const profile = configurationService.createProfile( payload );

        res.status( 201 ).json( {
            profile,
        } );
    } catch ( error ) {
        res.status( 400 ).json( {
            error : error instanceof Error
                ? error.message
                : 'Failed to create profile',
        } );
    }
} );

/**
 * Returns the latest used profile name as startup suggestion.
 */
router.get( '/latest', ( req, res ) => {
    res.json( {
        profileName : configurationService.getLatestProfileName(),
    } );
} );

/**
 * Returns the profile that is active for the current backend session.
 */
router.get( '/current', ( req, res ) => {
    const activeProfile = configurationService.profile;

    if ( !activeProfile ) {
        return res.json( {
            profile : null,
        } );
    }

    const profile = configurationService
        .getAvailableProfiles()
        .find( availableProfile => {
            return availableProfile.profileName === activeProfile.profileName;
        } );

    res.json( {
        profile : profile ?? null,
    } );
} );

/**
 * Activates a profile for the current backend session.
 */
router.post( '/:profileName/activate', ( req, res ) => {
    const success = configurationService.activateProfile( req.params.profileName );

    if ( !success ) {
        return res.status( 404 ).json( {
            error : 'Profile not found',
        } );
    }

    const activeProfile = configurationService.profile;

    res.json( {
        success : true,
        profile : activeProfile
            ? {
                profileName : activeProfile.profileName,
                userName    : activeProfile.userConfig.userName,
                persona     : activeProfile.userConfig.persona,
                lastUsed    : activeProfile.appConfig.lastUsed,
                createdAt   : activeProfile.appConfig.createdAt,
            }
            : null,
    } );
} );

router.put( '/:id', ( req, res ) => {
    try {
        const payload = Schema.UpdateProfileSchema.parse( req.body );
        const profile = configurationService.updateProfile( req.params.id, payload );

        if ( !profile ) {
            return res.status( 404 ).json( {
                error : 'Profile not found',
            } );
        }

        res.json( {
            profile,
        } );
    } catch ( error ) {
        res.status( 400 ).json( {
            error : error instanceof Error
                ? error.message
                : 'Failed to update profile',
        } );
    }
} );

router.delete( '/:id', ( req, res ) => {
    try {
        const success = configurationService.deleteProfile( req.params.id );

        if ( !success ) {
            return res.status( 404 ).json( {
                error : 'Profile not found',
            } );
        }

        res.json( {
            success : true,
        } );
    } catch ( error ) {
        res.status( 400 ).json( {
            error : error instanceof Error
                ? error.message
                : 'Failed to delete profile',
        } );
    }
} );


export default router;