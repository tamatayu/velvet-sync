import { Router } from 'express';
import { container } from 'tsyringe';
import { ChatService } from '../services';
import { MemoryService } from '../services/MemoryService';

const router = Router();
const chatService = container.resolve(ChatService);
const memoryService = container.resolve(MemoryService);

// End session + final summary
router.post('/:id/end', async (req, res) => {
  const sessionId = req.params.id;
  
  try {
    // Final summarization
    const summary = await memoryService.summarizeSession(sessionId);
    
    // Clear session
    await chatService.clearSession(sessionId);
    
    res.json({
      success: true,
      finalSummary: summary
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to end session' });
  }
});

// Shutdown entire server (user is finished)
router.post('/shutdown', (req, res) => {
  res.json({ success: true, message: 'Server shutting down...' });
  
  // Give time for response to be sent
  setTimeout(() => {
    console.log('🔴 Server shutdown requested by user');
    process.exit(0);
  }, 500);
});

export default router;