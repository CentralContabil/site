import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { db } from '../lib/db.js';
import { AuthRequest } from '../middleware/auth';
import { authCodeService } from '../services/authCodeService';
import { AccessLogService } from '../services/accessLogService.js';

const prisma = new PrismaClient();

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

const sendCodeSchema = z.object({
  email: z.string().email('Email inválido'),
  type: z.enum(['email', 'sms']).optional().default('email'),
});

const verifyCodeSchema = z.object({
  email: z.string().email('Email inválido'),
  code: z.string()
    .min(6, 'Código deve ter 6 dígitos')
    .max(6, 'Código deve ter 6 dígitos')
    .regex(/^\d{6}$/, 'Código deve conter apenas números'),
});

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const admin = db.getAdminByEmail(email);

    if (!admin) {
      // Registrar tentativa de login falha (sem admin)
      await AccessLogService.logAccess({
        adminId: '',
        adminEmail: email,
        adminName: 'Desconhecido',
        ipAddress: AccessLogService.getClientIp(req),
        userAgent: AccessLogService.getUserAgent(req),
        loginMethod: 'password',
        success: false,
      });
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const isValidPassword = await bcrypt.compare(password, admin.password_hash);

    if (!isValidPassword) {
      // Registrar tentativa de login falha (senha incorreta)
      await AccessLogService.logAccess({
        adminId: admin.id,
        adminEmail: admin.email,
        adminName: admin.name,
        ipAddress: AccessLogService.getClientIp(req),
        userAgent: AccessLogService.getUserAgent(req),
        loginMethod: 'password',
        success: false,
      });
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, name: admin.name },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    // Registrar log de acesso
    await AccessLogService.logAccess({
      adminId: admin.id,
      adminEmail: admin.email,
      adminName: admin.name,
      ipAddress: AccessLogService.getClientIp(req),
      userAgent: AccessLogService.getUserAgent(req),
      loginMethod: 'password',
      success: true,
    });

    res.json({
      token,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.issues });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
};

export const me = async (req: AuthRequest, res: Response) => {
  try {
    const admin = db.getAdmin(req.user!.id);

    if (!admin) {
      return res.status(404).json({ error: 'Administrador não encontrado' });
    }

    res.json({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      created_at: admin.created_at,
      updated_at: admin.updated_at,
    });
  } catch (error) {
    console.error('Get admin error:', error);
    res.status(500).json({ error: 'Erro ao buscar administrador' });
  }
};

/**
 * Envia código de verificação para autenticação
 */
export const sendCode = async (req: Request, res: Response) => {
  try {
    const { email, type } = sendCodeSchema.parse(req.body);
    
    console.log(`📧 Recebida solicitação para enviar código para: ${email}`);
    
    const result = await authCodeService.sendAuthCode(email, type);
    
    console.log(`📧 Resultado do envio:`, result);
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: result.message,
        email: email 
      });
    } else {
      // Retorna 400 para erros de validação/configuração
      res.status(400).json({ 
        success: false, 
        error: result.message || 'Erro ao enviar código de verificação',
        message: result.message 
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        error: 'Dados inválidos', 
        details: error.issues 
      });
    }
    console.error('❌ Erro ao enviar código:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno ao enviar código de verificação',
      message: 'Erro interno ao processar solicitação. Tente novamente mais tarde.'
    });
  }
};

/**
 * Verifica código de autenticação e realiza login
 */
export const verifyCode = async (req: Request, res: Response) => {
  try {
    const { email, code } = verifyCodeSchema.parse(req.body);
    
    console.log(`🔐 Tentativa de verificação de código 2FA para: ${email}`);
    console.log(`🔐 Código recebido: ${code}`);
    
    const result = await authCodeService.validateAuthCode(email, code);
    
    console.log(`🔐 Resultado da validação:`, { success: result.success, message: result.message });
    
    if (result.success) {
      console.log(`✅ Código 2FA verificado com sucesso para: ${email}`);
      
      // Registrar log de acesso 2FA
      if (result.user) {
        await AccessLogService.logAccess({
          adminId: result.user.id,
          adminEmail: result.user.email,
          adminName: result.user.name,
          ipAddress: AccessLogService.getClientIp(req),
          userAgent: AccessLogService.getUserAgent(req),
          loginMethod: '2fa',
          success: true,
        });
      }
      
      res.json({ 
        success: true, 
        message: result.message,
        token: result.token,
        user: result.user || {
          email: email
        }
      });
    } else {
      console.warn(`⚠️ Falha na verificação do código 2FA para: ${email}`);
      console.warn(`⚠️ Motivo: ${result.message}`);
      
      // Registrar tentativa de login 2FA falha
      try {
        const admin = await prisma.admin.findUnique({
          where: { email: email.toLowerCase().trim() }
        });
        
        if (admin) {
          await AccessLogService.logAccess({
            adminId: admin.id,
            adminEmail: admin.email,
            adminName: admin.name,
            ipAddress: AccessLogService.getClientIp(req),
            userAgent: AccessLogService.getUserAgent(req),
            loginMethod: '2fa',
            success: false,
          });
        } else {
          await AccessLogService.logAccess({
            adminId: '',
            adminEmail: email,
            adminName: 'Desconhecido',
            ipAddress: AccessLogService.getClientIp(req),
            userAgent: AccessLogService.getUserAgent(req),
            loginMethod: '2fa',
            success: false,
          });
        }
      } catch (logError) {
        console.error('Erro ao registrar log de acesso:', logError);
      }
      
      res.status(400).json({ 
        success: false, 
        error: result.message || 'Código inválido ou expirado',
        message: result.message || 'Código inválido ou expirado. Solicite um novo código.'
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        error: 'Dados inválidos', 
        details: error.issues 
      });
    }
    console.error('❌ Erro ao verificar código 2FA:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao verificar código de autenticação',
      message: 'Erro interno ao processar solicitação. Tente novamente mais tarde.'
    });
  }
};
