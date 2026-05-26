import { Router }               from 'express';
import { container }            from 'tsyringe';
import { Request }              from '../schema';
import { ConfigurationService } from '../services';

const router = Router();
const configurationService = container.resolve( ConfigurationService );

/**
 * Returns all available profile summaries for the startup configuration dialog.
 */
router.get( '/', ( req, res ) => {
    res.json({
        profiles          : configurationService.getPublicProfiles(),
    });
} );

router.post( '/', ( req, res ) => {
    try {
        const payload = Request.Profile.Create.parse( req.body );
        const profile = configurationService.createProfile( payload );

        res.status( 201 ).json( {
            profile,
        } );
    } catch ( error ) {
        res.status( 400 ).json({
            error : error instanceof Error
                ? error.message
                : 'Failed to create profile',
        });
    }
});

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
        .getPublicProfiles()
        .find( availableProfile => {
            return availableProfile.profileID === activeProfile.profileID;
        } );

    res.json({
        profile : profile ?? null,
    });
});

/**
 * Activates a profile for the current backend session.
 */
router.post( '/:profileID/activate', ( req, res ) => {
    const success = configurationService.activateProfile( req.params.profileID );

    if ( !success ) {
        return res.status( 404 ).json( {
            error : 'Profile not found',
        } );
    }
    res.json({
        success : true,
        profile : configurationService.publicProfile,
    });
});

router.put( '/:id', ( req, res ) => {
    try {
        const payload = Request.Profile.Update.parse( req.body );
        configurationService.updateProfile( req.params.id, payload );

        res.json({ success : true });
    } catch ( error ) {
        res.status( 400 ).json({
            error : error instanceof Error
                ? error.message
                : 'Failed to update profile',
        });
    }
});

router.delete( '/:id', ( req, res ) => {
    try {
        configurationService.deleteProfile( req.params.id );
        res.json({ success : true });
    } catch ( error ) {
        res.status( 400 ).json( {
            error : error instanceof Error
                ? error.message
                : 'Failed to delete profile',
        } );
    }
});


export default router;