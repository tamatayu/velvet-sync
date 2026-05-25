import { Router }               from 'express';
import { container }            from 'tsyringe';
import { ConfigurationService } from '../services';

const router = Router();
const configurationService = container.resolve( ConfigurationService );

router.get( '/', ( req, res ) => {
    res.json( { profiles : configurationService.getAvailableProfiles() } );
} );

router.get( '/current', ( req, res ) => {
    if ( !configurationService.profile ) {
        res.json( { profile : null } );
    } else {
        const available = configurationService.getAvailableProfiles();
        const current = available.find( profile => profile.profileName === configurationService.profile!.profileName );
        res.json( { profile : current ?? null } );
    }
} );

router.post( '/', ( req, res ) => {
    try {
        const profile = configurationService.createProfile( req.body );
        res.status( 201 ).json( profile );
    } catch ( e ) {
        res.status( 400 ).json( { error : 'Failed to create profile' } );
    }
} );

router.put( '/:id', ( req, res ) => {
    const updated = configurationService.updateProfile( req.params.id, req.body );
    if ( !updated ) return res.status( 404 ).json( { error : 'Profile not found' } );
    res.json( updated );
} );

router.delete( '/:id', ( req, res ) => {
    const success = configurationService.deleteProfile( req.params.id );
    if ( !success ) return res.status( 404 ).json( { error : 'Profile not found' } );
    res.json( { success : true } );
} );

router.post( '/:id/switch', ( req, res ) => {
    const profile = configurationService.activateProfile( req.params.id );
    if ( !profile ) return res.status( 404 ).json( { error : 'Profile not found' } );
    res.json( profile );
} );

export default router;