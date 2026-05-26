import { Router }    from 'express';
import { container } from 'tsyringe';

import { ConfigurationService } from '../services';

const router = Router();
const configurationService = container.resolve( ConfigurationService );

/**
 * Returns all available persona summaries for the startup configuration dialog.
 */
router.get( '/', ( req, res ) => {
    res.json( {
        personas : configurationService.getPublicPersonas(),
    } );
} );

/**
 * Returns a single persona summary by id.
 */
router.get( '/:id', ( req, res ) => {
    const persona = configurationService
        .getPublicPersonas()
        .find( availablePersona => {
            return availablePersona.personaID === req.params.id;
        } );

    if ( !persona ) {
        return res.status( 404 ).json( {
            error : 'Persona not found',
        } );
    }

    res.json( {
        persona,
    } );
} );

export default router;