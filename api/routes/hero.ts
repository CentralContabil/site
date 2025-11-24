import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth';
import { getHero, updateHero, uploadHeroImage, deleteHeroImage } from '../controllers/heroController';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Rota pública para obter dados do Hero
router.get('/', getHero);

// Rotas protegidas para atualizar o Hero
router.put('/', authenticateToken, updateHero);
router.post('/image', authenticateToken, upload.single('file'), uploadHeroImage);
router.delete('/image/:type', authenticateToken, deleteHeroImage);

export default router;

