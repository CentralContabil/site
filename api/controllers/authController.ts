import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { db } from '../lib/db.js';
import { AuthRequest } from '../middleware/auth';
import { authCodeService } from '../services/authCodeService';

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
  code: z.string().length(6, 'Código deve ter 6 dígitos'),
});

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const admin = db.getAdminByEmail(email);

    if (!admin) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const isValidPassword = await bcrypt.compare(password, admin.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, name: admin.name },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

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
    
    const result = await authCodeService.sendAuthCode(email, type);
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: result.message,
        email: email 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        error: result.message 
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
    console.error('Send code error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao enviar código de verificação' 
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
    
    const result = await authCodeService.validateAuthCode(email, code);
    
    if (result.success) {
      console.log(`✅ Código 2FA verificado com sucesso para: ${email}`);
      res.json({ 
        success: true, 
        message: result.message,
        token: result.token,
        user: result.user || {
          email: email
        }
      });
    } else {
      console.warn(`⚠️ Falha na verificação do código 2FA para: ${email} - ${result.message}`);
      res.status(400).json({ 
        success: false, 
        error: result.message 
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
      error: 'Erro ao verificar código de autenticação' 
    });
  }
};
