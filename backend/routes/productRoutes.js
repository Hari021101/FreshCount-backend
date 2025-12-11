import express from 'express';
import {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductClosingStock
} from '../controllers/productController.js';
import { authenticate, requireAdmin, requireStaffOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Staff and Admin can view
router.get('/', requireStaffOrAdmin, getAllProducts);
router.get('/:productId', requireStaffOrAdmin, getProduct);
router.get('/:productId/closing-stock', requireStaffOrAdmin, getProductClosingStock);

// Only Admin can create, update, delete
router.post('/', requireAdmin, createProduct);
router.put('/:productId', requireAdmin, updateProduct);
router.delete('/:productId', requireAdmin, deleteProduct);

export default router;
