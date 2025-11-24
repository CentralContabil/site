import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth';
import {
  // Features
  getFeatures,
  getAllFeatures,
  createFeature,
  updateFeature,
  deleteFeature,
  // About
  getAbout,
  updateAbout,
  uploadAboutImage,
  getAboutImages,
  createAboutImage,
  updateAboutImage,
  deleteAboutImage,
  // Specialties
  getSpecialties,
  getAllSpecialties,
  createSpecialty,
  updateSpecialty,
  deleteSpecialty,
  // Fiscal Benefits
  getFiscalBenefits,
  getAllFiscalBenefits,
  getFiscalBenefitBySlug,
  createFiscalBenefit,
  updateFiscalBenefit,
  deleteFiscalBenefit,
  uploadFiscalBenefitImage,
  // Fun Facts
  getFunFacts,
  getAllFunFacts,
  createFunFact,
  updateFunFact,
  deleteFunFact,
  // Certifications
  getCertifications,
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  // Newsletter
  getNewsletter,
  updateNewsletter,
  uploadNewsletterImage,
  // Clients
  getClients,
  updateClients,
  uploadClientsImage,
} from '../controllers/sectionsController';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// ==================== FEATURES ====================
router.get('/features', getFeatures);
router.get('/features/all', authenticateToken, getAllFeatures);
router.post('/features', authenticateToken, createFeature);
router.put('/features/:id', authenticateToken, updateFeature);
router.delete('/features/:id', authenticateToken, deleteFeature);

// ==================== ABOUT ====================
router.get('/about', getAbout);
router.put('/about', authenticateToken, updateAbout);
router.post('/about/image', authenticateToken, upload.single('file'), (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false, 
        error: 'O arquivo é muito grande. O tamanho máximo permitido é 5MB. Por favor, escolha uma imagem menor.' 
      });
    }
    return res.status(400).json({ success: false, error: `Erro no upload: ${err.message}` });
  }
  if (err) {
    return res.status(400).json({ success: false, error: err.message || 'Erro ao processar arquivo' });
  }
  next();
}, uploadAboutImage);
router.get('/about/images', getAboutImages);
router.get('/about/images/test', authenticateToken, async (req, res) => {
  try {
    const prisma = (await import('../lib/prisma.js')).prisma;
    const keys = Object.keys(prisma).filter(k => k.includes('section') || k.includes('Section'));
    res.json({ success: true, keys, hasSectionAboutImage: 'sectionAboutImage' in prisma });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router.post('/about/images', authenticateToken, upload.single('file'), (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false, 
        error: 'O arquivo é muito grande. O tamanho máximo permitido é 5MB. Por favor, escolha uma imagem menor.' 
      });
    }
    return res.status(400).json({ success: false, error: `Erro no upload: ${err.message}` });
  }
  if (err) {
    return res.status(400).json({ success: false, error: err.message || 'Erro ao processar arquivo' });
  }
  next();
}, createAboutImage);
router.put('/about/images/:id', authenticateToken, updateAboutImage);
router.delete('/about/images/:id', authenticateToken, deleteAboutImage);

// ==================== SPECIALTIES ====================
router.get('/specialties', getSpecialties);
router.get('/specialties/all', authenticateToken, getAllSpecialties);
router.post('/specialties', authenticateToken, createSpecialty);
router.put('/specialties/:id', authenticateToken, updateSpecialty);
router.delete('/specialties/:id', authenticateToken, deleteSpecialty);

// ==================== FISCAL BENEFITS ====================
router.get('/fiscal-benefits', getFiscalBenefits);
router.get('/fiscal-benefits/all', authenticateToken, getAllFiscalBenefits);
router.get('/fiscal-benefits/slug/:slug', getFiscalBenefitBySlug);
router.post('/fiscal-benefits', authenticateToken, createFiscalBenefit);
router.put('/fiscal-benefits/:id', authenticateToken, updateFiscalBenefit);
router.delete('/fiscal-benefits/:id', authenticateToken, deleteFiscalBenefit);
router.post('/fiscal-benefits/:id/image', authenticateToken, upload.single('file'), (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false, 
        error: 'O arquivo é muito grande. O tamanho máximo permitido é 5MB. Por favor, escolha uma imagem menor.' 
      });
    }
    return res.status(400).json({ success: false, error: `Erro no upload: ${err.message}` });
  }
  if (err) {
    return res.status(400).json({ success: false, error: err.message || 'Erro ao processar arquivo' });
  }
  next();
}, uploadFiscalBenefitImage);

// ==================== FUN FACTS ====================
router.get('/fun-facts', getFunFacts);
router.get('/fun-facts/all', authenticateToken, getAllFunFacts);
router.post('/fun-facts', authenticateToken, createFunFact);
router.put('/fun-facts/:id', authenticateToken, updateFunFact);
router.delete('/fun-facts/:id', authenticateToken, deleteFunFact);

// ==================== CERTIFICATIONS ====================
router.get('/certifications', getCertifications);
router.get('/certifications/all', authenticateToken, getAllCertifications);
router.post('/certifications', authenticateToken, createCertification);
router.put('/certifications/:id', authenticateToken, updateCertification);
router.delete('/certifications/:id', authenticateToken, deleteCertification);

// ==================== NEWSLETTER ====================
router.get('/newsletter', getNewsletter);
router.put('/newsletter', authenticateToken, updateNewsletter);
router.post('/newsletter/image', authenticateToken, upload.single('file'), (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false, 
        error: 'O arquivo é muito grande. O tamanho máximo permitido é 5MB. Por favor, escolha uma imagem menor.' 
      });
    }
    return res.status(400).json({ success: false, error: `Erro no upload: ${err.message}` });
  }
  if (err) {
    return res.status(400).json({ success: false, error: err.message || 'Erro ao processar arquivo' });
  }
  next();
}, uploadNewsletterImage);

// ==================== CLIENTS ====================
router.get('/clients', getClients);
router.put('/clients', authenticateToken, updateClients);
router.post('/clients/image', authenticateToken, upload.single('file'), (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false, 
        error: 'O arquivo é muito grande. O tamanho máximo permitido é 5MB. Por favor, escolha uma imagem menor.' 
      });
    }
    return res.status(400).json({ success: false, error: `Erro no upload: ${err.message}` });
  }
  if (err) {
    return res.status(400).json({ success: false, error: err.message || 'Erro ao processar arquivo' });
  }
  next();
}, uploadClientsImage);

export default router;



