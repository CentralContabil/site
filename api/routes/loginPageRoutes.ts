import { Router } from 'express';
import multer from 'multer';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import {
  getLoginPage,
  updateLoginPage,
  uploadLoginPageImage,
  deleteLoginPageImage
} from '../controllers/loginPageController.js';

const router = Router();

// Rota pública
router.get('/', getLoginPage);

// Rotas protegidas (admin) - administrator e editor
router.put('/', authenticateToken, authorizeRoles(['administrator', 'editor']), updateLoginPage);
router.post('/image', authenticateToken, authorizeRoles(['administrator', 'editor']), uploadLoginPageImage);
router.delete('/image/:type', authenticateToken, authorizeRoles(['administrator', 'editor']), deleteLoginPageImage);

export default router;


