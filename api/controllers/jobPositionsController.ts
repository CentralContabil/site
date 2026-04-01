import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { AuthRequest } from '../middleware/auth.js';

const jobPositionSchema = z.object({
  name: z.string().min(1, 'Nome da área é obrigatório'),
  description: z.string().optional().nullable(),
  is_active: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

// Listar todas as áreas (público - apenas ativas)
export const getJobPositions = async (req: Request, res: Response) => {
  try {
    const positions = await prisma.jobPosition.findMany({
      where: { is_active: true },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });

    res.json({ success: true, positions });
  } catch (error) {
    console.error('❌ Get job positions error:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar áreas de interesse' });
  }
};

// Listar todas as áreas (admin - todas)
export const getAllJobPositions = async (req: AuthRequest, res: Response) => {
  try {
    const positions = await prisma.jobPosition.findMany({
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });

    res.json({ success: true, positions });
  } catch (error) {
    console.error('❌ Get all job positions error:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar áreas de interesse' });
  }
};

// Buscar área por ID (admin)
export const getJobPositionById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const position = await prisma.jobPosition.findUnique({
      where: { id },
    });

    if (!position) {
      return res.status(404).json({
        success: false,
        error: 'Área de interesse não encontrada',
      });
    }

    res.json({ success: true, position });
  } catch (error) {
    console.error('❌ Get job position by id error:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar área de interesse' });
  }
};

// Criar área (admin)
export const createJobPosition = async (req: AuthRequest, res: Response) => {
  try {
    const data = jobPositionSchema.parse(req.body);

    // Verificar se já existe uma área com o mesmo nome
    const existing = await prisma.jobPosition.findFirst({
      where: { name: data.name },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Já existe uma área de interesse com este nome',
      });
    }

    const position = await prisma.jobPosition.create({
      data: {
        name: data.name,
        description: data.description || null,
        is_active: data.is_active ?? true,
        order: data.order ?? 0,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Área de interesse criada com sucesso',
      position,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.issues,
      });
    }

    console.error('❌ Create job position error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar área de interesse',
    });
  }
};

// Atualizar área (admin)
export const updateJobPosition = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = jobPositionSchema.parse(req.body);

    const existing = await prisma.jobPosition.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Área de interesse não encontrada',
      });
    }

    // Verificar se já existe outra área com o mesmo nome
    if (data.name && data.name !== existing.name) {
      const duplicate = await prisma.jobPosition.findFirst({
        where: {
          name: data.name,
          id: { not: id },
        },
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          error: 'Já existe uma área de interesse com este nome',
        });
      }
    }

    const position = await prisma.jobPosition.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description !== undefined ? data.description : existing.description,
        is_active: data.is_active !== undefined ? data.is_active : existing.is_active,
        order: data.order !== undefined ? data.order : existing.order,
      },
    });

    res.json({
      success: true,
      message: 'Área de interesse atualizada com sucesso',
      position,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.issues,
      });
    }

    console.error('❌ Update job position error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar área de interesse',
    });
  }
};

// Deletar área (admin)
export const deleteJobPosition = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.jobPosition.findUnique({
      where: { id },
      include: {
        job_applications: true,
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Área de interesse não encontrada',
      });
    }

    // Verificar se há candidaturas associadas
    if (existing.job_applications.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Não é possível excluir esta área pois existem ${existing.job_applications.length} candidatura(s) associada(s)`,
      });
    }

    await prisma.jobPosition.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Área de interesse removida com sucesso',
    });
  } catch (error) {
    console.error('❌ Delete job position error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao remover área de interesse',
    });
  }
};


