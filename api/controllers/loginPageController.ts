import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar multer para upload de imagens
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, '../../public/uploads');
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `login-page-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas (JPG, PNG, GIF, WebP)'));
    }
  }
});

// GET /api/login-page - Buscar dados da página de login
export const getLoginPage = async (req: Request, res: Response) => {
  try {
    let loginPage = await prisma.loginPage.findFirst();

    // Se não existir, cria um registro padrão
    if (!loginPage) {
      loginPage = await prisma.loginPage.create({
        data: {}
      });
    }

    res.json({ loginPage });
  } catch (error: any) {
    console.error('Erro ao buscar LoginPage:', error);
    res.status(500).json({ error: 'Erro ao buscar dados da página de login' });
  }
};

// PUT /api/login-page - Atualizar dados da página de login
export const updateLoginPage = async (req: AuthRequest, res: Response) => {
  try {
    const {
      background_image_url,
      welcome_text,
      title_line1,
      title_line2,
      button_text,
      button_link,
      button_icon
    } = req.body;

    let loginPage = await prisma.loginPage.findFirst();

    if (!loginPage) {
      loginPage = await prisma.loginPage.create({
        data: {
          background_image_url: background_image_url || null,
          welcome_text: welcome_text || null,
          title_line1: title_line1 || null,
          title_line2: title_line2 || null,
          button_text: button_text || null,
          button_link: button_link || null,
          button_icon: button_icon || null
        }
      });
    } else {
      loginPage = await prisma.loginPage.update({
        where: { id: loginPage.id },
        data: {
          background_image_url: background_image_url !== undefined ? background_image_url : loginPage.background_image_url,
          welcome_text: welcome_text !== undefined ? welcome_text : loginPage.welcome_text,
          title_line1: title_line1 !== undefined ? title_line1 : loginPage.title_line1,
          title_line2: title_line2 !== undefined ? title_line2 : loginPage.title_line2,
          button_text: button_text !== undefined ? button_text : loginPage.button_text,
          button_link: button_link !== undefined ? button_link : loginPage.button_link,
          button_icon: button_icon !== undefined ? button_icon : loginPage.button_icon
        }
      });
    }

    res.json({ loginPage });
  } catch (error: any) {
    console.error('Erro ao atualizar LoginPage:', error);
    res.status(500).json({ error: 'Erro ao atualizar dados da página de login' });
  }
};

// POST /api/login-page/image - Upload de imagem de fundo
export const uploadLoginPageImage = async (req: AuthRequest, res: Response) => {
  try {
    const uploadSingle = upload.single('file');
    
    uploadSingle(req, res, async (err: any) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'Arquivo muito grande. Tamanho máximo: 5MB' });
        }
        return res.status(400).json({ error: err.message || 'Erro ao fazer upload da imagem' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
      }

      const fileUrl = `/uploads/${req.file.filename}`;

      let loginPage = await prisma.loginPage.findFirst();

      if (!loginPage) {
        loginPage = await prisma.loginPage.create({
          data: {
            background_image_url: fileUrl
          }
        });
      } else {
        // Remove imagem antiga se existir
        if (loginPage.background_image_url && loginPage.background_image_url.startsWith('/uploads/')) {
          const oldImagePath = path.join(__dirname, '../../public', loginPage.background_image_url);
          if (fs.existsSync(oldImagePath)) {
            try {
              fs.unlinkSync(oldImagePath);
            } catch (unlinkError) {
              console.error('Erro ao remover imagem antiga:', unlinkError);
            }
          }
        }

        loginPage = await prisma.loginPage.update({
          where: { id: loginPage.id },
          data: {
            background_image_url: fileUrl
          }
        });
      }

      res.json({
        success: true,
        data: { url: fileUrl },
        loginPage
      });
    });
  } catch (error: any) {
    console.error('Erro ao fazer upload da imagem:', error);
    res.status(500).json({ error: 'Erro ao fazer upload da imagem' });
  }
};

// DELETE /api/login-page/image/:type - Deletar imagem
export const deleteLoginPageImage = async (req: AuthRequest, res: Response) => {
  try {
    const { type } = req.params;

    let loginPage = await prisma.loginPage.findFirst();

    if (!loginPage) {
      return res.status(404).json({ error: 'Página de login não encontrada' });
    }

    if (type === 'background') {
      // Remove arquivo físico
      if (loginPage.background_image_url && loginPage.background_image_url.startsWith('/uploads/')) {
        const imagePath = path.join(__dirname, '../../public', loginPage.background_image_url);
        if (fs.existsSync(imagePath)) {
          try {
            fs.unlinkSync(imagePath);
          } catch (unlinkError) {
            console.error('Erro ao remover imagem:', unlinkError);
          }
        }
      }

      loginPage = await prisma.loginPage.update({
        where: { id: loginPage.id },
        data: {
          background_image_url: null
        }
      });
    } else {
      return res.status(400).json({ error: 'Tipo de imagem inválido' });
    }

    res.json({
      success: true,
      loginPage
    });
  } catch (error: any) {
    console.error('Erro ao deletar imagem:', error);
    res.status(500).json({ error: 'Erro ao deletar imagem' });
  }
};




