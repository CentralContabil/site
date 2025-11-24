import express from 'express';
import { 
  getServices, 
  getAllServices,
  getServiceBySlug,
  createService, 
  updateService, 
  deleteService 
} from '../controllers/servicesController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Rotas públicas
router.get('/', getServices);
router.get('/slug/:slug', getServiceBySlug);

// Rotas administrativas (protegidas)
router.get('/all', authenticateToken, getAllServices);
router.post('/', authenticateToken, createService);
router.put('/:id', authenticateToken, updateService);
router.delete('/:id', authenticateToken, deleteService);

export default router;