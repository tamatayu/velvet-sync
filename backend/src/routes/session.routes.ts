import { Router }    from 'express';
import { container } from 'tsyringe';

import { ChatService } from '../services';

const router = Router();
const chatService = container.resolve( ChatService );

/**
 * Ends a chat session and clears its in-memory history.
 */
router.post( '/:id/end', async ( req, res ) => {
    const sessionId = req.params.id;

    try {
        await chatService.clearSession( sessionId );

        res.json( {
            success : true,
            sessionId,
        } );
    } catch ( error ) {
        res.status( 500 ).json( {
            error : 'Failed to end session.',
        } );
    }
} );

/**
 * Shutdown entire server after the user has finished the session.
 */
router.post( '/shutdown', ( req, res ) => {
    res.json( {
        success : true,
        message : 'Server shutting down...',
    } );

    setTimeout( () => {
        console.log( 'Server shutdown requested by user' );
        process.exit( 0 );
    }, 500 );
} );

export default router;