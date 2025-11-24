import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { FileService } from '../services/fileService.js';

const testimonialSchema = z.object({
  clientName: z.string().min(1, 'Nome do cliente é obrigatório'),
  company: z.string().optional(),
  testimonialText: z.string().min(10, 'Depoimento deve ter no mínimo 10 caracteres'),
  clientImageUrl: z.string().optional(),
  mediaType: z.enum(['image', 'video']).optional(),
  mediaUrl: z.string().optional(),
  order: z.number().int().min(0, 'Ordem deve ser um número positivo'),
  isActive: z.boolean().optional(),
});

export const getTestimonials = async (req: Request, res: Response) => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { is_active: true },
      orderBy: { order: 'asc' },
    });
    res.json({ testimonials });
  } catch (error) {
    console.error('Get testimonials error:', error);
    res.status(500).json({ error: 'Erro ao buscar depoimentos' });
  }
};

export const getAllTestimonials = async (req: AuthRequest, res: Response) => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { order: 'asc' },
    });
    res.json({ testimonials });
  } catch (error) {
    console.error('Get all testimonials error:', error);
    res.status(500).json({ error: 'Erro ao buscar depoimentos' });
  }
};

export const createTestimonial = async (req: AuthRequest, res: Response) => {
  try {
    const data = testimonialSchema.parse(req.body);
    const testimonial = await prisma.testimonial.create({
      data: {
        client_name: data.clientName,
        company: data.company,
        testimonial_text: data.testimonialText,
        client_image_url: data.clientImageUrl,
        media_type: data.mediaType || (data.clientImageUrl ? 'image' : null),
        media_url: data.mediaUrl || data.clientImageUrl,
        order: data.order,
        is_active: data.isActive ?? true,
      },
    });

    res.status(201).json({ testimonial });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.issues });
    }
    console.error('Create testimonial error:', error);
    res.status(500).json({ error: 'Erro ao criar depoimento' });
  }
};

export const updateTestimonial = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = testimonialSchema.partial().parse(req.body);
    
    const existingTestimonial = await prisma.testimonial.findUnique({
      where: { id },
    });

    if (!existingTestimonial) {
      return res.status(404).json({ error: 'Depoimento não encontrado' });
    }

    const updateData: any = {};
    if (data.clientName !== undefined) updateData.client_name = data.clientName;
    if (data.company !== undefined) updateData.company = data.company;
    if (data.testimonialText !== undefined) updateData.testimonial_text = data.testimonialText;
    if (data.clientImageUrl !== undefined) updateData.client_image_url = data.clientImageUrl;
    if (data.mediaType !== undefined) updateData.media_type = data.mediaType;
    if (data.mediaUrl !== undefined) updateData.media_url = data.mediaUrl;
    if (data.order !== undefined) updateData.order = data.order;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: updateData,
    });

    res.json({ testimonial });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.issues });
    }
    console.error('Update testimonial error:', error);
    res.status(500).json({ error: 'Erro ao atualizar depoimento' });
  }
};

export const deleteTestimonial = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const existingTestimonial = await prisma.testimonial.findUnique({
      where: { id },
    });

    if (!existingTestimonial) {
      return res.status(404).json({ error: 'Depoimento não encontrado' });
    }

    // Deletar arquivo de mídia se existir
    if (existingTestimonial.media_url && existingTestimonial.media_url.startsWith('/uploads/')) {
      try {
        const filename = existingTestimonial.media_url.split('/').pop();
        if (filename) {
          await FileService.deleteFile(filename);
        }
      } catch (error) {
        console.warn('Erro ao deletar arquivo de mídia:', error);
      }
    }

    await prisma.testimonial.delete({
      where: { id },
    });

    res.json({ message: 'Depoimento removido com sucesso' });
  } catch (error) {
    console.error('Delete testimonial error:', error);
    res.status(500).json({ error: 'Erro ao remover depoimento' });
  }
};

// Upload de mídia (imagem ou vídeo)
export const uploadTestimonialMedia = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const { id } = req.params;
    const { mediaType = 'image' } = req.body;

    if (!['image', 'video'].includes(mediaType)) {
      return res.status(400).json({ error: 'Tipo de mídia inválido. Use "image" ou "video"' });
    }

    // Validação de arquivo
    if (mediaType === 'image') {
      FileService.validateImageFile(req.file);
    } else {
      // Validação de vídeo
      const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
      const maxVideoSize = 50 * 1024 * 1024; // 50MB
      
      if (!allowedVideoTypes.includes(req.file.mimetype)) {
        throw new Error('Tipo de arquivo não permitido. Use MP4, WebM ou OGG.');
      }
      
      if (req.file.size > maxVideoSize) {
        throw new Error('Arquivo muito grande. Máximo 50MB.');
      }
    }

    // Upload do arquivo
    const uploadResult = await FileService.uploadFile(req.file);

    // Buscar depoimento existente
    const existingTestimonial = await prisma.testimonial.findUnique({
      where: { id },
    });

    if (!existingTestimonial) {
      // Deletar arquivo se depoimento não existir
      const filename = uploadResult.url.split('/').pop();
      if (filename) {
        await FileService.deleteFile(filename);
      }
      return res.status(404).json({ error: 'Depoimento não encontrado' });
    }

    // Deletar mídia antiga se existir
    if (existingTestimonial.media_url && existingTestimonial.media_url.startsWith('/uploads/')) {
      try {
        const oldFilename = existingTestimonial.media_url.split('/').pop();
        if (oldFilename) {
          await FileService.deleteFile(oldFilename);
        }
      } catch (error) {
        console.warn('Erro ao deletar mídia antiga:', error);
      }
    }

    // Atualizar depoimento com nova mídia
    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: {
        media_type: mediaType,
        media_url: uploadResult.url,
        client_image_url: mediaType === 'image' ? uploadResult.url : existingTestimonial.client_image_url,
      },
    });

    res.json({
      success: true,
      message: 'Mídia enviada com sucesso',
      data: uploadResult,
      testimonial,
    });
  } catch (error: any) {
    console.error('Erro ao fazer upload da mídia:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao fazer upload da mídia',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
};
