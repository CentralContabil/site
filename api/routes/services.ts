import express from 'express';
import multer from 'multer';
import { 
  getServices, 
  getAllServices,
  getServiceBySlug,
  createService, 
  updateService, 
  deleteService,
  uploadServiceImage,
  deleteServiceImage,
} from '../controllers/servicesController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Rotas públicas
router.get('/', getServices);
router.get('/slug/:slug', getServiceBySlug);

// Rotas administrativas (protegidas) - administrator e editor
router.get('/all', authenticateToken, authorizeRoles(['administrator', 'editor']), getAllServices);
router.post('/', authenticateToken, authorizeRoles(['administrator', 'editor']), createService);
router.put('/:id', authenticateToken, authorizeRoles(['administrator', 'editor']), updateService);
router.delete('/:id', authenticateToken, authorizeRoles(['administrator', 'editor']), deleteService);
router.post('/:id/image', authenticateToken, authorizeRoles(['administrator', 'editor']), upload.single('file'), uploadServiceImage);
router.delete('/:id/image', authenticateToken, authorizeRoles(['administrator', 'editor']), deleteServiceImage);

export default router;