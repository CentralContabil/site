import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { getAllLogs, getStats } from '../controllers/accessLogController';

const router = Router();

// Todas as rotas requerem autenticação e nível administrator
router.get('/', authenticateToken, authorizeRoles(['administrator']), getAllLogs);
router.get('/stats', authenticateToken, authorizeRoles(['administrator']), getStats);

export default router;


