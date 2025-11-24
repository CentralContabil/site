import express from 'express';
import multer from 'multer';
import { 
  getTestimonials, 
  getAllTestimonials, 
  createTestimonial, 
  updateTestimonial, 
  deleteTestimonial,
  uploadTestimonialMedia
} from '../controllers/testimonialsController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});

// Rotas públicas
router.get('/', getTestimonials);

// Rotas administrativas (protegidas)
router.get('/all', authenticateToken, getAllTestimonials);
router.post('/', authenticateToken, createTestimonial);
router.put('/:id', authenticateToken, updateTestimonial);
router.delete('/:id', authenticateToken, deleteTestimonial);
router.post('/:id/media', authenticateToken, upload.single('file'), uploadTestimonialMedia);

export default router;