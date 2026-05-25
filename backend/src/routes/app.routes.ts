import { Router } from 'express';

const router = Router();

router.get('/status', (req, res) => {
    res.json({
        server: 'VelvetSync',
        version: '2.0.0',
        services: {
            ollama: 'connected',
            handy: 'disconnected'
        }
    });
});

router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
export default router;