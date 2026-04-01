import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import {
  getAllRecruitmentProcesses,
  getRecruitmentProcessById,
  createRecruitmentProcess,
  updateRecruitmentProcess,
  deleteRecruitmentProcess,
  addCandidateToProcess,
  updateCandidateStatus,
  removeCandidateFromProcess,
  getAvailableCandidates,
} from '../controllers/recruitmentProcessesController.js';

const router = Router();

// Todas as rotas são administrativas (protegidas)
router.get('/', authenticateToken, authorizeRoles(['administrator', 'editor']), getAllRecruitmentProcesses);
router.get('/:id', authenticateToken, authorizeRoles(['administrator', 'editor']), getRecruitmentProcessById);
router.post('/', authenticateToken, authorizeRoles(['administrator', 'editor']), createRecruitmentProcess);
router.put('/:id', authenticateToken, authorizeRoles(['administrator', 'editor']), updateRecruitmentProcess);
router.delete('/:id', authenticateToken, authorizeRoles(['administrator', 'editor']), deleteRecruitmentProcess);

// Rotas de candidatos no processo
router.get('/:processId/candidates/available', authenticateToken, authorizeRoles(['administrator', 'editor']), getAvailableCandidates);
router.post('/:id/candidates', authenticateToken, authorizeRoles(['administrator', 'editor']), addCandidateToProcess);
router.put('/:processId/candidates/:candidateId', authenticateToken, authorizeRoles(['administrator', 'editor']), updateCandidateStatus);
router.delete('/:processId/candidates/:candidateId', authenticateToken, authorizeRoles(['administrator', 'editor']), removeCandidateFromProcess);

export default router;

