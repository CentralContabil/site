import express from 'express';
import { ContactMessagesController } from '../controllers/contactMessagesController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.get('/', authenticateToken, ContactMessagesController.getAllMessages);
router.get('/unread-count', authenticateToken, ContactMessagesController.getUnreadCount);
router.get('/total-count', authenticateToken, ContactMessagesController.getTotalCount);
router.get('/:id', authenticateToken, ContactMessagesController.getMessage);
router.put('/:id/read', authenticateToken, ContactMessagesController.markAsRead);
router.post('/:id/reply', authenticateToken, ContactMessagesController.sendReply);
router.delete('/:id', authenticateToken, ContactMessagesController.deleteMessage);

export default router;

