import nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  tls?: {
    rejectUnauthorized: boolean;
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
        from: `"Central Contábil" <${smtpUser}>`,
        to: email,
        subject: 'Código de Verificação - Central Contábil',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #3bb664; padding: 20px; text-align: center; color: white;">
              <h1 style="margin: 0;">Central Contábil</h1>
              <p style="margin: 10px 0 0 0; font-size: 14px;">Soluções Empresariais</p>
            </div>
            
            <div style="padding: 30px; background-color: #f9fafb;">
              <h2 style="color: #3bb664; margin-bottom: 20px;">Código de Verificação</h2>
              
              <p style="font-size: 16px; line-height: 1.6; color: #374151;">
                Olá${name ? ' ' + name : ''},
              </p>
              
              <p style="font-size: 16px; line-height: 1.6; color: #374151;">
                Você solicitou acesso à área administrativa da Central Contábil. 
                Use o código abaixo para completar seu login:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <div style="
                  background-color: #ffffff;
                  border: 2px solid #3bb664;
                  border-radius: 8px;
                  padding: 20px;
                  display: inline-block;
                  font-size: 24px;
                  font-weight: bold;
                  color: #3bb664;
                  letter-spacing: 2px;
                ">
                  ${code}
                </div>
              </div>
              
              <p style="font-size: 14px; color: #6b7280; text-align: center;">
                Este código expira em 10 minutos.
              </p>
              
              <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
                Se você não solicitou este código, por favor ignore este email.
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
          Central Contábil - Código de Verificação
          
          Olá${name ? ' ' + name : ''},
          
          Você solicitou acesso à área administrativa da Central Contábil.
          Use o código abaixo para completar seu login:
          
          Código: ${code}
          
          Este código expira em 10 minutos.
          
          Se você não solicitou este código, por favor ignore este email.
          
          Central Contábil - 34 anos de excelência em serviços contábeis
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

  async sendCareerApplicationNotification(
    recipientEmail: string,
    applicationData: {
      name: string;
      email: string;
      phone?: string;
      position?: string;
      message?: string;
      cvUrl?: string;
      linkedinUrl?: string;
    }
  ): Promise<boolean> {
    try {
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;

      if (!smtpUser || !smtpPass || smtpUser === 'seu-email@gmail.com' || smtpPass === 'sua-senha-app') {
        console.error('❌ Configuração de email não encontrada ou inválida no .env');
        return false;
      }

      console.log('📧 Enviando notificação de candidatura...');
      console.log('📧 Para:', recipientEmail);

      const mailOptions = {
        from: `"Central Contábil" <${smtpUser}>`,
        to: recipientEmail,
        subject: `Nova Candidatura - ${applicationData.position || 'Trabalhe Conosco'} - ${applicationData.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #3bb664; padding: 20px; text-align: center; color: white;">
              <h1 style="margin: 0;">Central Contábil</h1>
              <p style="margin: 10px 0 0 0; font-size: 14px;">Nova Candidatura Recebida</p>
            </div>

            <div style="padding: 30px; background-color: #f9fafb;">
              <h2 style="color: #3bb664; margin-bottom: 20px;">Você recebeu uma nova candidatura</h2>

              <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0 0 10px 0;"><strong>Nome:</strong> ${applicationData.name}</p>
                <p style="margin: 0 0 10px 0;"><strong>Email:</strong> <a href="mailto:${applicationData.email}">${applicationData.email}</a></p>
                ${applicationData.phone ? `<p style="margin: 0 0 10px 0;"><strong>Telefone:</strong> <a href="tel:${applicationData.phone.replace(/\D/g, '')}">${applicationData.phone}</a></p>` : ''}
                ${applicationData.position ? `<p style="margin: 0 0 10px 0;"><strong>Vaga:</strong> ${applicationData.position}</p>` : ''}
                ${applicationData.linkedinUrl ? `<p style="margin: 0 0 10px 0;"><strong>LinkedIn:</strong> <a href="${applicationData.linkedinUrl}">${applicationData.linkedinUrl}</a></p>` : ''}
                ${applicationData.cvUrl ? `<p style="margin: 0 0 10px 0;"><strong>Currículo:</strong> <a href="${applicationData.cvUrl}" style="color: #3bb664;">Baixar currículo</a></p>` : ''}
              </div>

              ${applicationData.message ? `
              <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0 0 10px 0;"><strong>Mensagem:</strong></p>
                <p style="margin: 0; line-height: 1.6; color: #374151; white-space: pre-wrap;">${applicationData.message}</p>
              </div>
              ` : ''}

              <div style="margin-top: 20px; text-align: center;">
                <a href="mailto:${applicationData.email}" style="
                  display: inline-block;
                  background-color: #3bb664;
                  color: white;
                  padding: 12px 24px;
                  text-decoration: none;
                  border-radius: 6px;
                  font-weight: bold;
                ">Responder ao Candidato</a>
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
          Central Contábil - Nova Candidatura Recebida

          Nome: ${applicationData.name}
          Email: ${applicationData.email}
          ${applicationData.phone ? `Telefone: ${applicationData.phone}` : ''}
          ${applicationData.position ? `Vaga: ${applicationData.position}` : ''}
          ${applicationData.linkedinUrl ? `LinkedIn: ${applicationData.linkedinUrl}` : ''}
          ${applicationData.cvUrl ? `Currículo: ${applicationData.cvUrl}` : ''}
          ${applicationData.message ? `\nMensagem:\n${applicationData.message}` : ''}

          Central Contábil - 34 anos de excelência em serviços contábeis
        `,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email de notificação de candidatura enviado com sucesso!');
      console.log('✅ Message ID:', result.messageId);
      return true;
    } catch (error: any) {
      console.error('❌ Erro ao enviar email de notificação de candidatura:');
      console.error('❌ Mensagem:', error.message);
      return false;
    }
  }

  async sendLandingPageNotification(
    recipientEmail: string,
    data: {
      landingPageTitle: string;
      landingPageSlug: string;
      formData: Record<string, any>;
      formFields: Array<{ field_label: string; field_name: string }>;
    }
  ): Promise<boolean> {
    try {
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;
      
      if (!smtpUser || !smtpPass || smtpUser === 'seu-email@gmail.com' || smtpPass === 'sua-senha-app') {
        console.error('❌ Configuração de email não encontrada ou inválida no .env');
        return false;
      }

      console.log('📧 Enviando notificação de landing page...');
      console.log('📧 Para:', recipientEmail);
      console.log('📧 Landing Page:', data.landingPageTitle);

      // Criar HTML com os campos do formulário
      const formFieldsHtml = data.formFields.map(field => {
        const value = data.formData[field.field_name] || 'Não preenchido';
        return `<p style="margin: 0 0 10px 0;"><strong>${field.field_label}:</strong> ${String(value)}</p>`;
      }).join('');

      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const landingPageUrl = `${baseUrl}/${data.landingPageSlug}`;

      const mailOptions = {
        from: `"Central Contábil" <${smtpUser}>`,
        to: recipientEmail,
        subject: `Nova Submissão - Landing Page: ${data.landingPageTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #3bb664; padding: 20px; text-align: center; color: white;">
              <h1 style="margin: 0;">Central Contábil</h1>
              <p style="margin: 10px 0 0 0; font-size: 14px;">Nova Submissão de Formulário</p>
            </div>
            
            <div style="padding: 30px; background-color: #f9fafb;">
              <h2 style="color: #3bb664; margin-bottom: 20px;">Nova submissão recebida</h2>
              
              <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0 0 15px 0; font-weight: bold; color: #3bb664; font-size: 16px;">
                  Landing Page: ${data.landingPageTitle}
                </p>
                <p style="margin: 0 0 10px 0; font-size: 14px;">
                  <strong>URL:</strong> <a href="${landingPageUrl}" style="color: #3bb664;">${landingPageUrl}</a>
                </p>
              </div>
              
              <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #374151; margin-top: 0; margin-bottom: 15px;">Dados do Formulário:</h3>
                ${formFieldsHtml}
              </div>
              
              <div style="margin-top: 20px; text-align: center;">
                <a href="${landingPageUrl}" style="
                  display: inline-block;
                  background-color: #3bb664;
                  color: white;
                  padding: 12px 24px;
                  text-decoration: none;
                  border-radius: 6px;
                  font-weight: bold;
                ">Ver Landing Page</a>
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
          Central Contábil - Nova Submissão de Formulário
          
          Landing Page: ${data.landingPageTitle}
          URL: ${landingPageUrl}
          
          Dados do Formulário:
          ${data.formFields.map(field => {
            const value = data.formData[field.field_name] || 'Não preenchido';
            return `${field.field_label}: ${String(value)}`;
          }).join('\n')}
          
          Central Contábil - 34 anos de excelência em serviços contábeis
        `,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email de notificação de landing page enviado com sucesso!');
      console.log('✅ Message ID:', result.messageId);
      return true;
    } catch (error: any) {
      console.error('❌ Erro ao enviar email de notificação de landing page:');
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