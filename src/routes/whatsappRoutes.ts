import { Router } from 'express';
import { handleIncomingMessage, verifyWebhook } from '../controllers/whatsappController';

const router = Router();

// Webhook Verification for Meta
router.get('/webhook', verifyWebhook);

// Incoming WhatsApp Messages
router.post('/webhook', handleIncomingMessage);

export default router;
