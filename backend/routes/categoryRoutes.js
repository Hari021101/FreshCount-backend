import express from 'express';
import {
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { authenticate, requireAdmin, requireStaffOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Staff and Admin can view
router.get('/', requireStaffOrAdmin, getAllCategories);
router.get('/:categoryId', requireStaffOrAdmin, getCategory);

// Only Admin can create, update, delete
router.post('/', requireAdmin, createCategory);
router.put('/:categoryId', requireAdmin, updateCategory);
router.delete('/:categoryId', requireAdmin, deleteCategory);

export default router;
