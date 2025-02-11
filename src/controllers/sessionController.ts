import { Request, Response } from 'express';
import { redisClient } from '../services/redisCLient';

const SESSION_PREFIX = 'user_session:';

/**
 * Get the count of active sessions
 * @param req Express request
 * @param res Express response
 */
export const getActiveSessionCount = async (req: Request, res: Response): Promise<void> => {
  try {
    // Retrieve all keys matching the session prefix
    const sessionKeys = await redisClient.keys(`${SESSION_PREFIX}*`);
    
    // Count the active sessions
    const activeSessionCount = sessionKeys.length;

    console.log(`🔢 Active sessions count: ${activeSessionCount}`);

    res.status(200).json({
      success: true,
      activeSessionCount,
    });
  } catch (error) {
    console.error('❌ Error fetching active session count:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch active session count',
    });
  }
};
