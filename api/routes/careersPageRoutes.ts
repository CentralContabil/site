import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getCareersPage,
  updateCareersPage,
  uploadCareersPageImage,
  deleteCareersPageImage,
} from '../controllers/careersPageController.js';

const router = Router();

// Rota pública
router.get('/', getCareersPage);

// Rotas protegidas (admin)
router.put('/', authenticateToken, updateCareersPage);
router.post('/image', authenticateToken, uploadCareersPageImage);
router.delete('/image', authenticateToken, deleteCareersPageImage);

export default router;




