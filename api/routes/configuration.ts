import express from 'express';
import multer from 'multer';
import { 
  getConfiguration, 
  updateConfiguration, 
  sendContactMessage,
  uploadLogo,
  deleteLogo
} from '../controllers/configurationController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Rotas públicas
router.get('/', getConfiguration);
router.post('/contact', sendContactMessage);

// Rotas administrativas (protegidas)
router.put('/', authenticateToken, updateConfiguration);
router.post('/logo', authenticateToken, upload.single('file'), uploadLogo);
router.delete('/logo/:type', authenticateToken, deleteLogo);

export default router;