import express from 'express';
import {
  register,
  login,
  getAllUsers,
  updateUserRole,
  deleteUser,
  updateProfile,
  changePassword
} from '../controllers/authController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/register', register);

// Protected routes (require authentication)
router.get('/users', authenticate, requireAdmin, getAllUsers);
router.put('/users/:userId/role', authenticate, requireAdmin, updateUserRole);
router.delete('/users/:userId', authenticate, requireAdmin, deleteUser);

// Profile routes
router.put('/profile', authenticate, updateProfile);
router.put('/profile/password', authenticate, changePassword);

export default router;
