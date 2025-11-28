import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { AuthRequest } from '../middleware/auth.js';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração de upload de imagem (semelhante à LoginPage)
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
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `careers-page-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
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
  },
});

export const getCareersPage = async (req: Request, res: Response) => {
  try {
    let careersPage = await prisma.careersPage.findFirst();

    if (!careersPage) {
      careersPage = await prisma.careersPage.create({
        data: {},
      });
    }

    res.json({ careersPage });
  } catch (error) {
    console.error('Erro ao buscar CareersPage:', error);
    res.status(500).json({ error: 'Erro ao buscar dados da página Trabalhe Conosco' });
  }
};

export const updateCareersPage = async (req: AuthRequest, res: Response) => {
  try {
    const {
      background_image_url,
      hero_title,
      hero_subtitle,
      culture_title,
      culture_text,
      vacancies_title,
      vacancies_text,
      benefits_title,
      benefits_text,
      profile_title,
      profile_text,
    } = req.body;

    let careersPage = await prisma.careersPage.findFirst();

    if (!careersPage) {
      careersPage = await prisma.careersPage.create({
        data: {
          background_image_url: background_image_url || null,
          hero_title: hero_title || null,
          hero_subtitle: hero_subtitle || null,
          culture_title: culture_title || null,
          culture_text: culture_text || null,
          vacancies_title: vacancies_title || null,
          vacancies_text: vacancies_text || null,
          benefits_title: benefits_title || null,
          benefits_text: benefits_text || null,
          profile_title: profile_title || null,
          profile_text: profile_text || null,
        },
      });
    } else {
      careersPage = await prisma.careersPage.update({
        where: { id: careersPage.id },
        data: {
          background_image_url:
            background_image_url !== undefined ? background_image_url : careersPage.background_image_url,
          hero_title: hero_title !== undefined ? hero_title : careersPage.hero_title,
          hero_subtitle: hero_subtitle !== undefined ? hero_subtitle : careersPage.hero_subtitle,
          culture_title: culture_title !== undefined ? culture_title : careersPage.culture_title,
          culture_text: culture_text !== undefined ? culture_text : careersPage.culture_text,
          vacancies_title: vacancies_title !== undefined ? vacancies_title : careersPage.vacancies_title,
          vacancies_text: vacancies_text !== undefined ? vacancies_text : careersPage.vacancies_text,
          benefits_title: benefits_title !== undefined ? benefits_title : careersPage.benefits_title,
          benefits_text: benefits_text !== undefined ? benefits_text : careersPage.benefits_text,
          profile_title: profile_title !== undefined ? profile_title : careersPage.profile_title,
          profile_text: profile_text !== undefined ? profile_text : careersPage.profile_text,
        },
      });
    }

    res.json({ careersPage });
  } catch (error) {
    console.error('Erro ao atualizar CareersPage:', error);
    res.status(500).json({ error: 'Erro ao atualizar dados da página Trabalhe Conosco' });
  }
};

export const uploadCareersPageImage = async (req: AuthRequest, res: Response) => {
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

      let careersPage = await prisma.careersPage.findFirst();

      if (!careersPage) {
        careersPage = await prisma.careersPage.create({
          data: {
            background_image_url: fileUrl,
          },
        });
      } else {
        if (
          careersPage.background_image_url &&
          careersPage.background_image_url.startsWith('/uploads/')
        ) {
          const oldImagePath = path.join(__dirname, '../../public', careersPage.background_image_url);
          if (fs.existsSync(oldImagePath)) {
            try {
              fs.unlinkSync(oldImagePath);
            } catch (unlinkError) {
              console.error('Erro ao remover imagem antiga:', unlinkError);
            }
          }
        }

        careersPage = await prisma.careersPage.update({
          where: { id: careersPage.id },
          data: {
            background_image_url: fileUrl,
          },
        });
      }

      res.json({
        success: true,
        data: { url: fileUrl },
        careersPage,
      });
    });
  } catch (error) {
    console.error('Erro ao fazer upload da imagem da CareersPage:', error);
    res.status(500).json({ error: 'Erro ao fazer upload da imagem' });
  }
};

export const deleteCareersPageImage = async (req: AuthRequest, res: Response) => {
  try {
    let careersPage = await prisma.careersPage.findFirst();

    if (!careersPage) {
      return res.status(404).json({ error: 'Página Trabalhe Conosco não encontrada' });
    }

    if (
      careersPage.background_image_url &&
      careersPage.background_image_url.startsWith('/uploads/')
    ) {
      const imagePath = path.join(__dirname, '../../public', careersPage.background_image_url);
      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
        } catch (unlinkError) {
          console.error('Erro ao remover imagem:', unlinkError);
        }
      }
    }

    careersPage = await prisma.careersPage.update({
      where: { id: careersPage.id },
      data: {
        background_image_url: null,
      },
    });

    res.json({
      success: true,
      careersPage,
    });
  } catch (error) {
    console.error('Erro ao deletar imagem da CareersPage:', error);
    res.status(500).json({ error: 'Erro ao deletar imagem' });
  }
};




