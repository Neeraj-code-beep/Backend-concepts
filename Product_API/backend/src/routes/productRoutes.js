import express from "express";
import { getProducts } from "../controllers/paginationController.js";

const router = express.Router();

// Pagination...
router.get("/products/pagination", getProducts);

export default router;