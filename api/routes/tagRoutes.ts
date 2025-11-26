import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
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

// Rotas protegidas (admin)
router.post('/tags', authenticateToken, createTag);
router.put('/tags/:id', authenticateToken, updateTag);
router.delete('/tags/:id', authenticateToken, deleteTag);

export default router;




