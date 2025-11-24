import express from 'express';
import { PrivacyPolicyController } from '../controllers/privacyPolicyController.js';
import { authenticateToken } from '../middleware/auth.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Rota pública para obter a política
router.get('/', PrivacyPolicyController.getPrivacyPolicy);

// Rotas administrativas (requerem autenticação)
router.get('/admin', authenticateToken, PrivacyPolicyController.getPrivacyPolicyAdmin);
router.put('/admin', authenticateToken, PrivacyPolicyController.updatePrivacyPolicy);
router.post(
  '/admin/background-image',
  authenticateToken,
  upload.single('file'),
  (err: any, req: any, res: any, next: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: 'O arquivo é muito grande. O tamanho máximo permitido é 5MB.',
        });
      }
      return res.status(400).json({ success: false, error: `Erro no upload: ${err.message}` });
    }
    if (err) {
      return res.status(400).json({ success: false, error: err.message || 'Erro ao processar arquivo' });
    }
    next();
  },
  PrivacyPolicyController.uploadBackgroundImage
);

export default router;

