import { Router } from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth';
import {
  getBlogPosts,
  getBlogPostBySlug,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  uploadBlogPostImage,
  deleteBlogPostImage
} from '../controllers/blogController';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Rotas públicas
router.get('/blog/posts', getBlogPosts);
router.get('/blog/posts/:slug', getBlogPostBySlug);

// Rotas protegidas (admin)
router.post('/blog/posts', authenticateToken, createBlogPost);
router.put('/blog/posts/:id', authenticateToken, updateBlogPost);
router.delete('/blog/posts/:id', authenticateToken, deleteBlogPost);
router.post('/blog/posts/:id/image', authenticateToken, upload.single('file'), uploadBlogPostImage);
router.delete('/blog/posts/:id/image', authenticateToken, deleteBlogPostImage);

export default router;