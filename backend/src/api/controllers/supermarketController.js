import { SupermarketRepository } from '../../infrastructure/repositories/SupermarketRepository.js';
import { PriceRepository } from '../../infrastructure/repositories/PriceRepository.js';

const supermarketRepo = new SupermarketRepository();
const priceRepo = new PriceRepository();

export class SupermarketController {
  // GET /api/supermarkets - List all supermarkets
  async list(req, res) {
    try {
      const { isActive } = req.query;

      const supermarkets = await supermarketRepo.findAll({
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
      });

      res.json({
        success: true,
        data: supermarkets,
      });
    } catch (error) {
      console.error('Error listing supermarkets:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch supermarkets',
        message: error.message,
      });
    }
  }

  // GET /api/supermarkets/:id - Get supermarket by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const supermarket = await supermarketRepo.findById(id);

      if (!supermarket) {
        return res.status(404).json({
          success: false,
          error: 'Supermarket not found',
        });
      }

      // Get statistics
      const stats = await priceRepo.getStatsBySupermarket(id);

      res.json({
        success: true,
        data: {
          ...supermarket,
          stats,
        },
      });
    } catch (error) {
      console.error('Error getting supermarket:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch supermarket',
        message: error.message,
      });
    }
  }

  // GET /api/supermarkets/slug/:slug - Get supermarket by slug
  async getBySlug(req, res) {
    try {
      const { slug } = req.params;
      const supermarket = await supermarketRepo.findBySlug(slug);

      if (!supermarket) {
        return res.status(404).json({
          success: false,
          error: 'Supermarket not found',
        });
      }

      // Get statistics
      const stats = await priceRepo.getStatsBySupermarket(supermarket.id);

      res.json({
        success: true,
        data: {
          ...supermarket,
          stats,
        },
      });
    } catch (error) {
      console.error('Error getting supermarket:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch supermarket',
        message: error.message,
      });
    }
  }

  // GET /api/supermarkets/chain/:chainGroup - Get supermarkets by chain
  async getByChainGroup(req, res) {
    try {
      const { chainGroup } = req.params;
      const supermarkets = await supermarketRepo.findByChainGroup(chainGroup);

      res.json({
        success: true,
        data: supermarkets,
      });
    } catch (error) {
      console.error('Error getting supermarkets by chain:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch supermarkets',
        message: error.message,
      });
    }
  }
}
