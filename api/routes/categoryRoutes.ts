import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
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

// Rotas protegidas (admin) - administrator, editor, author, contributor
router.post('/categories', authenticateToken, authorizeRoles(['administrator', 'editor', 'author', 'contributor']), createCategory);
router.put('/categories/:id', authenticateToken, authorizeRoles(['administrator', 'editor', 'author', 'contributor']), updateCategory);
router.delete('/categories/:id', authenticateToken, authorizeRoles(['administrator', 'editor']), deleteCategory);

export default router;




