import Redis from 'ioredis';

const redisClient = new Redis({
  host: '127.0.0.1', // Replace with your Redis server's host
  port: 6379,        // Replace with your Redis server's port
  password: undefined, // Add password if your Redis instance requires authentication
  connectTimeout: 5000, // 5-second timeout for connection
  commandTimeout: 5000, 
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
});

export default redisClient;
