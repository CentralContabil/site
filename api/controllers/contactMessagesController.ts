import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';
import { emailService } from '../services/emailService.js';

const prisma = new PrismaClient();

export class ContactMessagesController {
  // Listar todas as mensagens (admin)
  static async getAllMessages(req: Request, res: Response) {
    try {
      const messages = await prisma.contactMessage.findMany({
        orderBy: {
          created_at: 'desc',
        },
        include: {
          replies: {
            orderBy: {
              created_at: 'desc',
            },
            // Retornar todas as respostas para poder contar
          },
        },
      });

      res.json({ messages });
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      res.status(500).json({
        error: 'Erro ao buscar mensagens',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  // Obter uma mensagem específica
  static async getMessage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const message = await prisma.contactMessage.findUnique({
        where: { id },
        include: {
          replies: {
            orderBy: {
              created_at: 'desc',
            },
          },
        },
      });

      if (!message) {
        return res.status(404).json({ error: 'Mensagem não encontrada' });
      }

      res.json({ message });
    } catch (error) {
      console.error('Erro ao buscar mensagem:', error);
      res.status(500).json({
        error: 'Erro ao buscar mensagem',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  // Marcar mensagem como lida
  static async markAsRead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const message = await prisma.contactMessage.update({
        where: { id },
        data: { is_read: true },
      });

      res.json({ message });
    } catch (error) {
      console.error('Erro ao marcar mensagem como lida:', error);
      res.status(500).json({
        error: 'Erro ao marcar mensagem como lida',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  // Deletar mensagem
  static async deleteMessage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.contactMessage.delete({
        where: { id },
      });

      res.json({ message: 'Mensagem deletada com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar mensagem:', error);
      res.status(500).json({
        error: 'Erro ao deletar mensagem',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  // Contar mensagens não lidas
  static async getUnreadCount(req: Request, res: Response) {
    try {
      const count = await prisma.contactMessage.count({
        where: { is_read: false },
      });

      res.json({ count });
    } catch (error) {
      console.error('Erro ao contar mensagens não lidas:', error);
      res.status(500).json({
        error: 'Erro ao contar mensagens não lidas',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  // Contar total de mensagens
  static async getTotalCount(req: Request, res: Response) {
    try {
      const count = await prisma.contactMessage.count();

      res.json({ count });
    } catch (error) {
      console.error('Erro ao contar total de mensagens:', error);
      res.status(500).json({
        error: 'Erro ao contar total de mensagens',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  // Obter mensagens agrupadas por mês (últimos 12 meses)
  static async getMessagesByMonth(req: Request, res: Response) {
    try {
      // Calcular data de 12 meses atrás
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      // Buscar todas as mensagens dos últimos 12 meses
      const messages = await prisma.contactMessage.findMany({
        where: {
          created_at: {
            gte: twelveMonthsAgo,
          },
        },
        select: {
          created_at: true,
        },
        orderBy: {
          created_at: 'asc',
        },
      });

      // Criar objeto para agrupar por mês/ano
      const monthlyData: { [key: string]: number } = {};
      
      // Inicializar todos os últimos 12 meses com 0
      const months: string[] = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        months.push(monthKey);
        monthlyData[monthKey] = 0;
      }

      // Agrupar mensagens por mês
      messages.forEach((message) => {
        const date = new Date(message.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyData[monthKey] !== undefined) {
          monthlyData[monthKey]++;
        }
      });

      // Formatar dados para resposta
      const formattedData = months.map((monthKey) => {
        const [year, month] = monthKey.split('-');
        const monthNames = [
          'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
          'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
        ];
        return {
          month: `${monthNames[parseInt(month) - 1]}/${year.slice(-2)}`,
          count: monthlyData[monthKey],
          fullMonth: monthKey,
        };
      });

      res.json({ data: formattedData });
    } catch (error) {
      console.error('Erro ao buscar mensagens por mês:', error);
      res.status(500).json({
        error: 'Erro ao buscar mensagens por mês',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  // Enviar resposta para uma mensagem
  static async sendReply(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { message: replyMessage } = req.body;

      if (!replyMessage || !replyMessage.trim()) {
        return res.status(400).json({
          error: 'A mensagem de resposta é obrigatória',
        });
      }

      // Buscar a mensagem original
      const originalMessage = await prisma.contactMessage.findUnique({
        where: { id },
      });

      if (!originalMessage) {
        return res.status(404).json({ error: 'Mensagem não encontrada' });
      }

      // Salvar resposta no banco de dados
      const reply = await prisma.contactMessageReply.create({
        data: {
          contact_message_id: id,
          message: replyMessage.trim(),
        },
      });

      console.log('✅ Resposta salva no banco:', reply.id);

      // Enviar email de resposta
      const emailSent = await emailService.sendReply(
        originalMessage.email,
        originalMessage.name,
        replyMessage.trim(),
        {
          name: originalMessage.name,
          email: originalMessage.email,
          message: originalMessage.message,
          date: originalMessage.created_at.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
        }
      );

      if (!emailSent) {
        console.warn('⚠️ Falha ao enviar email, mas resposta foi salva no banco');
        // Não retornar erro, pois a resposta já foi salva
      }

      // Buscar a mensagem atualizada com todas as respostas
      const updatedMessage = await prisma.contactMessage.findUnique({
        where: { id },
        include: {
          replies: {
            orderBy: {
              created_at: 'desc',
            },
          },
        },
      });

      res.json({
        message: 'Resposta enviada com sucesso',
        reply: updatedMessage?.replies[0], // Retornar a resposta recém-criada
      });
    } catch (error) {
      console.error('Erro ao enviar resposta:', error);
      res.status(500).json({
        error: 'Erro ao enviar resposta',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }
}

