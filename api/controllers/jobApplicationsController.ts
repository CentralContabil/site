import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ConfigurationService } from '../services/configurationService.js';
import { emailService } from '../services/emailService.js';

const prisma = new PrismaClient();

export class JobApplicationsController {
  // Criar candidatura (pública, com captcha)
  static async createJobApplication(req: Request, res: Response) {
    try {
      const {
        name,
        email,
        phone,
        position,
        linkedinUrl,
        message,
        cvUrl,
        captchaToken,
        honeypot,
      } = req.body;

      if (!name || !email) {
        return res.status(400).json({
          error: 'Nome e email são obrigatórios',
        });
      }

      // Honeypot
      if (honeypot && String(honeypot).trim() !== '') {
        // Retorna sucesso silencioso para não denunciar para bots
        return res.json({
          success: true,
          message: 'Candidatura enviada com sucesso',
        });
      }

      // Validar hCaptcha (desabilitado em desenvolvimento)
      const isDevelopment = process.env.NODE_ENV === 'development';
      if (!isDevelopment) {
        if (!captchaToken) {
          return res.status(400).json({
            error: 'Por favor, confirme que você não é um robô',
          });
        }

        const hcaptchaSecretKey = process.env.HCAPTCHA_SECRET_KEY;
        if (!hcaptchaSecretKey) {
          console.warn('HCAPTCHA_SECRET_KEY não configurada');
          return res.status(500).json({
            error: 'Configuração de segurança incompleta. Entre em contato com o suporte.',
          });
        }

        const verifyUrl = 'https://hcaptcha.com/siteverify';
        const formData = new URLSearchParams();
        formData.append('secret', hcaptchaSecretKey);
        formData.append('response', captchaToken);

        const hcaptchaResponse = await fetch(verifyUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString(),
        });

        const hcaptchaData = await hcaptchaResponse.json();
        if (!hcaptchaData.success) {
          console.error('hCaptcha validation failed (job application):', hcaptchaData);
          return res.status(400).json({
            error: 'Falha na verificação de segurança. Por favor, tente novamente.',
          });
        }
      }

      const jobApplication = await prisma.jobApplication.create({
        data: {
          name,
          email,
          phone: phone || null,
          position: position || null,
          linkedin_url: linkedinUrl || null,
          message: message || null,
          cv_url: cvUrl || null,
          is_read: false,
        },
      });

      // Notificar por e-mail (opcional)
      try {
        const config = await ConfigurationService.getConfiguration();
        const recipientEmail =
          config.contact_email || config.email || process.env.SMTP_USER || '';

        if (recipientEmail) {
          await emailService.sendContactNotification(recipientEmail, {
            name,
            email,
            phone,
            serviceType: position || 'Candidatura - Trabalhe Conosco',
            message:
              (message || 'Nova candidatura recebida pelo formulário Trabalhe com a Gente.') +
              (cvUrl ? `\n\nCurrículo anexado: ${cvUrl}` : '') +
              (linkedinUrl ? `\nLinkedIn: ${linkedinUrl}` : ''),
          });
        }
      } catch (notifyError) {
        console.warn('Erro ao enviar notificação de candidatura:', notifyError);
      }

      res.json({
        success: true,
        message: 'Candidatura enviada com sucesso',
        data: { id: jobApplication.id },
      });
    } catch (error) {
      console.error('Erro ao criar candidatura:', error);
      res.status(500).json({
        error: 'Erro ao enviar candidatura',
      });
    }
  }

  // Upload de currículo (arquivo)
  static async uploadCv(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
      }

      const { FileService } = await import('../services/fileService.js');

      // Aceitar apenas PDF ou DOC/DOCX
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];

      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          error: 'Formato de arquivo não suportado. Envie um PDF ou DOC/DOCX.',
        });
      }

      const uploadResult = await FileService.uploadFile(req.file);

      res.json({
        success: true,
        data: uploadResult,
      });
    } catch (error: any) {
      console.error('Erro ao enviar currículo:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao enviar currículo',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  // Listar candidaturas (admin)
  static async getAll(req: Request, res: Response) {
    try {
      const applications = await prisma.jobApplication.findMany({
        orderBy: { created_at: 'desc' },
      });
      res.json({ applications });
    } catch (error) {
      console.error('Erro ao buscar candidaturas:', error);
      res.status(500).json({ error: 'Erro ao buscar candidaturas' });
    }
  }

  static async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const application = await prisma.jobApplication.findUnique({ where: { id } });

      if (!application) {
        return res.status(404).json({ error: 'Candidatura não encontrada' });
      }

      res.json({ application });
    } catch (error) {
      console.error('Erro ao buscar candidatura:', error);
      res.status(500).json({ error: 'Erro ao buscar candidatura' });
    }
  }

  static async markAsRead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const application = await prisma.jobApplication.update({
        where: { id },
        data: { is_read: true },
      });

      res.json({ application });
    } catch (error) {
      console.error('Erro ao marcar candidatura como lida:', error);
      res.status(500).json({ error: 'Erro ao marcar candidatura como lida' });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.jobApplication.delete({
        where: { id },
      });

      res.json({ message: 'Candidatura removida com sucesso' });
    } catch (error) {
      console.error('Erro ao remover candidatura:', error);
      res.status(500).json({ error: 'Erro ao remover candidatura' });
    }
  }
}




