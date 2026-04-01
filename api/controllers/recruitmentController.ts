import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { AuthRequest } from '../middleware/auth.js';

// Schemas de validação
const createProcessSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional().nullable(),
  position_id: z.string().min(1, 'Área de interesse é obrigatória'),
  status: z.enum(['open', 'in_progress', 'closed', 'cancelled']).optional(),
  close_date: z.string().optional().nullable(),
  expected_start_date: z.string().optional().nullable(),
});

const updateProcessSchema = createProcessSchema.partial();

const createStageSchema = z.object({
  name: z.string().min(1, 'Nome da etapa é obrigatório'),
  description: z.string().optional().nullable(),
  order: z.number().int().min(0),
  is_active: z.boolean().optional(),
});

const updateStageSchema = createStageSchema.partial();

const addCandidateSchema = z.object({
  application_id: z.string().optional().nullable(),
  candidate_name: z.string().optional(),
  candidate_email: z.string().email().optional(),
  candidate_phone: z.string().optional(),
});

const updateCandidateSchema = z.object({
  status: z.enum(['pending', 'in_stage', 'approved', 'rejected', 'withdrawn']).optional(),
  current_stage_id: z.string().optional().nullable(),
  score: z.number().min(0).max(10).optional().nullable(),
  notes: z.string().optional().nullable(),
});

const evaluateStageSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
  score: z.number().min(0).max(10).optional().nullable(),
  feedback: z.string().optional().nullable(),
});

// ==================== PROCESSOS SELETIVOS ====================

export const getRecruitmentProcesses = async (req: AuthRequest, res: Response) => {
  try {
    const { status, position_id } = req.query;
    
    const where: any = {};
    if (status && status !== 'all') {
      where.status = status as string;
    }
    if (position_id && position_id !== 'all') {
      where.position_id = position_id as string;
    }

    const processes = await prisma.recruitmentProcess.findMany({
      where,
      include: {
        position: true,
        stages: {
          orderBy: { order: 'asc' },
        },
        candidates: {
          include: {
            application: true,
            current_stage: true,
          },
        },
        _count: {
          select: {
            candidates: true,
            stages: true,
          },
        },
      },
      orderBy: { open_date: 'desc' },
    });

    res.json({ success: true, processes });
  } catch (error) {
    console.error('❌ Get recruitment processes error:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar processos seletivos' });
  }
};

export const getRecruitmentProcessById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const process = await prisma.recruitmentProcess.findUnique({
      where: { id },
      include: {
        position: true,
        stages: {
          orderBy: { order: 'asc' },
        },
        candidates: {
          include: {
            application: {
              include: {
                job_position: true,
              },
            },
            current_stage: true,
            stage_history: {
              include: {
                stage: true,
              },
              orderBy: { created_at: 'desc' },
            },
            notes_history: {
              orderBy: { created_at: 'desc' },
            },
          },
          orderBy: { added_at: 'desc' },
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

export const createRecruitmentProcess = async (req: AuthRequest, res: Response) => {
  try {
    const data = createProcessSchema.parse(req.body);
    const userId = req.user?.id;

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
        status: data.status || 'open',
        close_date: data.close_date ? new Date(data.close_date) : null,
        expected_start_date: data.expected_start_date ? new Date(data.expected_start_date) : null,
        created_by: userId || null,
      },
      include: {
        position: true,
        stages: true,
        candidates: true,
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

export const updateRecruitmentProcess = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = updateProcessSchema.parse(req.body);

    const existing = await prisma.recruitmentProcess.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Processo seletivo não encontrado',
      });
    }

    const process = await prisma.recruitmentProcess.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description !== undefined ? data.description : existing.description,
        position_id: data.position_id || existing.position_id,
        status: data.status || existing.status,
        close_date: data.close_date ? new Date(data.close_date) : existing.close_date,
        expected_start_date: data.expected_start_date ? new Date(data.expected_start_date) : existing.expected_start_date,
      },
      include: {
        position: true,
        stages: {
          orderBy: { order: 'asc' },
        },
        candidates: true,
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

// ==================== ETAPAS DO PROCESSO ====================

export const createRecruitmentStage = async (req: AuthRequest, res: Response) => {
  try {
    const { processId } = req.params;
    const data = createStageSchema.parse(req.body);

    // Verificar se o processo existe
    const process = await prisma.recruitmentProcess.findUnique({
      where: { id: processId },
    });

    if (!process) {
      return res.status(404).json({
        success: false,
        error: 'Processo seletivo não encontrado',
      });
    }

    const stage = await prisma.recruitmentStage.create({
      data: {
        process_id: processId,
        name: data.name,
        description: data.description || null,
        order: data.order,
        is_active: data.is_active ?? true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Etapa criada com sucesso',
      stage,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.issues,
      });
    }

    console.error('❌ Create recruitment stage error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar etapa',
    });
  }
};

export const updateRecruitmentStage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = updateStageSchema.parse(req.body);

    const existing = await prisma.recruitmentStage.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Etapa não encontrada',
      });
    }

    const stage = await prisma.recruitmentStage.update({
      where: { id },
      data: {
        name: data.name || existing.name,
        description: data.description !== undefined ? data.description : existing.description,
        order: data.order !== undefined ? data.order : existing.order,
        is_active: data.is_active !== undefined ? data.is_active : existing.is_active,
      },
    });

    res.json({
      success: true,
      message: 'Etapa atualizada com sucesso',
      stage,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.issues,
      });
    }

    console.error('❌ Update recruitment stage error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar etapa',
    });
  }
};

export const deleteRecruitmentStage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.recruitmentStage.findUnique({
      where: { id },
      include: {
        candidate_stages: true,
        candidates_current: true,
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Etapa não encontrada',
      });
    }

    if (existing.candidates_current.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Não é possível excluir etapa com candidatos na etapa atual',
      });
    }

    await prisma.recruitmentStage.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Etapa removida com sucesso',
    });
  } catch (error) {
    console.error('❌ Delete recruitment stage error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao remover etapa',
    });
  }
};

// ==================== CANDIDATOS ====================

export const getAvailableCandidates = async (req: AuthRequest, res: Response) => {
  try {
    const { processId } = req.params;

    // Verificar se o processo existe
    const process = await prisma.recruitmentProcess.findUnique({
      where: { id: processId },
      include: {
        position: true,
      },
    });

    if (!process) {
      return res.status(404).json({
        success: false,
        error: 'Processo seletivo não encontrado',
      });
    }

    // Buscar candidaturas da mesma área de interesse que ainda não estão no processo
    const candidatesInProcess = await prisma.recruitmentCandidate.findMany({
      where: { process_id: processId },
      select: { application_id: true },
    });

    const applicationIdsInProcess = candidatesInProcess
      .map(c => c.application_id)
      .filter(id => id !== null) as string[];

    const availableApplications = await prisma.jobApplication.findMany({
      where: {
        position_id: process.position_id,
        id: {
          notIn: applicationIdsInProcess.length > 0 ? applicationIdsInProcess : [],
        },
      },
      include: {
        job_position: true,
      },
      orderBy: { created_at: 'desc' },
    });

    res.json({
      success: true,
      candidates: availableApplications,
    });
  } catch (error) {
    console.error('❌ Get available candidates error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar candidatos disponíveis',
    });
  }
};

export const addCandidateToProcess = async (req: AuthRequest, res: Response) => {
  try {
    const { processId } = req.params;
    const data = addCandidateSchema.parse(req.body);

    // Verificar se o processo existe
    const process = await prisma.recruitmentProcess.findUnique({
      where: { id: processId },
      include: {
        stages: {
          orderBy: { order: 'asc' },
          where: { is_active: true },
        },
      },
    });

    if (!process) {
      return res.status(404).json({
        success: false,
        error: 'Processo seletivo não encontrado',
      });
    }

    let application = null;
    if (data.application_id) {
      application = await prisma.jobApplication.findUnique({
        where: { id: data.application_id },
      });

      if (!application) {
        return res.status(404).json({
          success: false,
          error: 'Candidatura não encontrada',
        });
      }

      // Verificar se já está no processo
      const existing = await prisma.recruitmentCandidate.findFirst({
        where: {
          process_id: processId,
          application_id: data.application_id,
        },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          error: 'Candidato já está neste processo seletivo',
        });
      }
    } else {
      // Adicionar candidato manualmente (sem candidatura)
      if (!data.candidate_name || !data.candidate_email) {
        return res.status(400).json({
          success: false,
          error: 'Nome e email são obrigatórios para candidatos manuais',
        });
      }
    }

    // Primeira etapa ativa
    const firstStage = process.stages[0];

    const candidate = await prisma.recruitmentCandidate.create({
      data: {
        process_id: processId,
        application_id: data.application_id || null,
        status: 'pending',
        current_stage_id: firstStage?.id || null,
      },
      include: {
        application: true,
        current_stage: true,
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
      error: 'Erro ao adicionar candidato',
    });
  }
};

export const updateCandidate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = updateCandidateSchema.parse(req.body);

    const existing = await prisma.recruitmentCandidate.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Candidato não encontrado',
      });
    }

    const candidate = await prisma.recruitmentCandidate.update({
      where: { id },
      data: {
        status: data.status || existing.status,
        current_stage_id: data.current_stage_id !== undefined ? data.current_stage_id : existing.current_stage_id,
        score: data.score !== undefined ? data.score : existing.score,
        notes: data.notes !== undefined ? data.notes : existing.notes,
      },
      include: {
        application: true,
        current_stage: true,
      },
    });

    res.json({
      success: true,
      message: 'Candidato atualizado com sucesso',
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

    console.error('❌ Update candidate error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar candidato',
    });
  }
};

export const removeCandidateFromProcess = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.recruitmentCandidate.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Candidato não encontrado',
      });
    }

    await prisma.recruitmentCandidate.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Candidato removido do processo com sucesso',
    });
  } catch (error) {
    console.error('❌ Remove candidate error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao remover candidato',
    });
  }
};

// ==================== AVALIAÇÃO DE ETAPAS ====================

export const evaluateCandidateStage = async (req: AuthRequest, res: Response) => {
  try {
    const { candidateId, stageId } = req.params;
    const data = evaluateStageSchema.parse(req.body);
    const userId = req.user?.id;

    const candidate = await prisma.recruitmentCandidate.findUnique({
      where: { id: candidateId },
      include: {
        process: {
          include: {
            stages: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        error: 'Candidato não encontrado',
      });
    }

    const stage = await prisma.recruitmentStage.findUnique({
      where: { id: stageId },
    });

    if (!stage) {
      return res.status(404).json({
        success: false,
        error: 'Etapa não encontrada',
      });
    }

    // Criar ou atualizar avaliação da etapa
    const candidateStage = await prisma.recruitmentCandidateStage.upsert({
      where: {
        candidate_id_stage_id: {
          candidate_id: candidateId,
          stage_id: stageId,
        },
      },
      update: {
        status: data.status,
        score: data.score || null,
        feedback: data.feedback || null,
        evaluated_by: userId || null,
        evaluated_at: new Date(),
      },
      create: {
        candidate_id: candidateId,
        stage_id: stageId,
        status: data.status,
        score: data.score || null,
        feedback: data.feedback || null,
        evaluated_by: userId || null,
        evaluated_at: new Date(),
      },
    });

    // Se aprovado, avançar para próxima etapa
    if (data.status === 'approved') {
      const currentStageIndex = candidate.process.stages.findIndex(s => s.id === stageId);
      const nextStage = candidate.process.stages[currentStageIndex + 1];

      if (nextStage) {
        await prisma.recruitmentCandidate.update({
          where: { id: candidateId },
          data: {
            current_stage_id: nextStage.id,
            status: 'in_stage',
          },
        });
      } else {
        // Última etapa aprovada - candidato aprovado no processo
        await prisma.recruitmentCandidate.update({
          where: { id: candidateId },
          data: {
            status: 'approved',
            current_stage_id: null,
          },
        });
      }
    } else if (data.status === 'rejected') {
      // Rejeitado na etapa
      await prisma.recruitmentCandidate.update({
        where: { id: candidateId },
        data: {
          status: 'rejected',
        },
      });
    }

    const updatedCandidate = await prisma.recruitmentCandidate.findUnique({
      where: { id: candidateId },
      include: {
        application: true,
        current_stage: true,
        stage_history: {
          include: {
            stage: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Etapa avaliada com sucesso',
      candidateStage,
      candidate: updatedCandidate,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.issues,
      });
    }

    console.error('❌ Evaluate candidate stage error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao avaliar etapa',
    });
  }
};

// ==================== NOTAS ====================

export const addNoteToCandidate = async (req: AuthRequest, res: Response) => {
  try {
    const { candidateId } = req.params;
    const { note, note_type } = req.body;
    const userId = req.user?.id;

    if (!note || !note.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Nota é obrigatória',
      });
    }

    const candidate = await prisma.recruitmentCandidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        error: 'Candidato não encontrado',
      });
    }

    const noteRecord = await prisma.recruitmentNote.create({
      data: {
        candidate_id: candidateId,
        note: note.trim(),
        note_type: note_type || 'general',
        created_by: userId || null,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Nota adicionada com sucesso',
      note: noteRecord,
    });
  } catch (error) {
    console.error('❌ Add note to candidate error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao adicionar nota',
    });
  }
};

export const deleteNote = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.recruitmentNote.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Nota removida com sucesso',
    });
  } catch (error) {
    console.error('❌ Delete note error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao remover nota',
    });
  }
};

