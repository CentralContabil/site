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

// GET /api/categories - Listar todas as categorias
export const getCategories = async (req: Request, res: Response) => {
  try {
    const { active } = req.query;
    
    const where = active === 'true' 
      ? { is_active: true }
      : {};

    const categories = await prisma.category.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { 
            posts: true 
          }
        }
      }
    });

    // Adicionar contagem de posts para cada categoria
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const postCount = await prisma.blogPostCategory.count({
          where: { category_id: category.id }
        });
        return {
          ...category,
          _count: {
            posts: postCount
          }
        };
      })
    );

    res.json({ categories: categoriesWithCount });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/categories/:id - Buscar categoria por ID
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Adicionar contagem de posts
    const postCount = await prisma.blogPostCategory.count({
      where: { category_id: category.id }
    });

    res.json({ 
      category: {
        ...category,
        _count: {
          posts: postCount
        }
      }
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/categories - Criar categoria (admin)
export const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, color, is_active } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    let slug = slugify(name);
    
    // Ensure unique slug
    const existingCategory = await prisma.category.findUnique({
      where: { slug }
    });

    if (existingCategory) {
      slug = `${slug}-${uuidv4().slice(0, 8)}`;
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        color: color || '#3bb664',
        is_active: is_active !== undefined ? is_active : true
      }
    });

    res.status(201).json({ category });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT /api/categories/:id - Atualizar categoria (admin)
export const updateCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, color, is_active } = req.body;

    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    let slug = existingCategory.slug;
    
    // Se o nome mudou, atualizar o slug
    if (name && name !== existingCategory.name) {
      slug = slugify(name);
      
      // Verificar se o novo slug já existe
      const slugExists = await prisma.category.findUnique({
        where: { slug }
      });

      if (slugExists && slugExists.id !== id) {
        slug = `${slug}-${uuidv4().slice(0, 8)}`;
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        color,
        is_active
      }
    });

    res.json({ category });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/categories/:id - Deletar categoria (admin)
export const deleteCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Verificar se há posts associados
    if (category._count.posts > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category with associated posts',
        postsCount: category._count.posts
      });
    }

    await prisma.category.delete({
      where: { id }
    });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};




