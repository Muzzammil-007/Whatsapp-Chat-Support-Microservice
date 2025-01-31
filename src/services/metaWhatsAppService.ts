
import axios from 'axios';
import { config } from '../config/environment';

export const sendMessageToMetaApi = async (userPhone: string, message: string) => {
  try {
    const url = `https://graph.facebook.com/${config.metaApiVersion}/${config.metaBusinessId}/messages`;
    const headers = {
      Authorization: `Bearer ${config.metaApiToken}`,
      'Content-Type': 'application/json',
    };

    const payload = {
      messaging_product: 'whatsapp',
      to: userPhone,
      text: { body: message },
    };

    const response = await axios.post(url, payload, { headers });
    console.log(`📤 Sent message to ${userPhone}: ${message}`);
    return response.data;
  } catch (error: any) {
    console.error('Error sending message to Meta API:', error.response?.data || error.message);
    throw new Error('Failed to send message');
  }
};
