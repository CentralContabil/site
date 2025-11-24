import { Request, Response } from 'express';
import { ConfigurationService } from '../services/configurationService.js';
import { authenticateToken } from '../middleware/auth.js';
import { emailService } from '../services/emailService.js';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';

const prisma = new PrismaClient();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

export class ConfigurationController {
  static async getConfiguration(req: Request, res: Response) {
    try {
      const config = await ConfigurationService.getConfiguration();
      res.json(config);
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      res.status(500).json({ 
        error: 'Erro ao buscar configurações',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async updateConfiguration(req: Request, res: Response) {
    try {
      const data = req.body;
      const config = await ConfigurationService.updateConfiguration(data);
      res.json(config);
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      res.status(500).json({ 
        error: 'Erro ao atualizar configurações',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async uploadLogo(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
      }

      const { type = 'logo' } = req.body;
      
      if (!['logo', 'logo_dark', 'favicon'].includes(type)) {
        return res.status(400).json({ error: 'Tipo de logo inválido' });
      }

      const result = await ConfigurationService.uploadLogo(req.file, type as 'logo' | 'logo_dark' | 'favicon');
      
      res.json({
        message: 'Logo enviada com sucesso',
        data: result
      });
    } catch (error) {
      console.error('Erro ao fazer upload da logo:', error);
      res.status(500).json({ 
        error: 'Erro ao fazer upload da logo',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async deleteLogo(req: Request, res: Response) {
    try {
      const { type = 'logo' } = req.params;
      
      if (!['logo', 'logo_dark', 'favicon'].includes(type)) {
        return res.status(400).json({ error: 'Tipo de logo inválido' });
      }

      await ConfigurationService.deleteLogo(type as 'logo' | 'logo_dark' | 'favicon');
      
      res.json({
        message: 'Logo removida com sucesso'
      });
    } catch (error) {
      console.error('Erro ao remover logo:', error);
      res.status(500).json({ 
        error: 'Erro ao remover logo',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async sendContactMessage(req: Request, res: Response) {
    try {
      console.log('Recebendo mensagem de contato:', {
        body: req.body,
        headers: req.headers,
      });
      
      const { name, email, phone, service_type, serviceType, message, captchaToken, honeypot } = req.body;
      
      // Aceitar tanto service_type quanto serviceType (compatibilidade)
      const serviceTypeValue = service_type || serviceType;
      
      // Validação básica
      if (!name || !email || !message) {
        console.log('Validação falhou:', { name, email, message });
        return res.status(400).json({ 
          error: 'Nome, email e mensagem são obrigatórios' 
        });
      }

      // Validação honeypot - se preenchido, é um bot
      if (honeypot && honeypot.trim() !== '') {
        console.log('Bot detectado via honeypot');
        // Retornar sucesso silenciosamente para não alertar o bot
        return res.json({
          message: 'Mensagem enviada com sucesso',
          data: { name, email, phone, service_type, message }
        });
      }

      // Validar hCaptcha (desabilitado em desenvolvimento)
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      if (!isDevelopment) {
        if (!captchaToken) {
          return res.status(400).json({ 
            error: 'Por favor, confirme que você não é um robô' 
          });
        }

        // Verificar hCaptcha apenas em produção
        const hcaptchaSecretKey = process.env.HCAPTCHA_SECRET_KEY;
        if (!hcaptchaSecretKey) {
          console.warn('HCAPTCHA_SECRET_KEY não configurada');
          return res.status(500).json({ 
            error: 'Configuração de segurança incompleta. Entre em contato com o suporte.' 
          });
        }

        const verifyUrl = 'https://hcaptcha.com/siteverify';
        
        try {
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
            console.error('hCaptcha validation failed:', hcaptchaData);
            return res.status(400).json({ 
              error: 'Falha na verificação de segurança. Por favor, tente novamente.' 
            });
          }
        } catch (captchaError) {
          console.error('Erro ao validar hCaptcha:', captchaError);
          return res.status(500).json({ 
            error: 'Erro ao validar verificação de segurança. Tente novamente.' 
          });
        }
      } else {
        // Em desenvolvimento, apenas logar
        console.log('Modo desenvolvimento: Validação hCaptcha bypassada');
      }

      // Salvar mensagem no banco de dados
      const contactMessage = await prisma.contactMessage.create({
        data: {
          name,
          email,
          phone: phone || null,
          service_type: serviceTypeValue || null,
          message,
          is_read: false,
        },
      });

      console.log('✅ Mensagem de contato salva no banco:', contactMessage.id);

      // Buscar email destinatário das configurações
      const config = await ConfigurationService.getConfiguration();
      const recipientEmail = config.contact_email || config.email || 'wagner.guerra@gmail.com';

      // Enviar email de notificação
      if (recipientEmail) {
        try {
          const emailSent = await emailService.sendContactNotification(recipientEmail, {
            name,
            email,
            phone: phone || undefined,
            serviceType: serviceTypeValue || undefined,
            message,
          });

          if (emailSent) {
            console.log('✅ Email de notificação enviado para:', recipientEmail);
          } else {
            console.warn('⚠️ Falha ao enviar email de notificação, mas mensagem foi salva');
          }
        } catch (emailError) {
          console.error('❌ Erro ao enviar email de notificação:', emailError);
          // Não falha a requisição se o email falhar, pois a mensagem já foi salva
        }
      } else {
        console.warn('⚠️ Nenhum email destinatário configurado');
      }
      
      res.json({
        message: 'Mensagem enviada com sucesso',
        data: { id: contactMessage.id, name, email, phone, service_type: serviceTypeValue, message }
      });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      res.status(500).json({ 
        error: 'Erro ao enviar mensagem',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}

// Exportar funções individuais para uso nas rotas
export const getConfiguration = ConfigurationController.getConfiguration;
export const updateConfiguration = ConfigurationController.updateConfiguration;
export const uploadLogo = ConfigurationController.uploadLogo;
export const deleteLogo = ConfigurationController.deleteLogo;
export const sendContactMessage = ConfigurationController.sendContactMessage;

// Rotas públicas (para frontend)
export const publicConfigurationRoutes = [
  { method: 'get', path: '/api/configurations', handler: ConfigurationController.getConfiguration }
];

// Rotas protegidas (admin)
export const protectedConfigurationRoutes = [
  { 
    method: 'put', 
    path: '/api/configurations', 
    handler: [authenticateToken, ConfigurationController.updateConfiguration] 
  },
  { 
    method: 'post', 
    path: '/api/configurations/logo', 
    handler: [authenticateToken, upload.single('file'), ConfigurationController.uploadLogo] 
  },
  { 
    method: 'delete', 
    path: '/api/configurations/logo/:type', 
    handler: [authenticateToken, ConfigurationController.deleteLogo] 
  }
];