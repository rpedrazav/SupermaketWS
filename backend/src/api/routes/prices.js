import { Router } from 'express';
import { PriceController } from '../controllers/priceController.js';

const router = Router();
const controller = new PriceController();

// Price routes
router.get('/compare', (req, res) => controller.compare(req, res));
router.get('/offers', (req, res) => controller.getOffers(req, res));
router.get('/history/:productId', (req, res) => controller.getHistory(req, res));

export default router;
