import { Router } from 'express';
import { ProductController } from '../controllers/productController.js';

const router = Router();
const controller = new ProductController();

// Product routes
router.get('/', (req, res) => controller.list(req, res));
router.get('/search', (req, res) => controller.search(req, res));
router.get('/:id', (req, res) => controller.getById(req, res));
router.get('/:id/history', (req, res) => controller.getPriceHistory(req, res));

export default router;
