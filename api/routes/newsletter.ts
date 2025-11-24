import express from 'express';
import { listSubscriptions, createSubscription, deleteSubscription, exportSubscriptions } from '../controllers/newsletterController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/subscriptions', createSubscription);
router.get('/subscriptions', authenticateToken, listSubscriptions);
router.delete('/subscriptions/:id', authenticateToken, deleteSubscription);
router.get('/subscriptions/export', authenticateToken, exportSubscriptions);

export default router;

