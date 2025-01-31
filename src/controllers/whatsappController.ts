import { Request, Response } from 'express';
import { getTicketStatus } from '../services/grpcHandler'; // Fetch ticket status from gRPC
import { sendMessageToMetaApi } from '../services/metaWhatsAppService';
import redisClient from '../services/redisCLient';

const SESSION_PREFIX = 'user_session:';

interface IncomingMessage {
  userPhone: string;
  message: string;
}

interface UserSession {
  step?: string;
  ticketID?: string;
}

// ✅ 1️⃣ Webhook Verification for Meta (Needed for Setup)
export const verifyWebhook = (req: Request, res: Response): void => {
  const VERIFY_TOKEN = 'secret-token'; // Replace with actual token

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('📢 Webhook Verified by Meta');
    res.status(200).send(challenge);
  } else {
    console.warn('❌ Webhook Verification Failed');
    res.sendStatus(403);
  }
};

// ✅ 2️⃣ Handling Incoming WhatsApp Messages
export const handleIncomingMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📥 Incoming Webhook:', JSON.stringify(req.body, null, 2)); // Debugging

    // Extract WhatsApp message data
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const messageObject = changes?.value?.messages?.[0];
    const statusObject = changes?.value?.statuses?.[0];

    if (statusObject) {
      console.log('✅ Delivery Status Update:', JSON.stringify(statusObject, null, 2));
      res.status(200).send('EVENT_RECEIVED');
      return;
    }

    if (!messageObject) {
      console.warn('⚠️ No valid message received from Meta.');
      res.status(200).send('EVENT_RECEIVED'); // Acknowledge the webhook
      return;
    }

    const userPhone = messageObject.from; // Sender's phone number
    const message = messageObject.text?.body?.trim(); // Message text

    if (!userPhone || !message) {
      console.warn('⚠️ Invalid request: Missing userPhone or message.');
      res.status(200).send('EVENT_RECEIVED'); // Acknowledge Meta's request
      return;
    }

    console.log(`📩 Message from ${userPhone}: ${message}`);

    // Redis: Get session data
    const sessionKey = `${SESSION_PREFIX}${userPhone}`;
    let session: UserSession = { step: undefined, ticketID: undefined };

    try {
      const sessionData = await redisClient.get(sessionKey);
      if (sessionData) session = JSON.parse(sessionData);
    } catch (redisError) {
      console.error('🚨 Redis error:', redisError);
    }

    // 🛑 Handle "exit" Command
    if (message.toLowerCase() === 'exit') {
      await redisClient.del(sessionKey); // Remove session
      await sendMessageToMetaApi(userPhone, '👋 Thank you for using Ajeek! Have a great day.');
      res.status(200).send('EVENT_RECEIVED');
      return;
    }

    // 🟢 Step 1: New User → Show Menu
    if (!session.step || session.step === 'completed') {
      session.step = 'welcome';
      await redisClient.set(sessionKey, JSON.stringify(session), 'EX', 3600); // Set session expiry

      await sendMessageToMetaApi(
        userPhone,
        `👋 Welcome to Ajeek!\n\nSelect an option:\n1️⃣ Check ticket status`
      );

      res.status(200).json({ success: true });
      return;
    }

    // 🟡 Step 2: Awaiting User Selection
    if (session.step === 'welcome') {
      if (message === '1') {
        session.step = 'awaiting_ticket_id';
        await redisClient.set(sessionKey, JSON.stringify(session), 'EX', 3600);

        await sendMessageToMetaApi(userPhone, '📌 Please provide your Ticket ID.');
      } else {
        await sendMessageToMetaApi(userPhone, '❌ Invalid option. Type "1" to check ticket status.');
      }

      res.status(200).json({ success: true });
      return;
    }

    // 🔴 Step 3: Awaiting Ticket ID
    if (session.step === 'awaiting_ticket_id') {
      if (!/^\d+$/.test(message)) {
        await sendMessageToMetaApi(userPhone, '⚠️ Invalid Ticket ID. Please enter a numeric Ticket ID.');
        res.status(200).json({ success: true });
        return;
      }

      session.ticketID = message;
      session.step = 'completed';
      await redisClient.set(sessionKey, JSON.stringify(session), 'EX', 3600);

      try {
        // Fetch ticket status via gRPC
        console.log(`🔍 Fetching status for Ticket ID: ${session.ticketID}`);
        const ticketStatus = await getTicketStatus(session.ticketID);

        if (ticketStatus?.status) {
          await sendMessageToMetaApi(userPhone, `📄 Your ticket status: *${ticketStatus.status}*`);
        } else {
          await sendMessageToMetaApi(userPhone, '⚠️ No status found for this Ticket ID. Please check and try again.');
        }

        // ✅ Reset session for new interactions
        session.step = 'completed'; // Keep it completed
        await redisClient.set(sessionKey, JSON.stringify(session), 'EX', 3600);

        await sendMessageToMetaApi(
          userPhone,
          `🔄 Do you want to check another ticket?\nType "1" to continue or "exit" to end the session.`
        );

      } catch (error) {
        console.error('❌ Error fetching ticket status:', error);
        await sendMessageToMetaApi(userPhone, '⚠️ Unable to retrieve ticket status. Please try again later.');
      }

      res.status(200).send('EVENT_RECEIVED');
      return;
    }

  } catch (error) {
    console.error('🚨 Unexpected Error:', error instanceof Error ? error.message : error);
    res.status(500).json({ success: false, error: 'An unknown error occurred.' });
  }
};

