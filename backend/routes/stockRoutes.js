import express from 'express';
import {
  getAllStockMovements,
  createStockMovement,
  getStockMovement,
  deleteStockMovement,
  getStockSummary
} from '../controllers/stockController.js';
import { authenticate, requireAdmin, requireStaffOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Staff and Admin can view and create movements (Staff limited to IN only, enforced in controller)
router.get('/', requireStaffOrAdmin, getAllStockMovements);
router.get('/summary', requireStaffOrAdmin, getStockSummary);
router.get('/:movementId', requireStaffOrAdmin, getStockMovement);
router.post('/', requireStaffOrAdmin, createStockMovement);

// Only Admin can delete movements
router.delete('/:movementId', requireAdmin, deleteStockMovement);

export default router;
