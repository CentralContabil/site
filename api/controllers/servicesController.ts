import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

const serviceSchema = z.object({
  name: z.string().min(1, 'Nome do serviço é obrigatório'),
  slug: z.string().optional(),
  description: z.string().min(10, 'Descrição deve ter no mínimo 10 caracteres'),
  content: z.string().optional(),
  icon: z.string().optional(),
  imageUrl: z.string().optional(),
  image_url: z.string().optional(),
  order: z.number().int().min(0, 'Ordem deve ser um número positivo'),
  isActive: z.boolean().optional(),
});

export const getServices = async (req: Request, res: Response) => {
  try {
    const services = await prisma.service.findMany({
      where: { is_active: true },
      orderBy: { order: 'asc' },
    });

    console.log('📋 Services encontrados no banco:', services.length);
    console.log('📋 Primeiro serviço:', services[0] ? {
      id: services[0].id,
      name: services[0].name,
      slug: services[0].slug,
      hasContent: !!services[0].content
    } : 'Nenhum serviço');

    res.json({ services });
  } catch (error) {
    console.error('❌ Get services error:', error);
    res.status(500).json({ error: 'Erro ao buscar serviços' });
  }
};

export const getAllServices = async (req: Request, res: Response) => {
  try {
    const services = await prisma.service.findMany({
      orderBy: { order: 'asc' },
    });

    res.json({ services });
  } catch (error) {
    console.error('Get all services error:', error);
    res.status(500).json({ error: 'Erro ao buscar serviços' });
  }
};

export const getServiceBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const service = await prisma.service.findUnique({
      where: { slug },
    });

    if (!service) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    res.json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createService = async (req: Request, res: Response) => {
  try {
    const data = serviceSchema.parse(req.body);
    
    let slug = data.slug || slugify(data.name);
    
    // Ensure unique slug
    const existingService = await prisma.service.findUnique({
      where: { slug }
    });

    if (existingService) {
      slug = `${slug}-${Date.now()}`;
    }

    const service = await prisma.service.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        content: data.content,
        icon: data.icon,
        image_url: data.imageUrl || data.image_url,
        order: data.order,
        is_active: data.isActive ?? true,
      },
    });

    res.status(201).json({ service });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.issues });
    }
    console.error('Create service error:', error);
    res.status(500).json({ error: 'Erro ao criar serviço' });
  }
};

export const updateService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = serviceSchema.partial().parse(req.body);
    
    const existingService = await prisma.service.findUnique({
      where: { id }
    });

    if (!existingService) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    let slug = existingService.slug;
    
    // Update slug if name changed
    if (data.name && data.name !== existingService.name) {
      slug = data.slug || slugify(data.name);
      
      // Ensure unique slug
      const serviceWithSameSlug = await prisma.service.findFirst({
        where: { 
          slug,
          NOT: { id }
        }
      });

      if (serviceWithSameSlug) {
        slug = `${slug}-${Date.now()}`;
      }
    } else if (data.slug && data.slug !== existingService.slug) {
      slug = data.slug;
      
      // Ensure unique slug
      const serviceWithSameSlug = await prisma.service.findFirst({
        where: { 
          slug,
          NOT: { id }
        }
      });

      if (serviceWithSameSlug) {
        return res.status(400).json({ error: 'Slug já existe' });
      }
    }

    const service = await prisma.service.update({
      where: { id },
      data: {
        name: data.name ?? existingService.name,
        slug,
        description: data.description ?? existingService.description,
        content: data.content !== undefined ? data.content : existingService.content,
        icon: data.icon ?? existingService.icon,
        image_url: (data.imageUrl || data.image_url) ?? existingService.image_url,
        order: data.order ?? existingService.order,
        is_active: data.isActive ?? existingService.is_active,
      },
    });

    res.json({ service });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.issues });
    }
    console.error('Update service error:', error);
    res.status(500).json({ error: 'Erro ao atualizar serviço' });
  }
};

export const deleteService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existingService = await prisma.service.findUnique({
      where: { id }
    });

    if (!existingService) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    await prisma.service.delete({
      where: { id }
    });

    res.json({ message: 'Serviço removido com sucesso' });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ error: 'Erro ao remover serviço' });
  }
};
