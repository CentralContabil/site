import express from 'express';
import { login, me, sendCode, verifyCode } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Rotas antigas (mantidas para compatibilidade)
router.post('/login', login);

// Novas rotas de autenticação com código
router.post('/send-code', sendCode);
router.post('/verify-code', verifyCode);

router.get('/me', authenticateToken, me);

export default router;