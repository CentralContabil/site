import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Admin, AdminRole } from '../types';

export interface AuthRequest extends Request {
  user?: Admin;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido' });
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido ou expirado' });
    }

    req.user = decoded as Admin;
    next();
  });
};

/**
 * Middleware de autorização por papel (role), inspirado nos níveis do WordPress.
 * Exemplo de uso: authorizeRoles(['administrator'])
 */
export const authorizeRoles = (allowedRoles: AdminRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const userRole = req.user.role || 'administrator';

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: 'Você não tem permissão para acessar este recurso' });
    }

    next();
  };
};