import { Router } from 'express';
import multer from 'multer';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
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
// administrator, editor, author e contributor podem gerenciar posts
router.post('/blog/posts', authenticateToken, authorizeRoles(['administrator', 'editor', 'author', 'contributor']), createBlogPost);
router.put('/blog/posts/:id', authenticateToken, authorizeRoles(['administrator', 'editor', 'author', 'contributor']), updateBlogPost);
router.delete('/blog/posts/:id', authenticateToken, authorizeRoles(['administrator', 'editor']), deleteBlogPost);
router.post('/blog/posts/:id/image', authenticateToken, authorizeRoles(['administrator', 'editor', 'author', 'contributor']), upload.single('file'), uploadBlogPostImage);
router.delete('/blog/posts/:id/image', authenticateToken, authorizeRoles(['administrator', 'editor']), deleteBlogPostImage);

export default router;