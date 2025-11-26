import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const prisma = new PrismaClient();

export class AccessLogController {
  /**
   * Lista todos os logs de acesso (admin)
   */
  static async getAllLogs(req: Request, res: Response) {
    try {
      const { page = '1', limit = '50', adminId, success } = req.query;
      
      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);
      const skip = (pageNumber - 1) * limitNumber;

      const where: any = {};
      
      if (adminId) {
        where.admin_id = adminId as string;
      }
      
      if (success !== undefined) {
        where.success = success === 'true';
      }

      const [logs, total] = await Promise.all([
        prisma.accessLog.findMany({
          where,
          orderBy: {
            created_at: 'desc',
          },
          skip,
          take: limitNumber,
          include: {
            admin: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        }),
        prisma.accessLog.count({ where }),
      ]);

      res.json({
        logs,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total,
          totalPages: Math.ceil(total / limitNumber),
        },
      });
    } catch (error) {
      console.error('Erro ao buscar logs de acesso:', error);
      res.status(500).json({
        error: 'Erro ao buscar logs de acesso',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  /**
   * Obtém estatísticas dos logs de acesso
   */
  static async getStats(req: Request, res: Response) {
    try {
      const [totalLogs, successfulLogins, failedLogins, uniqueUsers, recentLogs] = await Promise.all([
        prisma.accessLog.count(),
        prisma.accessLog.count({ where: { success: true } }),
        prisma.accessLog.count({ where: { success: false } }),
        prisma.accessLog.groupBy({
          by: ['admin_id'],
          _count: true,
        }),
        prisma.accessLog.findMany({
          orderBy: { created_at: 'desc' },
          take: 10,
          include: {
            admin: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        }),
      ]);

      res.json({
        total: totalLogs,
        successful: successfulLogins,
        failed: failedLogins,
        uniqueUsers: uniqueUsers.length,
        recentLogs,
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas de logs:', error);
      res.status(500).json({
        error: 'Erro ao buscar estatísticas de logs',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }
}

