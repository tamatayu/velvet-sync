import { Router }    from 'express';
import { container } from 'tsyringe';

import { ChatService } from '../services';

const router = Router();
const chatService = container.resolve( ChatService );

/**
 * Sends a chat message through the HTTP fallback endpoint.
 */
router.post( '/:sessionId/message', async ( req, res ) => {
    const sessionId = req.params.sessionId;
    const content = typeof req.body?.content === 'string'
        ? req.body.content.trim()
        : '';

    if ( !content ) {
        return res.status( 400 ).json( {
            error : 'Message content is required.',
        } );
    }

    try {
        const response = await chatService.sendUserMessage( sessionId, content );

        res.json( {
            sessionId,
            message : response.message,
        } );
    } catch ( error ) {
        const message = error instanceof Error
            ? error.message
            : 'Failed to process message.';

        res.status(
            message.includes( 'No active profile' )
                ? 409
                : 500,
        ).json( {
            error : message,
        } );
    }
} );

/**
 * Returns the current message history for a chat session.
 */
router.get( '/:sessionId/history', async ( req, res ) => {
    const messages = await chatService.getHistory( req.params.sessionId );

    res.json( {
        sessionId : req.params.sessionId,
        messages,
    } );
} );

/**
 * Clears the current message history for a chat session.
 */
router.delete( '/:sessionId', async ( req, res ) => {
    await chatService.clearSession( req.params.sessionId );

    res.json( {
        success   : true,
        sessionId : req.params.sessionId,
    } );
} );

export default router;