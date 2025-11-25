import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import config from './config/index.js';
import { testConnection, closePool } from './infrastructure/database/index.js';
import apiRouter from './api/routes/index.js';

// Create Express app
const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors(config.cors)); // CORS
app.use(compression()); // Compress responses
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined')); // Logging

// Mount API routes
app.use(config.api.prefix, apiRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'SupermarketWS API',
    version: '1.0.0',
    endpoints: {
      health: `${config.api.prefix}/health`,
      products: `${config.api.prefix}/products`,
      supermarkets: `${config.api.prefix}/supermarkets`,
      prices: `${config.api.prefix}/prices`,
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
});

// Graceful shutdown
const shutdown = async () => {
  console.log('\nShutting down gracefully...');
  try {
    await closePool();
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('Failed to connect to database. Please check your configuration.');
      process.exit(1);
    }

    // Start listening
    app.listen(config.port, () => {
      console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║        SupermarketWS API Server Started           ║
║                                                   ║
║  Environment: ${config.nodeEnv.padEnd(35)}  ║
║  Port:        ${config.port.toString().padEnd(35)}  ║
║  API Prefix:  ${config.api.prefix.padEnd(35)}  ║
║                                                   ║
║  Ready to accept connections!                     ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
      `);
      
      console.log(`📍 Server: http://localhost:${config.port}`);
      console.log(`📍 API: http://localhost:${config.port}${config.api.prefix}`);
      console.log(`📍 Health: http://localhost:${config.port}${config.api.prefix}/health\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;
