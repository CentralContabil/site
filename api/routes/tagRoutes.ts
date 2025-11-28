import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import {
  getTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag
} from '../controllers/tagController';

const router = Router();

// Rotas públicas
router.get('/tags', getTags);
router.get('/tags/:id', getTagById);

// Rotas protegidas (admin) - administrator, editor, author, contributor
router.post('/tags', authenticateToken, authorizeRoles(['administrator', 'editor', 'author', 'contributor']), createTag);
router.put('/tags/:id', authenticateToken, authorizeRoles(['administrator', 'editor', 'author', 'contributor']), updateTag);
router.delete('/tags/:id', authenticateToken, authorizeRoles(['administrator', 'editor']), deleteTag);

export default router;




