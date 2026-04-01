import express from 'express';
import multer from 'multer';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import {
  getLandingPages,
  getLandingPageBySlug,
  getLandingPageById,
  createLandingPage,
  updateLandingPage,
  deleteLandingPage,
  uploadLandingPageImage,
  createFormField,
  updateFormField,
  deleteFormField,
  reorderFormFields,
  getFormSubmissions,
  getFormSubmissionById,
  submitForm,
  markSubmissionAsRead,
  deleteFormSubmission,
} from '../controllers/landingPagesController';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Rotas públicas
router.get('/landing-pages', getLandingPages);
router.get('/landing-pages/slug/:slug', getLandingPageBySlug);
router.post('/landing-pages/:id/submit', submitForm);

// Rotas protegidas - Landing Pages
router.get('/admin/landing-pages', authenticateToken, authorizeRoles(['administrator', 'editor']), getLandingPages);
router.get('/admin/landing-pages/:id', authenticateToken, authorizeRoles(['administrator', 'editor']), getLandingPageById);
router.post('/admin/landing-pages', authenticateToken, authorizeRoles(['administrator', 'editor']), createLandingPage);
router.put('/admin/landing-pages/:id', authenticateToken, authorizeRoles(['administrator', 'editor']), updateLandingPage);
router.delete('/admin/landing-pages/:id', authenticateToken, authorizeRoles(['administrator']), deleteLandingPage);
router.post('/admin/landing-pages/upload', authenticateToken, authorizeRoles(['administrator', 'editor']), upload.single('image'), uploadLandingPageImage);

// Rotas protegidas - Form Fields
router.post('/admin/form-fields', authenticateToken, authorizeRoles(['administrator', 'editor']), createFormField);
router.put('/admin/form-fields/:id', authenticateToken, authorizeRoles(['administrator', 'editor']), updateFormField);
router.delete('/admin/form-fields/:id', authenticateToken, authorizeRoles(['administrator', 'editor']), deleteFormField);
router.put('/admin/form-fields/reorder', authenticateToken, authorizeRoles(['administrator', 'editor']), reorderFormFields);

// Rotas protegidas - Form Submissions
router.get('/admin/form-submissions', authenticateToken, authorizeRoles(['administrator', 'editor']), getFormSubmissions);
router.get('/admin/form-submissions/:id', authenticateToken, authorizeRoles(['administrator', 'editor']), getFormSubmissionById);
router.put('/admin/form-submissions/:id/read', authenticateToken, authorizeRoles(['administrator', 'editor']), markSubmissionAsRead);
router.delete('/admin/form-submissions/:id', authenticateToken, authorizeRoles(['administrator']), deleteFormSubmission);

export default router;

