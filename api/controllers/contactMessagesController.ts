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
            take: 1, // Apenas a última resposta para contar
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

