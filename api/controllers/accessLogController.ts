import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

/**
 * Lista todos os logs de acesso
 */
export const getAllLogs = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '50', email, success } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (email) {
      where.email = {
        contains: email as string,
      };
    }

    if (success !== undefined) {
      where.success = success === 'true';
    }

    const [logs, total] = await Promise.all([
      prisma.accessLog.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.accessLog.count({ where }),
    ]);

    res.json({
      logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Erro ao buscar logs de acesso:', error);
    res.status(500).json({ error: 'Erro ao buscar logs de acesso' });
  }
};

/**
 * Obtém estatísticas dos logs de acesso
 */
export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    const totalLogs = await prisma.accessLog.count();
    const successfulLogins = await prisma.accessLog.count({
      where: { success: true },
    });
    const failedLogins = await prisma.accessLog.count({
      where: { success: false },
    });

    // Logs dos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentLogs = await prisma.accessLog.count({
      where: {
        created_at: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Logins por método
    const passwordLogins = await prisma.accessLog.count({
      where: { login_method: 'password', success: true },
    });

    const twoFactorLogins = await prisma.accessLog.count({
      where: { login_method: '2fa', success: true },
    });

    res.json({
      total: totalLogs,
      successful: successfulLogins,
      failed: failedLogins,
      recent: recentLogs,
      byMethod: {
        password: passwordLogins,
        twoFactor: twoFactorLogins,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas de acesso:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas de acesso' });
  }
};

