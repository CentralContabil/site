import express from 'express';
import { 
  getSlides, 
  getAllSlides, 
  createSlide, 
  updateSlide, 
  deleteSlide 
} from '../controllers/slidesController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configurar multer para upload de imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos'));
    }
  }
});

// Rotas públicas
router.get('/', getSlides);

// Rotas administrativas (protegidas) - administrator e editor
router.get('/all', authenticateToken, authorizeRoles(['administrator', 'editor']), getAllSlides);
router.post('/', authenticateToken, authorizeRoles(['administrator', 'editor']), upload.single('image'), createSlide);
router.put('/:id', authenticateToken, authorizeRoles(['administrator', 'editor']), upload.single('image'), updateSlide);
router.delete('/:id', authenticateToken, authorizeRoles(['administrator', 'editor']), deleteSlide);

export default router;