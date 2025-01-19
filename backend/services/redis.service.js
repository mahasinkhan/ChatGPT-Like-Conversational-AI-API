import Redis from 'ioredis';

const redisClient = new Redis({
  host: process.env.REDIS_HOST,   // Redis server host
  port: process.env.REDIS_PORT,   // Redis server port (default: 6379)
  password: process.env.REDIS_PASSWORD // Optional password if your Redis is password-protected
});

// Automatically connects when the Redis client is created

// Log successful connection
redisClient.on('connect', () => {
  console.log('Successfully connected to Redis');
});

// Handle any connection errors
redisClient.on('error', (err) => {
  console.error('Error connecting to Redis:', err);
});



export default redisClient;