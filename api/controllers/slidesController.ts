import { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../lib/db.js';

const slideSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  subtitle: z.string().optional(),
  buttonText: z.string().optional(),
  buttonLink: z.string().url('Link deve ser uma URL válida').optional(),
  order: z.number().int().min(0, 'Ordem deve ser um número positivo'),
  isActive: z.boolean().optional(),
});

export const getSlides = async (req: Request, res: Response) => {
  try {
    const slides = db.getSlidesSync(true);

    res.json({ slides });
  } catch (error) {
    console.error('Get slides error:', error);
    res.status(500).json({ error: 'Erro ao buscar slides' });
  }
};

export const getAllSlides = async (req: Request, res: Response) => {
  try {
    const slides = db.getSlidesSync();

    res.json({ slides });
  } catch (error) {
    console.error('Get all slides error:', error);
    res.status(500).json({ error: 'Erro ao buscar slides' });
  }
};

export const createSlide = async (req: Request, res: Response) => {
  try {
    const data = slideSchema.parse(req.body);

    if (!req.file) {
      return res.status(400).json({ error: 'Imagem do slide é obrigatória' });
    }
    const slide = db.createSlideSync({
      title: data.title,
      subtitle: data.subtitle,
      image_url: `/uploads/${req.file.filename}`,
      button_text: data.buttonText,
      button_link: data.buttonLink,
      order: data.order,
      is_active: data.isActive ?? true,
    });

    res.status(201).json({ slide });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.issues });
    }
    console.error('Create slide error:', error);
    res.status(500).json({ error: 'Erro ao criar slide' });
  }
};

export const updateSlide = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = slideSchema.partial().parse(req.body);
    const existingSlide = db.getSlide(id);

    if (!existingSlide) {
      return res.status(404).json({ error: 'Slide não encontrado' });
    }

    let imageUrl = existingSlide.image_url;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const updatedData = {
      title: data.title ?? existingSlide.title,
      subtitle: data.subtitle ?? existingSlide.subtitle,
      image_url: imageUrl,
      button_text: data.buttonText ?? existingSlide.button_text,
      button_link: data.buttonLink ?? existingSlide.button_link,
      order: data.order ?? existingSlide.order,
      is_active: data.isActive ?? existingSlide.is_active,
    };

    const slide = db.updateSlideSync(id, updatedData);

    res.json({ slide });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.issues });
    }
    console.error('Update slide error:', error);
    res.status(500).json({ error: 'Erro ao atualizar slide' });
  }
};

export const deleteSlide = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existingSlide = db.getSlide(id);

    if (!existingSlide) {
      return res.status(404).json({ error: 'Slide não encontrado' });
    }

    db.deleteSlideSync(id);

    res.json({ message: 'Slide removido com sucesso' });
  } catch (error) {
    console.error('Delete slide error:', error);
    res.status(500).json({ error: 'Erro ao remover slide' });
  }
};
