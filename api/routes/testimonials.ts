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
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});

// Rotas públicas
router.get('/', getTestimonials);

// Rotas administrativas (protegidas) - administrator e editor
router.get('/all', authenticateToken, authorizeRoles(['administrator', 'editor']), getAllTestimonials);
router.post('/', authenticateToken, authorizeRoles(['administrator', 'editor']), createTestimonial);
router.put('/:id', authenticateToken, authorizeRoles(['administrator', 'editor']), updateTestimonial);
router.delete('/:id', authenticateToken, authorizeRoles(['administrator', 'editor']), deleteTestimonial);
router.post('/:id/media', authenticateToken, authorizeRoles(['administrator', 'editor']), upload.single('file'), uploadTestimonialMedia);

export default router;