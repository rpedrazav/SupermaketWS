import { PriceRepository } from '../../infrastructure/repositories/PriceRepository.js';

const priceRepo = new PriceRepository();

export class PriceController {
  // GET /api/prices/compare - Compare prices for a product
  async compare(req, res) {
    try {
      const { masterProductId } = req.query;

      if (!masterProductId) {
        return res.status(400).json({
          success: false,
          error: 'masterProductId query parameter is required',
        });
      }

      const comparison = await priceRepo.compareByMasterProduct(masterProductId);

      if (comparison.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'No products found for comparison',
        });
      }

      // Calculate best deal
      const bestDeal = comparison[0]; // Already sorted by price ASC
      const savings = comparison.map(item => {
        const effectivePrice = item.offer_price || item.normal_price;
        const bestPrice = bestDeal.offer_price || bestDeal.normal_price;
        return {
          ...item,
          effectivePrice,
          savingsVsBest: effectivePrice - bestPrice,
        };
      });

      res.json({
        success: true,
        data: {
          comparison: savings,
          bestDeal: {
            supermarket: bestDeal.supermarket_name,
            price: bestDeal.offer_price || bestDeal.normal_price,
            hasOffer: bestDeal.has_offer,
          },
        },
      });
    } catch (error) {
      console.error('Error comparing prices:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to compare prices',
        message: error.message,
      });
    }
  }

  // GET /api/prices/offers - Get products with offers
  async getOffers(req, res) {
    try {
      const { limit = 20, offset = 0, supermarketId } = req.query;

      const offers = await priceRepo.findWithOffers({
        limit: Math.min(parseInt(limit), 100),
        offset: parseInt(offset),
        supermarketId,
      });

      res.json({
        success: true,
        data: offers,
      });
    } catch (error) {
      console.error('Error getting offers:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch offers',
        message: error.message,
      });
    }
  }

  // GET /api/prices/history/:productId - Get price history
  async getHistory(req, res) {
    try {
      const { productId } = req.params;
      const { limit = 30, offset = 0 } = req.query;

      const history = await priceRepo.findHistoryByProductId(productId, {
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      res.json({
        success: true,
        data: history,
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
