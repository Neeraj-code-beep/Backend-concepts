import express from 'express';
import productController from '../controllers/product.controller.js';

const router = express.Router();

router.post('/', productController.createProduct);

router.get('/get-item', productController.getItem);

export default router;
