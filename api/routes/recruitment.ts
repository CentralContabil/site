import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import {
  getRecruitmentProcesses,
  getRecruitmentProcessById,
  createRecruitmentProcess,
  updateRecruitmentProcess,
  deleteRecruitmentProcess,
  createRecruitmentStage,
  updateRecruitmentStage,
  deleteRecruitmentStage,
  getAvailableCandidates,
  addCandidateToProcess,
  updateCandidate,
  removeCandidateFromProcess,
  evaluateCandidateStage,
  addNoteToCandidate,
  deleteNote,
} from '../controllers/recruitmentController.js';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);
router.use(authorizeRoles(['administrator', 'editor']));

// ==================== PROCESSOS SELETIVOS ====================
router.get('/processes', getRecruitmentProcesses);
router.get('/processes/:id', getRecruitmentProcessById);
router.post('/processes', createRecruitmentProcess);
router.put('/processes/:id', updateRecruitmentProcess);
router.delete('/processes/:id', deleteRecruitmentProcess);

// ==================== ETAPAS ====================
router.post('/processes/:processId/stages', createRecruitmentStage);
router.put('/stages/:id', updateRecruitmentStage);
router.delete('/stages/:id', deleteRecruitmentStage);

// ==================== CANDIDATOS ====================
router.get('/processes/:processId/candidates/available', getAvailableCandidates);
router.post('/processes/:processId/candidates', addCandidateToProcess);
router.put('/candidates/:id', updateCandidate);
router.delete('/candidates/:id', removeCandidateFromProcess);

// ==================== AVALIAÇÃO ====================
router.post('/candidates/:candidateId/stages/:stageId/evaluate', evaluateCandidateStage);

// ==================== NOTAS ====================
router.post('/candidates/:candidateId/notes', addNoteToCandidate);
router.delete('/notes/:id', deleteNote);

export default router;

