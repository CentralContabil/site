import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { emailService } from './emailService';
import { AccessLogService } from './accessLogService.js';

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
      const savedCode = await prisma.authCode.create({
        data: {
          email: normalizedEmail,
          code,
          type,
          expires_at: expiresAt
        }
      });

      console.log(`💾 Código salvo no banco de dados:`, {
        id: savedCode.id,
        email: savedCode.email,
        code: savedCode.code,
        expires_at: savedCode.expires_at.toISOString(),
        created_at: savedCode.created_at.toISOString()
      });

      // Envia código por email
      if (type === 'email') {
        console.log(`📧 Enviando código 2FA por email para: ${normalizedEmail}`);
        
        try {
          const emailSent = await emailService.sendVerificationCode(normalizedEmail, code, admin.name);
          
          if (!emailSent) {
            console.error('❌ Falha ao enviar email de verificação');
            console.warn('⚠️ Código foi salvo no banco, mas o email não foi enviado. O código ainda pode ser usado para autenticação.');
            // NÃO remove o código do banco - permite autenticação mesmo sem email
            // O código pode ser usado se o usuário souber qual é (ex: em desenvolvimento)
            
            return { 
              success: false, 
              message: 'Erro ao enviar email. O código foi gerado e salvo, mas não foi enviado por email. Verifique as configurações de SMTP no painel administrativo ou entre em contato com o suporte.' 
            };
          }
          
          console.log('✅ Email 2FA enviado com sucesso');
        } catch (emailError: any) {
          console.error('❌ Erro ao enviar email:', emailError);
          console.warn('⚠️ Código foi salvo no banco, mas o email não foi enviado. O código ainda pode ser usado para autenticação.');
          // NÃO remove o código do banco - permite autenticação mesmo sem email
          
          return { 
            success: false, 
            message: 'Erro ao enviar email. O código foi gerado e salvo, mas não foi enviado por email. Verifique as configurações de SMTP no painel administrativo.' 
          };
        }
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
      console.log(`🔍 Código recebido (trimmed): "${code.trim()}"`);
      console.log(`🔍 Código recebido (length): ${code.trim().length}`);
      
      const now = new Date();
      console.log(`🔍 Data atual: ${now.toISOString()}`);

      // Busca código válido não usado e não expirado
      // Primeiro, busca sem filtro de expiração para debug
      const allCodes = await prisma.authCode.findMany({
        where: {
          email: normalizedEmail,
          code: code.trim()
        },
        orderBy: { created_at: 'desc' },
        take: 5
      });
      
      console.log(`🔍 Todos os códigos encontrados para ${normalizedEmail} com código ${code.trim()}:`, allCodes.map(c => ({
        code: c.code,
        used: c.used,
        expires_at: c.expires_at.toISOString(),
        created_at: c.created_at.toISOString(),
        isExpired: new Date(c.expires_at) <= now
      })));
      
      // Agora busca o código válido
      const authCode = await prisma.authCode.findFirst({
        where: {
          email: normalizedEmail,
          code: code.trim(),
          used: false,
          expires_at: { gt: now }
        },
        orderBy: { created_at: 'desc' }
      });
      
      console.log(`🔍 Resultado da busca:`, authCode ? {
        id: authCode.id,
        email: authCode.email,
        code: authCode.code,
        used: authCode.used,
        expires_at: authCode.expires_at.toISOString(),
        created_at: authCode.created_at.toISOString()
      } : 'Nenhum código encontrado');

      if (!authCode) {
        console.warn(`⚠️ Código inválido ou expirado para: ${normalizedEmail}`);
        console.warn(`⚠️ Código procurado: ${code.trim()}`);
        
        // Verifica se o código existe mas está expirado
        const expiredCode = await prisma.authCode.findFirst({
          where: {
            email: normalizedEmail,
            code: code.trim()
          },
          orderBy: { created_at: 'desc' }
        });

        if (expiredCode) {
          const expiresAt = new Date(expiredCode.expires_at);
          
          console.warn(`⚠️ Código encontrado mas:`, {
            used: expiredCode.used,
            expired: expiresAt <= now,
            expiresAt: expiresAt.toISOString(),
            now: now.toISOString()
          });
          
          if (expiredCode.used) {
            return {
              success: false,
              message: 'Código já foi utilizado. Solicite um novo código.'
            };
          }
          
          if (expiresAt <= now) {
            return {
              success: false,
              message: 'Código expirado. Solicite um novo código.'
            };
          }
        }
        
        // Verifica se há algum código recente para este email
        const recentCodes = await prisma.authCode.findMany({
          where: {
            email: normalizedEmail
          },
          orderBy: { created_at: 'desc' },
          take: 5
        });
        
        console.warn(`⚠️ Códigos recentes encontrados para ${normalizedEmail}:`, recentCodes.map(c => ({
          code: c.code,
          used: c.used,
          expires_at: c.expires_at.toISOString(),
          created_at: c.created_at.toISOString(),
          isExpired: new Date(c.expires_at) <= now
        })));
        
        if (recentCodes.length === 0) {
          return { 
            success: false, 
            message: 'Nenhum código encontrado. Solicite um novo código de verificação.' 
          };
        }
        
        // Verifica se o código digitado corresponde a algum código recente (mesmo que expirado ou usado)
        const matchingCode = recentCodes.find(c => c.code === code.trim());
        if (matchingCode) {
          if (matchingCode.used) {
            return {
              success: false,
              message: 'Código já foi utilizado. Solicite um novo código.'
            };
          }
          if (new Date(matchingCode.expires_at) <= now) {
            return {
              success: false,
              message: 'Código expirado. Solicite um novo código.'
            };
          }
        }

        return { 
          success: false, 
          message: 'Código inválido. Verifique se digitou corretamente ou solicite um novo código.' 
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