import { Router } from 'express';
import multer from 'multer';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { JobApplicationsController } from '../controllers/jobApplicationsController.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// Rotas públicas (site)
router.post('/', JobApplicationsController.createJobApplication);
router.post('/upload', upload.single('file'), JobApplicationsController.uploadCv);

// Rotas administrativas (protegidas) - administrator e editor
router.get('/', authenticateToken, authorizeRoles(['administrator', 'editor']), JobApplicationsController.getAll);
router.get('/:id', authenticateToken, authorizeRoles(['administrator', 'editor']), JobApplicationsController.getOne);
router.put('/:id/read', authenticateToken, authorizeRoles(['administrator', 'editor']), JobApplicationsController.markAsRead);
router.delete('/:id', authenticateToken, authorizeRoles(['administrator', 'editor']), JobApplicationsController.delete);

export default router;


