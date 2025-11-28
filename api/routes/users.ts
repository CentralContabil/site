import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/usersController';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// E apenas administradores (role WordPress: "administrator") podem gerenciar usuários
router.use(authorizeRoles(['administrator']));

// Rotas de usuários
router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;