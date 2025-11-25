import { Router } from 'express';
import { SupermarketController } from '../controllers/supermarketController.js';

const router = Router();
const controller = new SupermarketController();

// Supermarket routes
router.get('/', (req, res) => controller.list(req, res));
router.get('/slug/:slug', (req, res) => controller.getBySlug(req, res));
router.get('/chain/:chainGroup', (req, res) => controller.getByChainGroup(req, res));
router.get('/:id', (req, res) => controller.getById(req, res));

export default router;
