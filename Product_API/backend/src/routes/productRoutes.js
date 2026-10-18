import express from 'express';
import { getProducts } from '../controllers/paginationController.js';
import { getProductsWithIndexedOffset } from '../controllers/productoffsetIndexController.js';

const router = express.Router();

// Phase 1: Normal offset pagination
router.get('/products/pagination', getProducts);

// Phase 2: Offset pagination with indexing
router.get('/products/offset-indexed', getProductsWithIndexedOffset);

export default router;
