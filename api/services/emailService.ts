import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configuração para ambiente de desenvolvimento - usando Gmail SMTP
    const config: EmailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true para 465, false para outras portas
      auth: {
        user: process.env.SMTP_USER || 'seu-email@gmail.com',
        pass: process.env.SMTP_PASS || 'sua-senha-app',
      },
      // Configurações adicionais para melhor compatibilidade
      tls: {
        rejectUnauthorized: false, // Aceita certificados auto-assinados (apenas para desenvolvimento)
      },
    };

    this.transporter = nodemailer.createTransport(config);
    
    // Log da configuração (sem mostrar a senha)
    console.log('📧 EmailService inicializado:');
    console.log('📧 Host:', config.host);
    console.log('📧 Port:', config.port);
    console.log('📧 User:', config.auth.user);
    console.log('📧 Pass configurada:', config.auth.pass ? 'Sim' : 'Não');
  }

  async sendVerificationCode(email: string, code: string, name: string = ''): Promise<boolean> {
    try {
      // Verifica se as variáveis de ambiente estão configuradas
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;
      
      if (!smtpUser || !smtpPass || smtpUser === 'seu-email@gmail.com' || smtpPass === 'sua-senha-app') {
        console.error('❌ Configuração de email não encontrada ou inválida no .env');
        console.error('Verifique se SMTP_USER e SMTP_PASS estão configurados corretamente');
        return false;
      }

      console.log('📧 Tentando enviar email de verificação...');
      console.log('📧 Para:', email);
      console.log('📧 De:', smtpUser);
      console.log('📧 Host:', process.env.SMTP_HOST || 'smtp.gmail.com');
      console.log('📧 Port:', process.env.SMTP_PORT || '587');

      // Busca configuração da empresa
      const config = await prisma.configuration.findFirst();
      const companyName = config?.company_name || 'Central Contábil';
      const logoUrl = config?.logo_url || '';
      
      // Converte URL relativa em absoluta se necessário
      let absoluteLogoUrl = logoUrl;
      if (logoUrl && !logoUrl.startsWith('http://') && !logoUrl.startsWith('https://')) {
        // Se a logo começa com /uploads, é uma URL do servidor backend
        if (logoUrl.startsWith('/uploads/')) {
          // Em produção, usar a URL completa do servidor
          // Em desenvolvimento, usar localhost:3006 (porta do backend)
          const serverUrl = process.env.BASE_URL || 
                           process.env.SERVER_URL || 
                           process.env.API_URL ||
                           (process.env.NODE_ENV === 'production' 
                             ? (process.env.FRONTEND_URL || 'https://seudominio.com.br')
                             : 'http://localhost:3006');
          absoluteLogoUrl = `${serverUrl}${logoUrl}`;
          console.log('📧 Logo URL (/uploads) convertida:', absoluteLogoUrl);
        } else {
          // Para outras URLs relativas, usar o frontend
          const baseUrl = process.env.FRONTEND_URL || 
                         process.env.BASE_URL || 
                         'http://localhost:5173';
          absoluteLogoUrl = logoUrl.startsWith('/') ? `${baseUrl}${logoUrl}` : `${baseUrl}/${logoUrl}`;
          console.log('📧 Logo URL (outra) convertida:', absoluteLogoUrl);
        }
      } else if (logoUrl) {
        absoluteLogoUrl = logoUrl;
        console.log('📧 Logo URL absoluta:', absoluteLogoUrl);
      }

      // Verifica conexão com o servidor SMTP antes de enviar
      try {
        await this.transporter.verify();
        console.log('✅ Conexão SMTP verificada com sucesso');
      } catch (verifyError: any) {
        console.error('❌ Erro ao verificar conexão SMTP:', verifyError);
        console.error('❌ Código:', verifyError.code);
        console.error('❌ Mensagem:', verifyError.message);
        throw verifyError; // Propaga o erro para ser tratado no catch externo
      }

      const mailOptions = {
        from: `"${companyName}" <${smtpUser}>`,
        to: email,
        subject: `Código de Verificação - ${companyName}`,
        html: `
          <!DOCTYPE html>
          <html lang="pt-BR">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Código de Verificação</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
              <tr>
                <td align="center" style="padding: 40px 20px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header com Logo -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #3bb664 0%, #2d9a4f 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
                        ${absoluteLogoUrl ? `
                          <img src="${absoluteLogoUrl}" alt="${companyName}" style="max-width: 200px; max-height: 80px; height: auto; margin-bottom: 15px;" />
                        ` : `
                          <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">${companyName}</h1>
                          <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 14px; opacity: 0.95;">Soluções Empresariais</p>
                        `}
                      </td>
                    </tr>
                    
                    <!-- Conteúdo Principal -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <h2 style="margin: 0 0 10px 0; color: #111827; font-size: 24px; font-weight: 600;">Código de Verificação</h2>
                        <div style="width: 60px; height: 4px; background: linear-gradient(90deg, #3bb664 0%, #2d9a4f 100%); border-radius: 2px; margin-bottom: 30px;"></div>
                        
                        <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #374151;">
                          Olá${name ? ` <strong>${name}</strong>` : ''},
                        </p>
                        
                        <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: #374151;">
                          Você solicitou acesso à área administrativa da <strong>${companyName}</strong>. 
                          Use o código abaixo para completar seu login:
                        </p>
                        
                        <!-- Código de Verificação -->
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                          <tr>
                            <td align="center" style="padding: 0 0 30px 0;">
                              <div style="
                                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                                border: 2px solid #3bb664;
                                border-radius: 12px;
                                padding: 25px 40px;
                                display: inline-block;
                                box-shadow: 0 2px 4px rgba(59, 182, 100, 0.1);
                              ">
                                <div style="
                                  font-size: 32px;
                                  font-weight: 700;
                                  color: #3bb664;
                                  letter-spacing: 4px;
                                  font-family: 'Courier New', monospace;
                                  text-align: center;
                                ">
                                  ${code}
                                </div>
                              </div>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- Informações Adicionais -->
                        <div style="background-color: #f9fafb; border-left: 4px solid #3bb664; padding: 15px 20px; border-radius: 6px; margin-bottom: 30px;">
                          <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.5;">
                            <strong style="color: #374151;">⏱️ Este código expira em 10 minutos.</strong><br>
                            Por segurança, não compartilhe este código com ninguém.
                          </p>
                        </div>
                        
                        <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
                          Se você não solicitou este código, por favor ignore este email ou entre em contato conosco imediatamente.
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f9fafb; padding: 25px 30px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0 0 10px 0; font-size: 13px; color: #6b7280; line-height: 1.5;">
                          <strong style="color: #374151;">${companyName}</strong><br>
                          ${config?.footer_years_text || '34 anos de excelência em serviços contábeis'}
                        </p>
                        ${config?.phone ? `
                          <p style="margin: 5px 0; font-size: 12px; color: #9ca3af;">
                            📞 ${config.phone}
                          </p>
                        ` : ''}
                        ${config?.email || config?.contact_email ? `
                          <p style="margin: 5px 0; font-size: 12px; color: #9ca3af;">
                            ✉️ ${config.email || config.contact_email}
                          </p>
                        ` : ''}
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Rodapé Externo -->
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; margin-top: 20px;">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <p style="margin: 0; font-size: 12px; color: #9ca3af; line-height: 1.5;">
                          Este é um email automático, por favor não responda.<br>
                          © ${new Date().getFullYear()} ${companyName}. Todos os direitos reservados.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
        text: `
          ${companyName} - Código de Verificação
          
          Olá${name ? ' ' + name : ''},
          
          Você solicitou acesso à área administrativa da ${companyName}.
          Use o código abaixo para completar seu login:
          
          Código: ${code}
          
          Este código expira em 10 minutos.
          
          Se você não solicitou este código, por favor ignore este email.
          
          ${companyName} - ${config?.footer_years_text || '34 anos de excelência em serviços contábeis'}
          ${config?.phone ? `\nTelefone: ${config.phone}` : ''}
          ${config?.email || config?.contact_email ? `\nEmail: ${config.email || config.contact_email}` : ''}
        `,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email de verificação enviado com sucesso!');
      console.log('✅ Message ID:', result.messageId);
      console.log('✅ Response:', result.response);
      return true;
    } catch (error: any) {
      console.error('❌ Erro ao enviar email de verificação:');
      console.error('❌ Tipo de erro:', error.constructor.name);
      console.error('❌ Mensagem:', error.message);
      console.error('❌ Código:', error.code);
      console.error('❌ Stack:', error.stack);
      
      // Mensagens de erro mais específicas
      if (error.code === 'EAUTH') {
        console.error('❌ Erro de autenticação: Verifique SMTP_USER e SMTP_PASS no .env');
      } else if (error.code === 'ECONNECTION') {
        console.error('❌ Erro de conexão: Verifique SMTP_HOST e SMTP_PORT no .env');
      } else if (error.code === 'ETIMEDOUT') {
        console.error('❌ Timeout: O servidor SMTP não respondeu a tempo');
      }
      
      return false;
    }
  }

  async sendSMSVerificationCode(phone: string, code: string): Promise<boolean> {
    // Para implementação futura com Twilio
    console.log(`SMS enviado para ${phone}: Código ${code}`);
    return true;
  }

  async sendContactNotification(
    recipientEmail: string,
    contactData: {
      name: string;
      email: string;
      phone?: string;
      serviceType?: string;
      message: string;
    }
  ): Promise<boolean> {
    try {
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;
      
      if (!smtpUser || !smtpPass || smtpUser === 'seu-email@gmail.com' || smtpPass === 'sua-senha-app') {
        console.error('❌ Configuração de email não encontrada ou inválida no .env');
        return false;
      }

      console.log('📧 Enviando notificação de contato...');
      console.log('📧 Para:', recipientEmail);

      const mailOptions = {
        from: `"Central Contábil" <${smtpUser}>`,
        to: recipientEmail,
        subject: `Nova Mensagem de Contato - ${contactData.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #3bb664; padding: 20px; text-align: center; color: white;">
              <h1 style="margin: 0;">Central Contábil</h1>
              <p style="margin: 10px 0 0 0; font-size: 14px;">Nova Mensagem de Contato</p>
            </div>
            
            <div style="padding: 30px; background-color: #f9fafb;">
              <h2 style="color: #3bb664; margin-bottom: 20px;">Você recebeu uma nova mensagem</h2>
              
              <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0 0 10px 0;"><strong>Nome:</strong> ${contactData.name}</p>
                <p style="margin: 0 0 10px 0;"><strong>Email:</strong> <a href="mailto:${contactData.email}">${contactData.email}</a></p>
                ${contactData.phone ? `<p style="margin: 0 0 10px 0;"><strong>Telefone:</strong> <a href="tel:${contactData.phone.replace(/\D/g, '')}">${contactData.phone}</a></p>` : ''}
                ${contactData.serviceType ? `<p style="margin: 0 0 10px 0;"><strong>Tipo de Serviço:</strong> ${contactData.serviceType}</p>` : ''}
              </div>
              
              <div style="background-color: white; padding: 20px; border-radius: 8px;">
                <p style="margin: 0 0 10px 0;"><strong>Mensagem:</strong></p>
                <p style="margin: 0; line-height: 1.6; color: #374151; white-space: pre-wrap;">${contactData.message}</p>
              </div>
              
              <div style="margin-top: 20px; text-align: center;">
                <a href="mailto:${contactData.email}" style="
                  display: inline-block;
                  background-color: #3bb664;
                  color: white;
                  padding: 12px 24px;
                  text-decoration: none;
                  border-radius: 6px;
                  font-weight: bold;
                ">Responder</a>
              </div>
            </div>
            
            <div style="background-color: #3bb664; padding: 15px; text-align: center;">
              <p style="color: white; font-size: 12px; margin: 0;">
                Central Contábil - 34 anos de excelência em serviços contábeis
              </p>
            </div>
          </div>
        `,
        text: `
          Central Contábil - Nova Mensagem de Contato
          
          Nome: ${contactData.name}
          Email: ${contactData.email}
          ${contactData.phone ? `Telefone: ${contactData.phone}` : ''}
          ${contactData.serviceType ? `Tipo de Serviço: ${contactData.serviceType}` : ''}
          
          Mensagem:
          ${contactData.message}
          
          Central Contábil - 34 anos de excelência em serviços contábeis
        `,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email de notificação de contato enviado com sucesso!');
      console.log('✅ Message ID:', result.messageId);
      return true;
    } catch (error: any) {
      console.error('❌ Erro ao enviar email de notificação de contato:');
      console.error('❌ Mensagem:', error.message);
      return false;
    }
  }

  async sendReply(
    recipientEmail: string,
    recipientName: string,
    replyMessage: string,
    originalMessage?: {
      name: string;
      email: string;
      message: string;
      date: string;
    }
  ): Promise<boolean> {
    try {
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;
      
      if (!smtpUser || !smtpPass || smtpUser === 'seu-email@gmail.com' || smtpPass === 'sua-senha-app') {
        console.error('❌ Configuração de email não encontrada ou inválida no .env');
        return false;
      }

      console.log('📧 Enviando resposta de contato...');
      console.log('📧 Para:', recipientEmail);

      const mailOptions = {
        from: `"Central Contábil" <${smtpUser}>`,
        to: recipientEmail,
        subject: 'Resposta - Central Contábil',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #3bb664; padding: 20px; text-align: center; color: white;">
              <h1 style="margin: 0;">Central Contábil</h1>
              <p style="margin: 10px 0 0 0; font-size: 14px;">Soluções Empresariais</p>
            </div>
            
            <div style="padding: 30px; background-color: #f9fafb;">
              <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 20px;">
                Olá <strong>${recipientName}</strong>,
              </p>
              
              <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0; line-height: 1.6; color: #374151; white-space: pre-wrap;">${replyMessage}</p>
              </div>
              
              ${originalMessage ? `
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; border-left: 4px solid #3bb664; margin-top: 20px;">
                  <p style="margin: 0 0 10px 0; font-size: 12px; color: #6b7280; font-weight: bold;">Mensagem original:</p>
                  <p style="margin: 0 0 5px 0; font-size: 12px; color: #6b7280;"><strong>De:</strong> ${originalMessage.name} (${originalMessage.email})</p>
                  <p style="margin: 0 0 5px 0; font-size: 12px; color: #6b7280;"><strong>Data:</strong> ${originalMessage.date}</p>
                  <p style="margin: 0; font-size: 12px; color: #6b7280; white-space: pre-wrap;">${originalMessage.message}</p>
                </div>
              ` : ''}
              
              <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
                Atenciosamente,<br>
                <strong>Equipe Central Contábil</strong>
              </p>
            </div>
            
            <div style="background-color: #3bb664; padding: 15px; text-align: center;">
              <p style="color: white; font-size: 12px; margin: 0;">
                Central Contábil - 34 anos de excelência em serviços contábeis
              </p>
            </div>
          </div>
        `,
        text: `
          Central Contábil - Resposta
        
          Olá ${recipientName},
        
          ${replyMessage}
        
          ${originalMessage ? `
          Mensagem original:
          De: ${originalMessage.name} (${originalMessage.email})
          Data: ${originalMessage.date}
          ${originalMessage.message}
          ` : ''}
        
          Atenciosamente,
          Equipe Central Contábil
        
          Central Contábil - 34 anos de excelência em serviços contábeis
        `,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email de resposta enviado com sucesso!');
      console.log('✅ Message ID:', result.messageId);
      return true;
    } catch (error: any) {
      console.error('❌ Erro ao enviar email de resposta:');
      console.error('❌ Mensagem:', error.message);
      return false;
    }
  }
}

export const emailService = new EmailService();