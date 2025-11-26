import express from 'express';
import { AccessLogController } from '../controllers/accessLogController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.get('/', authenticateToken, AccessLogController.getAllLogs);
router.get('/stats', authenticateToken, AccessLogController.getStats);

export default router;

