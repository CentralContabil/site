import express from 'express';
import { getSitemap } from '../controllers/sitemapController.js';

const router = express.Router();

// Rota pública para sitemap.xml
router.get('/', getSitemap);

export default router;




