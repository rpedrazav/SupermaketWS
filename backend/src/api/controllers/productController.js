import { ProductRepository } from '../../infrastructure/repositories/ProductRepository.js';
import { PriceRepository } from '../../infrastructure/repositories/PriceRepository.js';

const productRepo = new ProductRepository();
const priceRepo = new PriceRepository();

export class ProductController {
  // GET /api/products - List all products
  async list(req, res) {
    try {
      const { 
        limit = 20, 
        offset = 0, 
        supermarketId, 
        category, 
        isAvailable 
      } = req.query;

      const products = await productRepo.findAll({
        limit: Math.min(parseInt(limit), 100),
        offset: parseInt(offset),
        supermarketId,
        category,
        isAvailable: isAvailable !== undefined ? isAvailable === 'true' : undefined,
      });

      const total = await productRepo.count({
        supermarketId,
        category,
        isAvailable: isAvailable !== undefined ? isAvailable === 'true' : undefined,
      });

      res.json({
        success: true,
        data: products,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: total > parseInt(offset) + products.length,
        },
      });
    } catch (error) {
      console.error('Error listing products:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch products',
        message: error.message,
      });
    }
  }

  // GET /api/products/:id - Get product by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const product = await productRepo.findById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found',
        });
      }

      // Get current price
      const price = await priceRepo.findCurrentByProductId(id);

      res.json({
        success: true,
        data: {
          ...product,
          currentPrice: price,
        },
      });
    } catch (error) {
      console.error('Error getting product:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch product',
        message: error.message,
      });
    }
  }

  // GET /api/products/search - Search products
  async search(req, res) {
    try {
      const { q, limit = 20, offset = 0 } = req.query;

      if (!q || q.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Search query is required',
        });
      }

      const products = await productRepo.search(q, {
        limit: Math.min(parseInt(limit), 100),
        offset: parseInt(offset),
      });

      res.json({
        success: true,
        data: products,
        query: q,
      });
    } catch (error) {
      console.error('Error searching products:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search products',
        message: error.message,
      });
    }
  }

  // GET /api/products/:id/history - Get price history
  async getPriceHistory(req, res) {
    try {
      const { id } = req.params;
      const { limit = 30, offset = 0 } = req.query;

      const product = await productRepo.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found',
        });
      }

      const history = await priceRepo.findHistoryByProductId(id, {
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      res.json({
        success: true,
        data: {
          product,
          history,
        },
      });
    } catch (error) {
      console.error('Error getting price history:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch price history',
        message: error.message,
      });
    }
  }
}
