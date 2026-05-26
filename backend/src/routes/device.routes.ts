import { Router }        from 'express';
import { container }     from 'tsyringe';
import { DeviceService } from '../services';

const router = Router();
const deviceService = container.resolve( DeviceService );


router.get('/test', async (req, res) => {
    const apiKey = typeof req.body?.apiKey === 'string'
        ? req.body.apiKey.trim()
        : '';

    if ( !apiKey ) {
        return res.status( 400 ).json( {
            error : 'API Key is required for device availability check!',
        } );
    }

    try {

        const success = await deviceService.init( apiKey );
        res.json( { success } );

    } catch ( error ) {
        const message = error instanceof Error
            ? error.message
            : 'Unexpected error during device initialization!';
        res.status( 500 ).json( { error : message } );
    }
});

export default router;