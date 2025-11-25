import { Router } from 'express';
import productsRouter from './products.js';
import supermarketsRouter from './supermarkets.js';
import pricesRouter from './prices.js';

const router = Router();

// Mount routers
router.use('/products', productsRouter);
router.use('/supermarkets', supermarketsRouter);
router.use('/prices', pricesRouter);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
