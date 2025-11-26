import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { FileService } from '../services/fileService';

// Esquema de validação
const updateLoginPageSchema = z.object({
  background_image_url: z.string().nullable().optional(),
  welcome_text: z.string().optional().nullable(),
  title_line1: z.string().optional().nullable(),
  title_line2: z.string().optional().nullable(),
  button_text: z.string().optional().nullable(),
  button_link: z.string().optional().nullable(),
  button_icon: z.string().optional().nullable(),
});

/**
 * Obtém os dados da Página de Login (público)
 */
export const getLoginPage = async (req: Request, res: Response) => {
  try {
    let loginPage = await prisma.loginPage.findFirst();

    // Se não existir, criar um registro padrão
    if (!loginPage) {
      loginPage = await prisma.loginPage.create({
        data: {
          background_image_url: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1920&h=1080&fit=crop&q=80',
          welcome_text: 'We are glad to see you again!',
          title_line1: 'Join our next negotiation group in',
          title_line2: 'few minutes!',
          button_text: 'Watch demo',
          button_link: '#',
          button_icon: 'play',
        },
      });
    }

    res.json({
      success: true,
      loginPage: {
        id: loginPage.id,
        backgroundImageUrl: loginPage.background_image_url,
        welcomeText: loginPage.welcome_text,
        titleLine1: loginPage.title_line1,
        titleLine2: loginPage.title_line2,
        buttonText: loginPage.button_text,
        buttonLink: loginPage.button_link,
        buttonIcon: loginPage.button_icon,
        updatedAt: loginPage.updated_at,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar LoginPage:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar dados da Página de Login',
    });
  }
};

/**
 * Atualiza os dados da Página de Login (admin)
 */
export const updateLoginPage = async (req: AuthRequest, res: Response) => {
  try {
    const validation = updateLoginPageSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.errors[0].message,
      });
    }

    const data = validation.data;

    // Converter camelCase para snake_case
    const updateData: any = {};
    if (data.background_image_url !== undefined) updateData.background_image_url = data.background_image_url;
    if (data.welcome_text !== undefined) updateData.welcome_text = data.welcome_text;
    if (data.title_line1 !== undefined) updateData.title_line1 = data.title_line1;
    if (data.title_line2 !== undefined) updateData.title_line2 = data.title_line2;
    if (data.button_text !== undefined) updateData.button_text = data.button_text;
    if (data.button_link !== undefined) updateData.button_link = data.button_link;
    if (data.button_icon !== undefined) updateData.button_icon = data.button_icon;

    // Buscar ou criar o registro
    let loginPage = await prisma.loginPage.findFirst();

    if (!loginPage) {
      loginPage = await prisma.loginPage.create({
        data: {
          background_image_url: updateData.background_image_url || 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1920&h=1080&fit=crop&q=80',
          welcome_text: updateData.welcome_text || null,
          title_line1: updateData.title_line1 || null,
          title_line2: updateData.title_line2 || null,
          button_text: updateData.button_text || null,
          button_link: updateData.button_link || null,
          button_icon: updateData.button_icon || null,
        },
      });
    } else {
      loginPage = await prisma.loginPage.update({
        where: { id: loginPage.id },
        data: updateData,
      });
    }

    res.json({
      success: true,
      loginPage: {
        id: loginPage.id,
        backgroundImageUrl: loginPage.background_image_url,
        welcomeText: loginPage.welcome_text,
        titleLine1: loginPage.title_line1,
        titleLine2: loginPage.title_line2,
        buttonText: loginPage.button_text,
        buttonLink: loginPage.button_link,
        buttonIcon: loginPage.button_icon,
        updatedAt: loginPage.updated_at,
      },
    });
  } catch (error) {
    console.error('Erro ao atualizar LoginPage:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar dados da Página de Login',
    });
  }
};

/**
 * Faz upload de imagem da Página de Login (admin)
 */
export const uploadLoginPageImage = async (req: AuthRequest, res: Response) => {
  try {
    console.log('📤 uploadLoginPageImage iniciado');
    
    if (!req.file) {
      console.log('❌ Nenhum arquivo recebido');
      return res.status(400).json({
        success: false,
        error: 'Nenhum arquivo enviado',
      });
    }

    const { type } = req.body;
    
    if (!type || type !== 'background') {
      return res.status(400).json({
        success: false,
        error: 'Tipo de imagem inválido. Use "background"',
      });
    }

    console.log('📁 Arquivo recebido:', req.file.originalname);
    console.log('📁 Tipo:', type);

    // Fazer upload usando FileService
    const uploadResult = await FileService.uploadFile(req.file, 'login-page');

    console.log('✅ Upload concluído:', uploadResult.url);

    // Buscar ou criar LoginPage
    let loginPage = await prisma.loginPage.findFirst();
    
    if (!loginPage) {
      loginPage = await prisma.loginPage.create({
        data: {
          background_image_url: uploadResult.url,
        },
      });
    } else {
      // Deletar imagem antiga se existir
      if (loginPage.background_image_url) {
        try {
          await FileService.deleteFile(loginPage.background_image_url);
        } catch (error) {
          // Não interrompe o upload se a deleção falhar
          console.warn('⚠️ Erro ao deletar imagem antiga (continuando com upload):', error);
        }
      }

      // Atualiza LoginPage com nova imagem
      loginPage = await prisma.loginPage.update({
        where: { id: loginPage.id },
        data: {
          background_image_url: uploadResult.url,
        },
      });
    }

    console.log('✅ LoginPage atualizado com sucesso');
    
    res.json({
      success: true,
      message: 'Imagem enviada com sucesso',
      data: {
        url: uploadResult.url,
        type,
      },
      loginPage: {
        id: loginPage.id,
        backgroundImageUrl: loginPage.background_image_url,
        welcomeText: loginPage.welcome_text,
        titleLine1: loginPage.title_line1,
        titleLine2: loginPage.title_line2,
        buttonText: loginPage.button_text,
        buttonLink: loginPage.button_link,
        buttonIcon: loginPage.button_icon,
        updatedAt: loginPage.updated_at,
      },
    });
  } catch (error: any) {
    console.error('❌ Erro ao fazer upload da imagem da Página de Login:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Erro ao fazer upload da imagem',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
};

/**
 * Deleta imagem da Página de Login (admin)
 */
export const deleteLoginPageImage = async (req: AuthRequest, res: Response) => {
  try {
    const { type } = req.params;
    
    if (type !== 'background') {
      return res.status(400).json({
        success: false,
        error: 'Tipo de imagem inválido. Use "background"',
      });
    }

    let loginPage = await prisma.loginPage.findFirst();
    
    if (!loginPage) {
      return res.status(404).json({
        success: false,
        error: 'LoginPage não encontrado',
      });
    }

    if (loginPage.background_image_url) {
      try {
        await FileService.deleteFile(loginPage.background_image_url);
      } catch (error) {
        console.warn('⚠️ Erro ao deletar arquivo físico (continuando):', error);
      }
    }

    loginPage = await prisma.loginPage.update({
      where: { id: loginPage.id },
      data: {
        background_image_url: null,
      },
    });

    res.json({
      success: true,
      message: 'Imagem removida com sucesso',
      loginPage: {
        id: loginPage.id,
        backgroundImageUrl: loginPage.background_image_url,
        welcomeText: loginPage.welcome_text,
        titleLine1: loginPage.title_line1,
        titleLine2: loginPage.title_line2,
        buttonText: loginPage.button_text,
        buttonLink: loginPage.button_link,
        buttonIcon: loginPage.button_icon,
        updatedAt: loginPage.updated_at,
      },
    });
  } catch (error) {
    console.error('Erro ao deletar imagem da Página de Login:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao deletar imagem',
    });
  }
};

