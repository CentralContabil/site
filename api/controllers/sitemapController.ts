import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const getSitemap = async (req: Request, res: Response) => {
  try {
    const baseUrl = req.protocol + '://' + req.get('host');
    const currentDate = new Date().toISOString().split('T')[0];

    // Páginas estáticas
    const staticPages = [
      { url: `${baseUrl}/`, changefreq: 'daily', priority: '1.0' },
      { url: `${baseUrl}/blog`, changefreq: 'weekly', priority: '0.8' },
      { url: `${baseUrl}/politica-de-privacidade`, changefreq: 'monthly', priority: '0.5' },
    ];

    // Buscar serviços publicados
    const services = await prisma.service.findMany({
      where: { is_active: true },
      select: { slug: true, updated_at: true },
    });

    // Buscar posts do blog publicados
    const blogPosts = await prisma.blogPost.findMany({
      where: { is_published: true },
      select: { slug: true, updated_at: true, published_at: true },
    });

    // Buscar benefícios fiscais publicados
    const fiscalBenefits = await prisma.sectionFiscalBenefit.findMany({
      where: { is_active: true },
      select: { slug: true, updated_at: true },
    });

    // Gerar XML do sitemap
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Adicionar páginas estáticas
    staticPages.forEach(page => {
      sitemap += `
  <url>
    <loc>${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    });

    // Adicionar serviços
    services.forEach(service => {
      const lastmod = service.updated_at ? new Date(service.updated_at).toISOString().split('T')[0] : currentDate;
      sitemap += `
  <url>
    <loc>${baseUrl}/servicos/${service.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    // Adicionar posts do blog
    blogPosts.forEach(post => {
      const lastmod = post.updated_at ? new Date(post.updated_at).toISOString().split('T')[0] : 
                     (post.published_at ? new Date(post.published_at).toISOString().split('T')[0] : currentDate);
      sitemap += `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
    });

    // Adicionar benefícios fiscais
    fiscalBenefits.forEach(benefit => {
      if (benefit.slug) {
        const lastmod = benefit.updated_at ? new Date(benefit.updated_at).toISOString().split('T')[0] : currentDate;
        sitemap += `
  <url>
    <loc>${baseUrl}/beneficios-fiscais/${benefit.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
      }
    });

    sitemap += `
</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('Erro ao gerar sitemap:', error);
    res.status(500).send('Erro ao gerar sitemap');
  }
};




