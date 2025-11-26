import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth';
import { getLoginPage, updateLoginPage, uploadLoginPageImage, deleteLoginPageImage } from '../controllers/loginPageController';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Rota pública para obter dados da Página de Login
router.get('/', getLoginPage);

// Rotas protegidas para atualizar a Página de Login
router.put('/', authenticateToken, updateLoginPage);
router.post('/image', authenticateToken, upload.single('file'), uploadLoginPageImage);
router.delete('/image/:type', authenticateToken, deleteLoginPageImage);

export default router;

