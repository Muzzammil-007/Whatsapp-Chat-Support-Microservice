import Redis from 'ioredis';
import { config } from '../config/environment';


const redisConnectionString = `redis://${config.redis.host}:${config.redis.port}`;

 const redisClient = new Redis(redisConnectionString, {

 //host: config.redis.host, 
  //port: Number(config.redis.port), // Convert port to an integer
  password: config.redis.password,       // Use the password from the config
  connectTimeout: 5000, 
  commandTimeout: 5000,
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
});

/**
 * Count the number of active sessions in Redis
 * @returns {Promise<number>}
 */

export { redisClient };