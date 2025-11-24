import { Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

// Esquemas de validação
const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

const updateUserSchema = z.object({
  email: z.string().email('Email inválido').optional(),
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').optional(),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').optional(),
});

/**
 * Lista todos os usuários administradores
 */
export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.admin.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    res.json({
      success: true,
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      })),
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar usuários',
    });
  }
};

/**
 * Cria um novo usuário administrador
 */
export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const { email, name, password } = createUserSchema.parse(req.body);

    // Verificar se já existe um usuário com este email
    const existingUser = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Já existe um usuário com este email',
      });
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(password, 10);

    // Criar novo usuário
    const user = await prisma.admin.create({
      data: {
        email,
        name,
        password_hash: passwordHash,
      },
      select: {
        id: true,
        email: true,
        name: true,
        created_at: true,
        updated_at: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.issues,
      });
    }

    console.error('Erro ao criar usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar usuário',
    });
  }
};

/**
 * Atualiza um usuário administrador
 */
export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = updateUserSchema.parse(req.body);

    // Preparar dados para atualização
    const updateData: any = {};
    if (data.email) updateData.email = data.email;
    if (data.name) updateData.name = data.name;
    if (data.password) {
      updateData.password_hash = await bcrypt.hash(data.password, 10);
    }

    // Atualizar usuário
    const user = await prisma.admin.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        created_at: true,
        updated_at: true,
      },
    });

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.issues,
      });
    }

    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar usuário',
    });
  }
};

/**
 * Remove um usuário administrador
 */
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar se é o último administrador
    const userCount = await prisma.admin.count();
    if (userCount <= 1) {
      return res.status(400).json({
        success: false,
        error: 'Não é possível remover o único administrador do sistema',
      });
    }

    // Verificar se o usuário está tentando se remover
    if (id === req.user!.id) {
      return res.status(400).json({
        success: false,
        error: 'Você não pode remover seu próprio usuário',
      });
    }

    // Remover usuário
    await prisma.admin.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Usuário removido com sucesso',
    });
  } catch (error) {
    console.error('Erro ao remover usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao remover usuário',
    });
  }
};