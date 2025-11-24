import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/usersController';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Rotas de usuários
router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;