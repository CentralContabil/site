import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';
import { FileService } from '../services/fileService.js';
import multer from 'multer';

const prisma = new PrismaClient();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

export class PrivacyPolicyController {
  // Obter política de privacidade (público)
  static async getPrivacyPolicy(req: Request, res: Response) {
    try {
      let policy = await prisma.privacyPolicy.findFirst();
      
      if (!policy) {
        // Criar política padrão se não existir
        policy = await prisma.privacyPolicy.create({
          data: {
            title: 'Política de Privacidade',
            content: '<p>Esta é a política de privacidade da empresa. Por favor, edite este conteúdo na área administrativa.</p>',
          },
        });
      }

      res.json({ success: true, policy });
    } catch (error) {
      console.error('Erro ao buscar política de privacidade:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar política de privacidade',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  // Obter política de privacidade (admin)
  static async getPrivacyPolicyAdmin(req: Request, res: Response) {
    try {
      let policy = await prisma.privacyPolicy.findFirst();
      
      if (!policy) {
        policy = await prisma.privacyPolicy.create({
          data: {
            title: 'Política de Privacidade',
            content: '<p>Esta é a política de privacidade da empresa. Por favor, edite este conteúdo.</p>',
          },
        });
      }

      res.json({ success: true, policy });
    } catch (error) {
      console.error('Erro ao buscar política de privacidade:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar política de privacidade',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  // Atualizar política de privacidade
  static async updatePrivacyPolicy(req: Request, res: Response) {
    try {
      const { title, content, background_image_url } = req.body;

      // Log para debug
      console.log('Recebendo atualização de política:', {
        titleLength: title?.length || 0,
        contentLength: content?.length || 0,
        containsTable: content?.includes('<table') || false,
        containsTableBody: content?.includes('<tbody') || false,
        containsTableRow: content?.includes('<tr') || false,
        containsTableCell: content?.includes('<td') || false,
      });

      // Log uma amostra do conteúdo
      if (content && content.length > 0) {
        const sample = content.substring(0, 500);
        console.log('Amostra do conteúdo recebido (primeiros 500 chars):', sample);
      }

      let policy = await prisma.privacyPolicy.findFirst();
      
      if (!policy) {
        policy = await prisma.privacyPolicy.create({
          data: {
            title: title || 'Política de Privacidade',
            content: content || '',
            background_image_url: background_image_url !== undefined ? background_image_url : null,
          },
        });
      } else {
        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (content !== undefined) updateData.content = content;
        if (background_image_url !== undefined) updateData.background_image_url = background_image_url;

        policy = await prisma.privacyPolicy.update({
          where: { id: policy.id },
          data: updateData,
        });
      }

      // Verificar se a tabela foi salva
      const savedContent = policy.content || '';
      console.log('Conteúdo salvo no banco:', {
        contentLength: savedContent.length,
        containsTable: savedContent.includes('<table'),
        containsTableBody: savedContent.includes('<tbody'),
        containsTableRow: savedContent.includes('<tr'),
        containsTableCell: savedContent.includes('<td'),
      });

      res.json({ success: true, policy });
    } catch (error) {
      console.error('Erro ao atualizar política de privacidade:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao atualizar política de privacidade',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  // Upload de imagem de fundo
  static async uploadBackgroundImage(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'Nenhum arquivo enviado' });
      }

      FileService.validateImageFile(req.file);
      const uploadResult = await FileService.uploadFile(req.file);
      
      let policy = await prisma.privacyPolicy.findFirst();
      if (!policy) {
        policy = await prisma.privacyPolicy.create({
          data: {
            title: 'Política de Privacidade',
            content: '',
          },
        });
      }
      
      const oldImageUrl = policy.background_image_url;
      if (oldImageUrl && oldImageUrl.startsWith('/uploads/')) {
        try {
          const oldFilename = oldImageUrl.split('/').pop();
          if (oldFilename) await FileService.deleteFile(oldFilename);
        } catch (e) {
          console.warn('Erro ao deletar imagem antiga:', e);
        }
      }
      
      policy = await prisma.privacyPolicy.update({
        where: { id: policy.id },
        data: { background_image_url: uploadResult.url },
      });
      
      res.json({ success: true, policy, data: { url: uploadResult.url } });
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      res.status(500).json({ success: false, error: error.message || 'Erro ao fazer upload' });
    }
  }
}

