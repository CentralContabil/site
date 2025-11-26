import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController';

const router = Router();

// Rotas públicas
router.get('/categories', getCategories);
router.get('/categories/:id', getCategoryById);

// Rotas protegidas (admin)
router.post('/categories', authenticateToken, createCategory);
router.put('/categories/:id', authenticateToken, updateCategory);
router.delete('/categories/:id', authenticateToken, deleteCategory);

export default router;




