import dotenv from 'dotenv';

dotenv.config();

export const config = {

    redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },

  port: process.env.PORT || 3000,
  metaApiToken: process.env.META_API_TOKEN ,
  metaApiVersion:process.env.META_API_VERSION , // Make it configurable
  metaBusinessId: process.env.META_BUSINESS_ID , 
  grpcServerUrl: process.env.GRPC_SERVER_URL
 
};
