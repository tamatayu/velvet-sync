import { Router }    from 'express';
import { container } from 'tsyringe';

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


export default router;