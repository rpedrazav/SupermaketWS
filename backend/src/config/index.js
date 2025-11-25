import dotenv from 'dotenv';

dotenv.config();

const config = {
  // Server configuration
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database configuration
  database: {
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/supermarketws',
    // Pool configuration
    max: parseInt(process.env.DB_POOL_MAX) || 20,
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT) || 30000,
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 2000,
  },
  
  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
  
  // API configuration
  api: {
    prefix: '/api',
    version: 'v1',
  },
  
  // Pagination defaults
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },
};

export default config;
