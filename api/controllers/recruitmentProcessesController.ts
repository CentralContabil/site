import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { AuthRequest } from '../middleware/auth.js';

const recruitmentProcessSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional().nullable(),
  position_id: z.string().min(1, 'Área de interesse é obrigatória'),
  status: z.enum(['draft', 'open', 'in_progress', 'closed', 'cancelled']).optional(),
  requirements: z.string().optional().nullable(),
  benefits: z.string().optional().nullable(),
  salary_range: z.string().optional().nullable(),
  work_mode: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  deadline: z.string().datetime().optional().nullable(),
});

const addCandidateSchema = z.object({
  application_id: z.string().min(1, 'Candidatura é obrigatória'),
  notes: z.string().optional().nullable(),
});

const updateCandidateSchema = z.object({
  status: z.enum(['pending', 'screening', 'interview', 'evaluation', 'approved', 'rejected', 'hired']).optional(),
  current_stage: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  rating: z.number().int().min(1).max(5).optional().nullable(),
  interview_date: z.string().datetime().optional().nullable(),
  interview_notes: z.string().optional().nullable(),
  evaluation_score: z.number().int().min(0).max(100).optional().nullable(),
  rejection_reason: z.string().optional().nullable(),
  hired_date: z.string().datetime().optional().nullable(),
});

// Listar todos os processos (admin)
export const getAllRecruitmentProcesses = async (req: AuthRequest, res: Response) => {
  try {
    const { status, positionId } = req.query;
    
    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    if (positionId && positionId !== 'all') {
      where.position_id = positionId;
    }

    const processes = await prisma.recruitmentProcess.findMany({
      where,
      include: {
        position: true,
        candidates: {
          include: {
            application: true,
          },
        },
        _count: {
          select: { candidates: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    res.json({ success: true, processes });
  } catch (error) {
    console.error('❌ Get all recruitment processes error:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar processos seletivos' });
  }
};

// Buscar processo por ID (admin)
export const getRecruitmentProcessById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const process = await prisma.recruitmentProcess.findUnique({
      where: { id },
      include: {
        position: true,
        candidates: {
          include: {
            application: {
              include: {
                job_position: true,
              },
            },
          },
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!process) {
      return res.status(404).json({
        success: false,
        error: 'Processo seletivo não encontrado',
      });
    }

    res.json({ success: true, process });
  } catch (error) {
    console.error('❌ Get recruitment process by id error:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar processo seletivo' });
  }
};

// Criar processo (admin)
export const createRecruitmentProcess = async (req: AuthRequest, res: Response) => {
  try {
    const data = recruitmentProcessSchema.parse(req.body);

    // Verificar se a área de interesse existe
    const position = await prisma.jobPosition.findUnique({
      where: { id: data.position_id },
    });

    if (!position) {
      return res.status(404).json({
        success: false,
        error: 'Área de interesse não encontrada',
      });
    }

    const process = await prisma.recruitmentProcess.create({
      data: {
        title: data.title,
        description: data.description || null,
        position_id: data.position_id,
        status: data.status || 'draft',
        requirements: data.requirements || null,
        benefits: data.benefits || null,
        salary_range: data.salary_range || null,
        work_mode: data.work_mode || null,
        location: data.location || null,
        deadline: data.deadline ? new Date(data.deadline) : null,
        created_by: req.user?.id || null,
      },
      include: {
        position: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Processo seletivo criado com sucesso',
      process,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.issues,
      });
    }

    console.error('❌ Create recruitment process error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar processo seletivo',
    });
  }
};

// Atualizar processo (admin)
export const updateRecruitmentProcess = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = recruitmentProcessSchema.partial().parse(req.body);

    const existing = await prisma.recruitmentProcess.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Processo seletivo não encontrado',
      });
    }

    // Se estiver mudando a área de interesse, verificar se existe
    if (data.position_id && data.position_id !== existing.position_id) {
      const position = await prisma.jobPosition.findUnique({
        where: { id: data.position_id },
      });

      if (!position) {
        return res.status(404).json({
          success: false,
          error: 'Área de interesse não encontrada',
        });
      }
    }

    const process = await prisma.recruitmentProcess.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description !== undefined ? data.description : existing.description,
        position_id: data.position_id || existing.position_id,
        status: data.status || existing.status,
        requirements: data.requirements !== undefined ? data.requirements : existing.requirements,
        benefits: data.benefits !== undefined ? data.benefits : existing.benefits,
        salary_range: data.salary_range !== undefined ? data.salary_range : existing.salary_range,
        work_mode: data.work_mode !== undefined ? data.work_mode : existing.work_mode,
        location: data.location !== undefined ? data.location : existing.location,
        deadline: data.deadline ? new Date(data.deadline) : (data.deadline === null ? null : existing.deadline),
      },
      include: {
        position: true,
      },
    });

    res.json({
      success: true,
      message: 'Processo seletivo atualizado com sucesso',
      process,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.issues,
      });
    }

    console.error('❌ Update recruitment process error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar processo seletivo',
    });
  }
};

// Deletar processo (admin)
export const deleteRecruitmentProcess = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.recruitmentProcess.findUnique({
      where: { id },
      include: {
        candidates: true,
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Processo seletivo não encontrado',
      });
    }

    // Verificar se há candidatos no processo
    if (existing.candidates.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Não é possível excluir este processo pois existem ${existing.candidates.length} candidato(s) associado(s)`,
      });
    }

    await prisma.recruitmentProcess.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Processo seletivo removido com sucesso',
    });
  } catch (error) {
    console.error('❌ Delete recruitment process error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao remover processo seletivo',
    });
  }
};

// Adicionar candidato ao processo (admin)
export const addCandidateToProcess = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params; // process_id
    const data = addCandidateSchema.parse(req.body);

    // Verificar se o processo existe
    const process = await prisma.recruitmentProcess.findUnique({
      where: { id },
    });

    if (!process) {
      return res.status(404).json({
        success: false,
        error: 'Processo seletivo não encontrado',
      });
    }

    // Verificar se a candidatura existe
    const application = await prisma.jobApplication.findUnique({
      where: { id: data.application_id },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Candidatura não encontrada',
      });
    }

    // Verificar se o candidato já está no processo
    const existing = await prisma.recruitmentCandidate.findUnique({
      where: {
        process_id_application_id: {
          process_id: id,
          application_id: data.application_id,
        },
      },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Este candidato já está no processo seletivo',
      });
    }

    const candidate = await prisma.recruitmentCandidate.create({
      data: {
        process_id: id,
        application_id: data.application_id,
        status: 'pending',
        notes: data.notes || null,
      },
      include: {
        application: {
          include: {
            job_position: true,
          },
        },
        process: {
          include: {
            position: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Candidato adicionado ao processo com sucesso',
      candidate,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.issues,
      });
    }

    console.error('❌ Add candidate to process error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao adicionar candidato ao processo',
    });
  }
};

// Atualizar status do candidato no processo (admin)
export const updateCandidateStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { processId, candidateId } = req.params;
    const data = updateCandidateSchema.parse(req.body);

    const candidate = await prisma.recruitmentCandidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        error: 'Candidato não encontrado no processo',
      });
    }

    if (candidate.process_id !== processId) {
      return res.status(400).json({
        success: false,
        error: 'Candidato não pertence a este processo',
      });
    }

    const updated = await prisma.recruitmentCandidate.update({
      where: { id: candidateId },
      data: {
        status: data.status || candidate.status,
        current_stage: data.current_stage !== undefined ? data.current_stage : candidate.current_stage,
        notes: data.notes !== undefined ? data.notes : candidate.notes,
        rating: data.rating !== undefined ? data.rating : candidate.rating,
        interview_date: data.interview_date ? new Date(data.interview_date) : (data.interview_date === null ? null : candidate.interview_date),
        interview_notes: data.interview_notes !== undefined ? data.interview_notes : candidate.interview_notes,
        evaluation_score: data.evaluation_score !== undefined ? data.evaluation_score : candidate.evaluation_score,
        rejection_reason: data.rejection_reason !== undefined ? data.rejection_reason : candidate.rejection_reason,
        hired_date: data.hired_date ? new Date(data.hired_date) : (data.hired_date === null ? null : candidate.hired_date),
      },
      include: {
        application: {
          include: {
            job_position: true,
          },
        },
        process: {
          include: {
            position: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Status do candidato atualizado com sucesso',
      candidate: updated,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.issues,
      });
    }

    console.error('❌ Update candidate status error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar status do candidato',
    });
  }
};

// Remover candidato do processo (admin)
export const removeCandidateFromProcess = async (req: AuthRequest, res: Response) => {
  try {
    const { processId, candidateId } = req.params;

    const candidate = await prisma.recruitmentCandidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        error: 'Candidato não encontrado no processo',
      });
    }

    if (candidate.process_id !== processId) {
      return res.status(400).json({
        success: false,
        error: 'Candidato não pertence a este processo',
      });
    }

    await prisma.recruitmentCandidate.delete({
      where: { id: candidateId },
    });

    res.json({
      success: true,
      message: 'Candidato removido do processo com sucesso',
    });
  } catch (error) {
    console.error('❌ Remove candidate from process error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao remover candidato do processo',
    });
  }
};

// Buscar candidatos disponíveis para adicionar ao processo (admin)
export const getAvailableCandidates = async (req: AuthRequest, res: Response) => {
  try {
    const { processId } = req.params;

    // Buscar o processo para obter a área de interesse
    const process = await prisma.recruitmentProcess.findUnique({
      where: { id: processId },
      include: {
        candidates: true,
      },
    });

    if (!process) {
      return res.status(404).json({
        success: false,
        error: 'Processo seletivo não encontrado',
      });
    }

    // Buscar candidaturas da mesma área de interesse que ainda não estão no processo
    const candidateIds = process.candidates.map(c => c.application_id);

    const candidates = await prisma.jobApplication.findMany({
      where: {
        position_id: process.position_id,
        id: {
          notIn: candidateIds,
        },
      },
      include: {
        job_position: true,
      },
      orderBy: { created_at: 'desc' },
    });

    res.json({ success: true, candidates });
  } catch (error) {
    console.error('❌ Get available candidates error:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar candidatos disponíveis' });
  }
};

