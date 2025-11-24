import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { emailService } from './emailService';

const prisma = new PrismaClient();

export class AuthCodeService {
  /**
   * Gera um código de 6 dígitos
   */
  private generateCode(): string {
    // Garante que o código sempre tenha 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    // Validação adicional para garantir 6 dígitos
    if (code.length !== 6) {
      // Se por algum motivo não tiver 6 dígitos, gera novamente
      return this.generateCode();
    }
    return code;
  }

  /**
   * Verifica se há muitas tentativas recentes (rate limiting)
   */
  private async checkRateLimit(email: string): Promise<boolean> {
    try {
      // Verifica se há mais de 3 códigos enviados nos últimos 5 minutos
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const recentCodes = await prisma.authCode.count({
        where: {
          email,
          created_at: { gte: fiveMinutesAgo }
        }
      });

      return recentCodes < 3; // Permite até 3 tentativas a cada 5 minutos
    } catch (error) {
      console.error('Erro ao verificar rate limit:', error);
      return true; // Em caso de erro, permite a tentativa
    }
  }

  /**
   * Cria e envia código de autenticação 2FA
   */
  async sendAuthCode(email: string, type: 'email' | 'sms' = 'email'): Promise<{ success: boolean; message: string }> {
    try {
      // Normaliza o email (lowercase, trim)
      const normalizedEmail = email.toLowerCase().trim();

      console.log(`🔐 Iniciando processo de 2FA para: ${normalizedEmail}`);

      // Verifica rate limiting
      const canSend = await this.checkRateLimit(normalizedEmail);
      if (!canSend) {
        console.warn(`⚠️ Rate limit excedido para: ${normalizedEmail}`);
        return {
          success: false,
          message: 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.'
        };
      }

      // Verifica se o email existe na base de admins
      const admin = await prisma.admin.findUnique({
        where: { email: normalizedEmail }
      });

      if (!admin) {
        console.warn(`⚠️ Email não encontrado: ${normalizedEmail}`);
        // Por segurança, não revela se o email existe ou não
        return { 
          success: false, 
          message: 'Se o email estiver cadastrado, você receberá um código de verificação.' 
        };
      }

      // Gera código de 6 dígitos
      const code = this.generateCode();
      console.log(`✅ Código 2FA gerado: ${code} para ${normalizedEmail}`);
      
      // Define expiração para 10 minutos
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      // Marca códigos anteriores como usados (invalida códigos antigos)
      const invalidated = await prisma.authCode.updateMany({
        where: { 
          email: normalizedEmail, 
          used: false,
          expires_at: { gt: new Date() }
        },
        data: { used: true }
      });
      
      if (invalidated.count > 0) {
        console.log(`🔄 ${invalidated.count} código(s) anterior(es) invalidado(s)`);
      }

      // Cria novo código no banco
      await prisma.authCode.create({
        data: {
          email: normalizedEmail,
          code,
          type,
          expires_at: expiresAt
        }
      });

      console.log(`💾 Código salvo no banco de dados`);

      // Envia código por email
      if (type === 'email') {
        console.log(`📧 Enviando código 2FA por email para: ${normalizedEmail}`);
        
        const emailSent = await emailService.sendVerificationCode(normalizedEmail, code, admin.name);
        
        if (!emailSent) {
          console.error('❌ Falha ao enviar email de verificação');
          // Remove o código do banco se o email falhou
          await prisma.authCode.deleteMany({
            where: {
              email: normalizedEmail,
              code,
              used: false
            }
          });
          
          return { 
            success: false, 
            message: 'Erro ao enviar email. Verifique as configurações de SMTP ou tente novamente mais tarde.' 
          };
        }
        
        console.log('✅ Email 2FA enviado com sucesso');
      }

      return { 
        success: true, 
        message: 'Código de verificação enviado! Verifique seu email (incluindo a pasta de spam). O código expira em 10 minutos.' 
      };

    } catch (error: any) {
      console.error('❌ Erro ao enviar código 2FA:');
      console.error('❌ Tipo:', error?.constructor?.name);
      console.error('❌ Mensagem:', error?.message);
      console.error('❌ Stack:', error?.stack);
      
      return { 
        success: false, 
        message: 'Erro interno ao processar solicitação. Tente novamente ou entre em contato com o suporte.' 
      };
    }
  }

  /**
   * Valida código de autenticação 2FA
   */
  async validateAuthCode(email: string, code: string): Promise<{ success: boolean; token?: string; message: string; user?: any }> {
    try {
      // Normaliza o email
      const normalizedEmail = email.toLowerCase().trim();
      
      // Valida formato do código (deve ter exatamente 6 dígitos)
      if (!/^\d{6}$/.test(code)) {
        console.warn(`⚠️ Código inválido (formato incorreto): ${code}`);
        return {
          success: false,
          message: 'Código inválido. O código deve conter exatamente 6 dígitos numéricos.'
        };
      }

      console.log(`🔍 Validando código 2FA para: ${normalizedEmail}`);

      // Busca código válido não usado e não expirado
      const authCode = await prisma.authCode.findFirst({
        where: {
          email: normalizedEmail,
          code: code.trim(),
          used: false,
          expires_at: { gt: new Date() }
        },
        orderBy: { created_at: 'desc' }
      });

      if (!authCode) {
        console.warn(`⚠️ Código inválido ou expirado para: ${normalizedEmail}`);
        
        // Verifica se o código existe mas está expirado
        const expiredCode = await prisma.authCode.findFirst({
          where: {
            email: normalizedEmail,
            code: code.trim()
          },
          orderBy: { created_at: 'desc' }
        });

        if (expiredCode && expiredCode.expires_at <= new Date()) {
          return {
            success: false,
            message: 'Código expirado. Solicite um novo código.'
          };
        }

        return { 
          success: false, 
          message: 'Código inválido. Verifique se digitou corretamente.' 
        };
      }

      console.log(`✅ Código válido encontrado para: ${normalizedEmail}`);

      // Marca código como usado
      await prisma.authCode.update({
        where: { id: authCode.id },
        data: { used: true }
      });

      console.log(`✅ Código marcado como usado`);

      // Busca informações do admin
      const admin = await prisma.admin.findUnique({
        where: { email: normalizedEmail },
        select: { id: true, email: true, name: true }
      });

      if (!admin) {
        console.error(`❌ Admin não encontrado: ${normalizedEmail}`);
        return { 
          success: false, 
          message: 'Usuário não encontrado.' 
        };
      }

      // Gera JWT token
      const token = jwt.sign(
        { 
          userId: admin.id, 
          email: admin.email,
          name: admin.name 
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      console.log(`✅ Token JWT gerado com sucesso para: ${normalizedEmail}`);

      return { 
        success: true, 
        token,
        user: {
          id: admin.id,
          email: admin.email,
          name: admin.name
        },
        message: 'Autenticação realizada com sucesso!' 
      };

    } catch (error: any) {
      console.error('❌ Erro ao validar código 2FA:');
      console.error('❌ Tipo:', error?.constructor?.name);
      console.error('❌ Mensagem:', error?.message);
      console.error('❌ Stack:', error?.stack);
      
      return { 
        success: false, 
        message: 'Erro interno ao validar código. Tente novamente.' 
      };
    }
  }

  /**
   * Limpa códigos expirados
   */
  async cleanupExpiredCodes(): Promise<void> {
    try {
      await prisma.authCode.deleteMany({
        where: {
          OR: [
            { expires_at: { lt: new Date() } },
            { used: true, created_at: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
          ]
        }
      });
      console.log('Códigos expirados limpos com sucesso');
    } catch (error) {
      console.error('Erro ao limpar códigos expirados:', error);
    }
  }
}

export const authCodeService = new AuthCodeService();