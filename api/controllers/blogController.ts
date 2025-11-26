import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../middleware/auth.js';
import { FileService } from '../services/fileService.js';
import { SocialMediaService } from '../services/socialMediaService.js';

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export const getBlogPosts = async (req: Request, res: Response) => {
  try {
    const { published, category } = req.query;
    
    const where: any = {};
    
    if (published === 'true') {
      where.is_published = true;
    }
    
    if (category) {
      where.categories = {
        some: {
          category: {
            slug: category as string
          }
        }
      };
    }

    const posts = await prisma.blogPost.findMany({
      where,
      orderBy: { published_at: 'desc' },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    res.json(posts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBlogPostBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createBlogPost = async (req: Request, res: Response) => {
  try {
    const { 
      title, 
      excerpt, 
      content, 
      featured_image_url, 
      author, 
      is_published, 
      category_ids, 
      tag_ids,
      publishToFacebook,
      publishToInstagram,
      publishToLinkedIn,
      publishToTwitter,
      publishToThreads
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    let slug = slugify(title);
    
    // Ensure unique slug
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug }
    });

    if (existingPost) {
      slug = `${slug}-${uuidv4().slice(0, 8)}`;
    }

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        featured_image_url,
        author: author || 'Admin',
        is_published: is_published || false,
        published_at: is_published ? new Date() : null,
        categories: category_ids && category_ids.length > 0 ? {
          create: category_ids.map((categoryId: string) => ({
            category_id: categoryId
          }))
        } : undefined,
        tags: tag_ids && tag_ids.length > 0 ? {
          create: tag_ids.map((tagId: string) => ({
            tag_id: tagId
          }))
        } : undefined
      },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    // Publicar nas redes sociais se solicitado e o post estiver publicado
    if (is_published && (publishToFacebook || publishToInstagram || publishToLinkedIn || publishToTwitter || publishToThreads)) {
      try {
        const config = await prisma.configuration.findFirst();
        if (config) {
          const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
          const postUrl = `${baseUrl}/blog/${post.slug}`;
          
          const socialResults = await SocialMediaService.publishToSocialMedia(
            config,
            {
              title: post.title,
              excerpt: post.excerpt || undefined,
              content: post.content,
              featuredImageUrl: post.featured_image_url || undefined,
              url: postUrl,
            },
            {
              publishToFacebook,
              publishToInstagram,
              publishToLinkedIn,
              publishToTwitter,
              publishToThreads,
            }
          );

          // Log dos resultados (em produção, você pode salvar isso no banco)
          console.log('Resultados da publicação em redes sociais:', socialResults);
        }
      } catch (socialError) {
        console.error('Erro ao publicar nas redes sociais:', socialError);
        // Não falha a criação do post se a publicação nas redes sociais falhar
      }
    }

    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateBlogPost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, excerpt, content, featured_image_url, author, is_published, category_ids, tag_ids } = req.body;

    const existingPost = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        categories: true,
        tags: true
      }
    });

    if (!existingPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    let slug = existingPost.slug;
    
    // Update slug if title changed
    if (title && title !== existingPost.title) {
      slug = slugify(title);
      
      // Ensure unique slug
      const postWithSameSlug = await prisma.blogPost.findFirst({
        where: { 
          slug,
          NOT: { id }
        }
      });

      if (postWithSameSlug) {
        slug = `${slug}-${uuidv4().slice(0, 8)}`;
      }
    }

    // Atualizar categorias se fornecido
    if (category_ids !== undefined) {
      // Deletar todas as categorias existentes
      await prisma.blogPostCategory.deleteMany({
        where: { blog_post_id: id }
      });

      // Criar novas associações se houver categorias
      if (category_ids && category_ids.length > 0) {
        await prisma.blogPostCategory.createMany({
          data: category_ids.map((categoryId: string) => ({
            blog_post_id: id,
            category_id: categoryId
          }))
        });
      }
    }

    // Atualizar tags se fornecido
    if (tag_ids !== undefined) {
      // Deletar todas as tags existentes
      await prisma.blogPostTag.deleteMany({
        where: { blog_post_id: id }
      });

      // Criar novas associações se houver tags
      if (tag_ids && tag_ids.length > 0) {
        await prisma.blogPostTag.createMany({
          data: tag_ids.map((tagId: string) => ({
            blog_post_id: id,
            tag_id: tagId
          }))
        });
      }
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        title: title || existingPost.title,
        slug,
        excerpt: excerpt !== undefined ? excerpt : existingPost.excerpt,
        content: content || existingPost.content,
        featured_image_url: featured_image_url !== undefined ? featured_image_url : existingPost.featured_image_url,
        author: author !== undefined ? author : existingPost.author,
        is_published: is_published !== undefined ? is_published : existingPost.is_published,
        published_at: is_published === true && !existingPost.is_published ? new Date() : existingPost.published_at
      },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    // Publicar nas redes sociais se solicitado e o post estiver publicado
    const finalIsPublished = is_published !== undefined ? is_published : post.is_published;
    if (finalIsPublished && (publishToFacebook || publishToInstagram || publishToLinkedIn || publishToTwitter || publishToThreads)) {
      try {
        const config = await prisma.configuration.findFirst();
        if (config) {
          const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
          const postUrl = `${baseUrl}/blog/${post.slug}`;
          
          const socialResults = await SocialMediaService.publishToSocialMedia(
            config,
            {
              title: post.title,
              excerpt: post.excerpt || undefined,
              content: post.content,
              featuredImageUrl: post.featured_image_url || undefined,
              url: postUrl,
            },
            {
              publishToFacebook,
              publishToInstagram,
              publishToLinkedIn,
              publishToTwitter,
              publishToThreads,
            }
          );

          // Log dos resultados (em produção, você pode salvar isso no banco)
          console.log('Resultados da publicação em redes sociais:', socialResults);
        }
      } catch (socialError) {
        console.error('Erro ao publicar nas redes sociais:', socialError);
        // Não falha a atualização do post se a publicação nas redes sociais falhar
      }
    }

    res.json(post);
  } catch (error) {
    console.error('Error updating blog post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteBlogPost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existingPost = await prisma.blogPost.findUnique({
      where: { id }
    });

    if (!existingPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Deletar imagem destacada se existir
    if (existingPost.featured_image_url && existingPost.featured_image_url.startsWith('/uploads/')) {
      try {
        const filename = existingPost.featured_image_url.split('/').pop();
        if (filename) {
          await FileService.deleteFile(filename);
        }
      } catch (error) {
        console.warn('Erro ao deletar imagem destacada:', error);
      }
    }

    await prisma.blogPost.delete({
      where: { id }
    });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Upload de imagem destacada
export const uploadBlogPostImage = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const { id } = req.params;

    // Valida o arquivo (apenas imagens)
    FileService.validateImageFile(req.file);

    // Faz upload do arquivo
    const uploadResult = await FileService.uploadFile(req.file);

    // Buscar post existente
    const existingPost = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!existingPost) {
      // Deletar arquivo se post não existir
      const filename = uploadResult.url.split('/').pop();
      if (filename) {
        await FileService.deleteFile(filename);
      }
      return res.status(404).json({ error: 'Post não encontrado' });
    }

    // Deletar imagem antiga se existir
    if (existingPost.featured_image_url && existingPost.featured_image_url.startsWith('/uploads/')) {
      try {
        const oldFilename = existingPost.featured_image_url.split('/').pop();
        if (oldFilename) {
          await FileService.deleteFile(oldFilename);
        }
      } catch (error) {
        console.warn('Erro ao deletar imagem antiga:', error);
      }
    }

    // Atualizar post com nova imagem
    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        featured_image_url: uploadResult.url,
      },
    });

    res.json({
      success: true,
      message: 'Imagem enviada com sucesso',
      data: uploadResult,
      post,
    });
  } catch (error: any) {
    console.error('Erro ao fazer upload da imagem:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao fazer upload da imagem',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
};

// Deletar imagem destacada
export const deleteBlogPostImage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existingPost = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!existingPost) {
      return res.status(404).json({ error: 'Post não encontrado' });
    }

    if (existingPost.featured_image_url && existingPost.featured_image_url.startsWith('/uploads/')) {
      try {
        const filename = existingPost.featured_image_url.split('/').pop();
        if (filename) {
          await FileService.deleteFile(filename);
        }
      } catch (error) {
        console.warn('Erro ao deletar imagem:', error);
      }
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        featured_image_url: null,
      },
    });

    res.json({
      success: true,
      message: 'Imagem removida com sucesso',
      post,
    });
  } catch (error: any) {
    console.error('Erro ao remover imagem:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao remover imagem',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
};