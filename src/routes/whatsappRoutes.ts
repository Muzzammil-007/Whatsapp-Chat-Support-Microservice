import { Router } from 'express';
import { handleIncomingMessage, verifyWebhook } from '../controllers/whatsappController';
import { getActiveSessionCount } from '../controllers/sessionController';

const router = Router();

// Webhook Verification for Meta
router.get('/webhook', verifyWebhook);

// Incoming WhatsApp Messages
router.post('/webhook', handleIncomingMessage);

router.get('/active-sessions', getActiveSessionCount); // New endpoint for active sessions


export default router;
