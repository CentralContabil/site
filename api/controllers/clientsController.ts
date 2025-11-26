import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { FileService } from '../services/fileService.js';
import { AuthRequest } from '../middleware/auth.js';

const clientSchema = z.object({
  name: z.string().min(1, 'Nome do cliente é obrigatório'),
  phone: z.string().optional().or(z.literal('')),
  website_url: z.string().url().optional().or(z.literal('')),
  facebook_url: z.string().url().optional().or(z.literal('')),
  instagram_url: z.string().url().optional().or(z.literal('')),
  linkedin_url: z.string().url().optional().or(z.literal('')),
  twitter_url: z.string().url().optional().or(z.literal('')),
  order: z.number().int().min(0, 'Ordem deve ser um número positivo').optional(),
  isActive: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

// Listar clientes ativos (público)
export const getClients = async (req: Request, res: Response) => {
  try {
    const clients = await prisma.client.findMany({
      where: { is_active: true },
      orderBy: { order: 'asc' },
    });

    res.json({ clients });
  } catch (error) {
    console.error('❌ Get clients error:', error);
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
};

// Listar todos os clientes (admin)
export const getAllClients = async (req: AuthRequest, res: Response) => {
  try {
    const clients = await prisma.client.findMany({
      orderBy: [{ order: 'asc' }, { created_at: 'desc' }],
    });

    res.json({ clients });
  } catch (error) {
    console.error('❌ Get all clients error:', error);
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
};

// Buscar cliente por ID (admin)
export const getClientById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const client = await prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json({ client });
  } catch (error) {
    console.error('❌ Get client by id error:', error);
    res.status(500).json({ error: 'Erro ao buscar cliente' });
  }
};

// Criar cliente (admin)
export const createClient = async (req: AuthRequest, res: Response) => {
  try {
    const data = clientSchema.parse(req.body);

    const client = await prisma.client.create({
      data: {
        name: data.name,
        phone: data.phone || null,
        website_url: data.website_url || null,
        facebook_url: data.facebook_url || null,
        instagram_url: data.instagram_url || null,
        linkedin_url: data.linkedin_url || null,
        twitter_url: data.twitter_url || null,
        order: data.order ?? 0,
        is_active: data.isActive ?? data.is_active ?? true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Cliente criado com sucesso',
      client,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors,
      });
    }

    console.error('❌ Create client error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar cliente',
    });
  }
};

// Atualizar cliente (admin)
export const updateClient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = clientSchema.parse(req.body);

    const existingClient = await prisma.client.findUnique({
      where: { id },
    });

    if (!existingClient) {
      return res.status(404).json({
        success: false,
        error: 'Cliente não encontrado',
      });
    }

    const client = await prisma.client.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone !== undefined ? (data.phone || null) : existingClient.phone,
        website_url: data.website_url || null,
        facebook_url: data.facebook_url || null,
        instagram_url: data.instagram_url || null,
        linkedin_url: data.linkedin_url || null,
        twitter_url: data.twitter_url || null,
        order: data.order ?? existingClient.order,
        is_active: data.isActive ?? data.is_active ?? existingClient.is_active,
      },
    });

    res.json({
      success: true,
      message: 'Cliente atualizado com sucesso',
      client,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors,
      });
    }

    console.error('❌ Update client error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar cliente',
    });
  }
};

// Deletar cliente (admin)
export const deleteClient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existingClient = await prisma.client.findUnique({
      where: { id },
    });

    if (!existingClient) {
      return res.status(404).json({
        success: false,
        error: 'Cliente não encontrado',
      });
    }

    // Deletar logo se existir
    if (existingClient.logo_url && existingClient.logo_url.startsWith('/uploads/')) {
      try {
        const filename = existingClient.logo_url.split('/').pop();
        if (filename) {
          await FileService.deleteFile(filename);
        }
      } catch (error) {
        console.warn('Erro ao deletar logo do cliente:', error);
      }
    }

    await prisma.client.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Cliente removido com sucesso',
    });
  } catch (error) {
    console.error('❌ Delete client error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao remover cliente',
    });
  }
};

// Upload de logo do cliente (admin)
export const uploadClientLogo = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const { id } = req.params;

    // Valida o arquivo (apenas imagens)
    FileService.validateImageFile(req.file);

    // Faz upload do arquivo
    const uploadResult = await FileService.uploadFile(req.file);

    // Buscar cliente existente
    const existingClient = await prisma.client.findUnique({
      where: { id },
    });

    if (!existingClient) {
      // Deletar arquivo se cliente não existir
      const filename = uploadResult.url.split('/').pop();
      if (filename) {
        await FileService.deleteFile(filename);
      }
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    // Deletar logo antiga se existir
    if (existingClient.logo_url && existingClient.logo_url.startsWith('/uploads/')) {
      try {
        const oldFilename = existingClient.logo_url.split('/').pop();
        if (oldFilename) {
          await FileService.deleteFile(oldFilename);
        }
      } catch (error) {
        console.warn('Erro ao deletar logo antiga:', error);
      }
    }

    // Atualizar cliente com nova logo
    const client = await prisma.client.update({
      where: { id },
      data: {
        logo_url: uploadResult.url,
      },
    });

    res.json({
      success: true,
      message: 'Logo enviada com sucesso',
      data: uploadResult,
      client,
    });
  } catch (error: any) {
    console.error('Erro ao fazer upload da logo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao fazer upload da logo',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
};

// Deletar logo do cliente (admin)
export const deleteClientLogo = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existingClient = await prisma.client.findUnique({
      where: { id },
    });

    if (!existingClient) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    if (!existingClient.logo_url) {
      return res.status(400).json({ error: 'Cliente não possui logo' });
    }

    // Deletar arquivo
    if (existingClient.logo_url.startsWith('/uploads/')) {
      try {
        const filename = existingClient.logo_url.split('/').pop();
        if (filename) {
          await FileService.deleteFile(filename);
        }
      } catch (error) {
        console.warn('Erro ao deletar arquivo:', error);
      }
    }

    // Atualizar cliente removendo a logo
    const client = await prisma.client.update({
      where: { id },
      data: {
        logo_url: null,
      },
    });

    res.json({
      success: true,
      message: 'Logo removida com sucesso',
      client,
    });
  } catch (error: any) {
    console.error('Erro ao deletar logo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao deletar logo',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
};



