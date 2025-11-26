import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../middleware/auth.js';

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// GET /api/tags - Listar todas as tags
export const getTags = async (req: Request, res: Response) => {
  try {
    const { active } = req.query;
    
    const where = active === 'true' 
      ? { is_active: true }
      : {};

    const tags = await prisma.tag.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });

    res.json({ tags });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/tags/:id - Buscar tag por ID
export const getTagById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });

    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    res.json(tag);
  } catch (error) {
    console.error('Error fetching tag:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/tags - Criar tag (admin)
export const createTag = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, color, is_active } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    let slug = slugify(name);
    
    // Ensure unique slug
    const existingTag = await prisma.tag.findUnique({
      where: { slug }
    });

    if (existingTag) {
      slug = `${slug}-${uuidv4().slice(0, 8)}`;
    }

    const tag = await prisma.tag.create({
      data: {
        name,
        slug,
        description,
        color: color || '#6b7280',
        is_active: is_active !== undefined ? is_active : true
      }
    });

    res.status(201).json(tag);
  } catch (error) {
    console.error('Error creating tag:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT /api/tags/:id - Atualizar tag (admin)
export const updateTag = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, color, is_active } = req.body;

    const existingTag = await prisma.tag.findUnique({
      where: { id }
    });

    if (!existingTag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    let slug = existingTag.slug;
    
    // Se o nome mudou, atualizar o slug
    if (name && name !== existingTag.name) {
      slug = slugify(name);
      
      // Verificar se o novo slug já existe
      const slugExists = await prisma.tag.findUnique({
        where: { slug }
      });

      if (slugExists && slugExists.id !== id) {
        slug = `${slug}-${uuidv4().slice(0, 8)}`;
      }
    }

    const tag = await prisma.tag.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        color,
        is_active
      }
    });

    res.json(tag);
  } catch (error) {
    console.error('Error updating tag:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/tags/:id - Deletar tag (admin)
export const deleteTag = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });

    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    // Verificar se há posts associados
    if (tag._count.posts > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete tag with associated posts',
        postsCount: tag._count.posts
      });
    }

    await prisma.tag.delete({
      where: { id }
    });

    res.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    console.error('Error deleting tag:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};




