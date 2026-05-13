import { Router } from 'express';

const router = Router();

// Save user settings (for now just log + return success)
router.post('/settings', (req, res) => {
  const { name, gender, description, activePersona } = req.body;
  
  console.log('[User Settings Saved]', { name, gender, description, activePersona });
  
  // In future: save to database per user/session
  res.json({ 
    success: true, 
    message: 'Settings saved',
    settings: { name, gender, description, activePersona }
  });
});

export default router;