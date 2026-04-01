import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import {
  getForms,
  getFormById,
  getFormBySlug,
  createForm,
  updateForm,
  deleteForm,
  createFormField,
  updateFormField,
  deleteFormField,
  submitForm,
} from '../controllers/formsController';

const router = express.Router();

// Rotas públicas
router.get('/forms', getForms);
router.get('/forms/slug/:slug', getFormBySlug);
router.post('/forms/:id/submit', submitForm);

// Rotas protegidas - Formulários
router.get('/admin/forms', authenticateToken, authorizeRoles(['administrator', 'editor']), getForms);
router.get('/admin/forms/:id', authenticateToken, authorizeRoles(['administrator', 'editor']), getFormById);
router.post('/admin/forms', authenticateToken, authorizeRoles(['administrator', 'editor']), createForm);
router.put('/admin/forms/:id', authenticateToken, authorizeRoles(['administrator', 'editor']), updateForm);
router.delete('/admin/forms/:id', authenticateToken, authorizeRoles(['administrator']), deleteForm);

// Rotas protegidas - Campos de Formulário
router.post('/admin/form-fields/reusable', authenticateToken, authorizeRoles(['administrator', 'editor']), createFormField);
router.put('/admin/form-fields/reusable/:id', authenticateToken, authorizeRoles(['administrator', 'editor']), updateFormField);
router.delete('/admin/form-fields/reusable/:id', authenticateToken, authorizeRoles(['administrator', 'editor']), deleteFormField);

export default router;


