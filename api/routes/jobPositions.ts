import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import {
  getJobPositions,
  getAllJobPositions,
  getJobPositionById,
  createJobPosition,
  updateJobPosition,
  deleteJobPosition,
} from '../controllers/jobPositionsController.js';

const router = Router();

// Rota pública - apenas áreas ativas
router.get('/', getJobPositions);

// Rotas administrativas (protegidas)
router.get('/all', authenticateToken, authorizeRoles(['administrator', 'editor']), getAllJobPositions);
router.get('/:id', authenticateToken, authorizeRoles(['administrator', 'editor']), getJobPositionById);
router.post('/', authenticateToken, authorizeRoles(['administrator', 'editor']), createJobPosition);
router.put('/:id', authenticateToken, authorizeRoles(['administrator', 'editor']), updateJobPosition);
router.delete('/:id', authenticateToken, authorizeRoles(['administrator', 'editor']), deleteJobPosition);

export default router;


