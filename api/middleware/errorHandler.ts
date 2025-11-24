import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: 'Erro de validação',
      details: error.issues,
    });
  }

  console.error('Error:', error);
  
  return res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Ocorreu um erro inesperado',
  });
};
