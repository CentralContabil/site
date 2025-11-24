import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth.js';
import {
  getClients,
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  uploadClientLogo,
  deleteClientLogo,
} from '../controllers/clientsController.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Rotas públicas
router.get('/', getClients);

// Rotas protegidas (admin)
router.get('/all', authenticateToken, getAllClients);
router.get('/:id', authenticateToken, getClientById);
router.post('/', authenticateToken, createClient);
router.put('/:id', authenticateToken, updateClient);
router.delete('/:id', authenticateToken, deleteClient);
router.post('/:id/logo', authenticateToken, upload.single('file'), uploadClientLogo);
router.delete('/:id/logo', authenticateToken, deleteClientLogo);

export default router;

