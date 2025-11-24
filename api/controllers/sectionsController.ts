import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { FileService } from '../services/fileService';

// ==================== FEATURES SECTION ====================

const featureSchema = z.object({
  icon: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  order: z.number().optional(),
  is_active: z.boolean().optional(),
});

export const getFeatures = async (req: Request, res: Response) => {
  try {
    const features = await prisma.sectionFeature.findMany({
      where: { is_active: true },
      orderBy: { order: 'asc' },
    });
    res.json({ success: true, features });
  } catch (error) {
    console.error('Erro ao buscar features:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar features' });
  }
};

export const getAllFeatures = async (req: AuthRequest, res: Response) => {
  try {
    const features = await prisma.sectionFeature.findMany({
      orderBy: { order: 'asc' },
    });
    res.json({ success: true, features });
  } catch (error) {
    console.error('Erro ao buscar features:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar features' });
  }
};

export const createFeature = async (req: AuthRequest, res: Response) => {
  try {
    const data = featureSchema.parse(req.body);
    const feature = await prisma.sectionFeature.create({ data });
    res.json({ success: true, feature });
  } catch (error: any) {
    console.error('Erro ao criar feature:', error);
    res.status(400).json({ success: false, error: error.message || 'Erro ao criar feature' });
  }
};

export const updateFeature = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = featureSchema.partial().parse(req.body);
    const feature = await prisma.sectionFeature.update({
      where: { id },
      data,
    });
    res.json({ success: true, feature });
  } catch (error: any) {
    console.error('Erro ao atualizar feature:', error);
    res.status(400).json({ success: false, error: error.message || 'Erro ao atualizar feature' });
  }
};

export const deleteFeature = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.sectionFeature.delete({ where: { id } });
    res.json({ success: true, message: 'Feature deletada com sucesso' });
  } catch (error: any) {
    console.error('Erro ao deletar feature:', error);
    res.status(400).json({ success: false, error: error.message || 'Erro ao deletar feature' });
  }
};

// ==================== ABOUT SECTION ====================

const aboutSchema = z.object({
  badge_text: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional().nullable(),
  description: z.string().optional(),
  background_image_url: z.string().nullable().optional(),
  stat_years: z.string().optional().nullable(),
  stat_clients: z.string().optional().nullable(),
  stat_network: z.string().optional().nullable(),
  indicator1_title: z.string().optional().nullable(),
  indicator1_value: z.string().optional().nullable(),
  indicator2_title: z.string().optional().nullable(),
  indicator2_value: z.string().optional().nullable(),
  indicator3_title: z.string().optional().nullable(),
  indicator3_value: z.string().optional().nullable(),
});

export const getAbout = async (req: Request, res: Response) => {
  try {
    let about = await prisma.sectionAbout.findFirst({
      include: { 
        images: { 
          where: { is_active: true },
          orderBy: { order: 'asc' } 
        } 
      }
    });
    if (!about) {
      about = await prisma.sectionAbout.create({
        data: {
          badge_text: 'Sobre Nós',
          title: 'Quem Somos',
          description: 'Com mais de 34 anos de atuação...',
        },
        include: { images: true }
      });
    }
    res.json({ success: true, about });
  } catch (error) {
    console.error('Erro ao buscar about:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar about' });
  }
};

export const updateAbout = async (req: AuthRequest, res: Response) => {
  try {
    const data = aboutSchema.parse(req.body);
    let about = await prisma.sectionAbout.findFirst();
    if (!about) {
      about = await prisma.sectionAbout.create({ data });
    } else {
      about = await prisma.sectionAbout.update({
        where: { id: about.id },
        data,
      });
    }
    res.json({ success: true, about });
  } catch (error: any) {
    console.error('Erro ao atualizar about:', error);
    res.status(400).json({ success: false, error: error.message || 'Erro ao atualizar about' });
  }
};

export const uploadAboutImage = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Nenhum arquivo enviado' });
    }
    FileService.validateImageFile(req.file);
    const uploadResult = await FileService.uploadFile(req.file);
    
    let about = await prisma.sectionAbout.findFirst();
    if (!about) {
      about = await prisma.sectionAbout.create({
        data: { badge_text: 'Sobre Nós', title: 'Quem Somos', description: '' },
      });
    }
    
    const oldImageUrl = about.background_image_url;
    if (oldImageUrl && oldImageUrl.startsWith('/uploads/')) {
      try {
        const oldFilename = oldImageUrl.split('/').pop();
        if (oldFilename) await FileService.deleteFile(oldFilename);
      } catch (e) {
        console.warn('Erro ao deletar imagem antiga:', e);
      }
    }
    
    about = await prisma.sectionAbout.update({
      where: { id: about.id },
      data: { background_image_url: uploadResult.url },
    });
    
    res.json({ success: true, about, data: { url: uploadResult.url } });
  } catch (error: any) {
    console.error('Erro ao fazer upload:', error);
    res.status(500).json({ success: false, error: error.message || 'Erro ao fazer upload' });
  }
};

// ==================== ABOUT IMAGES CAROUSEL ====================

export const getAboutImages = async (req: Request, res: Response) => {
  try {
    let about = await prisma.sectionAbout.findFirst({
      include: { images: { orderBy: { order: 'asc' } } }
    });
    
    if (!about) {
      about = await prisma.sectionAbout.create({
        data: { badge_text: 'Sobre Nós', title: 'Quem Somos', description: '' },
        include: { images: true }
      });
    }
    
    res.json({ success: true, images: about.images || [] });
  } catch (error: any) {
    console.error('Erro ao buscar imagens:', error);
    res.status(500).json({ success: false, error: error.message || 'Erro ao buscar imagens' });
  }
};

export const createAboutImage = async (req: AuthRequest, res: Response) => {
  try {
    console.log('📤 createAboutImage - Iniciando...');
    console.log('📋 req.body:', req.body);
    console.log('📋 req.body.description:', req.body.description);
    console.log('📋 req.body.order:', req.body.order);
    console.log('📋 req.file:', req.file ? { name: req.file.originalname, size: req.file.size, mimetype: req.file.mimetype } : 'null');
    
    if (!req.file) {
      console.error('❌ Nenhum arquivo recebido');
      return res.status(400).json({ success: false, error: 'Nenhum arquivo enviado' });
    }
    
    try {
      FileService.validateImageFile(req.file);
      console.log('✅ Arquivo validado');
    } catch (validationError: any) {
      console.error('❌ Erro na validação:', validationError.message);
      return res.status(400).json({ success: false, error: validationError.message || 'Arquivo inválido' });
    }
    
    let uploadResult;
    try {
      uploadResult = await FileService.uploadFile(req.file);
      console.log('✅ Upload concluído:', uploadResult.url);
    } catch (uploadError: any) {
      console.error('❌ Erro no upload:', uploadError.message);
      return res.status(500).json({ success: false, error: uploadError.message || 'Erro ao fazer upload do arquivo' });
    }
    
    let about;
    try {
      about = await prisma.sectionAbout.findFirst();
      if (!about) {
        about = await prisma.sectionAbout.create({
          data: { badge_text: 'Sobre Nós', title: 'Quem Somos', description: '' },
        });
        console.log('✅ Seção About criada:', about.id);
      } else {
        console.log('✅ Seção About encontrada:', about.id);
      }
    } catch (aboutError: any) {
      console.error('❌ Erro ao buscar/criar About:', aboutError.message);
      return res.status(500).json({ success: false, error: 'Erro ao buscar seção About' });
    }
    
    // Quando usando FormData, os campos vêm como strings
    const description = req.body.description || '';
    const order = req.body.order ? parseInt(String(req.body.order)) : 0;
    
    console.log('📝 Dados da imagem:', { description, order, section_about_id: about.id });
    
    let image;
    try {
      // Verificar se o modelo existe
      console.log('🔍 Verificando modelo sectionAboutImage...');
      const prismaKeys = Object.keys(prisma).filter(k => k.includes('section') || k.includes('Section'));
      console.log('🔍 Prisma client keys:', prismaKeys);
      console.log('🔍 sectionAboutImage exists?', 'sectionAboutImage' in prisma);
      
      if (!('sectionAboutImage' in prisma)) {
        throw new Error('Modelo sectionAboutImage não encontrado no Prisma Client. Execute: npx prisma generate');
      }
      
      image = await prisma.sectionAboutImage.create({
        data: {
          section_about_id: about.id,
          image_url: uploadResult.url,
          description: description || null,
          order: order || 0,
          is_active: true
        }
      });
      console.log('✅ Imagem criada com sucesso:', image.id);
    } catch (createError: any) {
      console.error('❌ Erro ao criar imagem no banco:', createError.message);
      console.error('❌ Stack:', createError.stack);
      console.error('❌ Erro completo:', JSON.stringify(createError, null, 2));
      return res.status(500).json({ success: false, error: createError.message || 'Erro ao criar imagem no banco de dados' });
    }
    
    res.json({ success: true, image });
  } catch (error: any) {
    console.error('❌ Erro geral ao criar imagem:', error);
    console.error('❌ Stack:', error.stack);
    res.status(500).json({ success: false, error: error.message || 'Erro ao criar imagem' });
  }
};

export const updateAboutImage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { description, order, is_active } = req.body;
    
    const image = await prisma.sectionAboutImage.findUnique({
      where: { id }
    });
    
    if (!image) {
      return res.status(404).json({ success: false, error: 'Imagem não encontrada' });
    }
    
    const updatedImage = await prisma.sectionAboutImage.update({
      where: { id },
      data: {
        description: description !== undefined ? description : image.description,
        order: order !== undefined ? parseInt(order) : image.order,
        is_active: is_active !== undefined ? is_active === 'true' || is_active === true : image.is_active
      }
    });
    
    res.json({ success: true, image: updatedImage });
  } catch (error: any) {
    console.error('Erro ao atualizar imagem:', error);
    res.status(500).json({ success: false, error: error.message || 'Erro ao atualizar imagem' });
  }
};

export const deleteAboutImage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const image = await prisma.sectionAboutImage.findUnique({
      where: { id }
    });
    
    if (!image) {
      return res.status(404).json({ success: false, error: 'Imagem não encontrada' });
    }
    
    // Deletar arquivo
    if (image.image_url && image.image_url.startsWith('/uploads/')) {
      try {
        const filename = image.image_url.split('/').pop();
        if (filename) await FileService.deleteFile(filename);
      } catch (e) {
        console.warn('Erro ao deletar arquivo:', e);
      }
    }
    
    await prisma.sectionAboutImage.delete({
      where: { id }
    });
    
    res.json({ success: true, message: 'Imagem removida com sucesso' });
  } catch (error: any) {
    console.error('Erro ao deletar imagem:', error);
    res.status(500).json({ success: false, error: error.message || 'Erro ao deletar imagem' });
  }
};

// ==================== SPECIALTIES SECTION ====================

const specialtySchema = z.object({
  icon: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  order: z.number().optional(),
  is_active: z.boolean().optional(),
});

export const getSpecialties = async (req: Request, res: Response) => {
  try {
    const specialties = await prisma.sectionSpecialty.findMany({
      where: { is_active: true },
      orderBy: { order: 'asc' },
    });
    res.json({ success: true, specialties });
  } catch (error) {
    console.error('Erro ao buscar specialties:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar specialties' });
  }
};

export const getAllSpecialties = async (req: AuthRequest, res: Response) => {
  try {
    const specialties = await prisma.sectionSpecialty.findMany({
      orderBy: { order: 'asc' },
    });
    res.json({ success: true, specialties });
  } catch (error) {
    console.error('Erro ao buscar specialties:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar specialties' });
  }
};

export const createSpecialty = async (req: AuthRequest, res: Response) => {
  try {
    const data = specialtySchema.parse(req.body);
    const specialty = await prisma.sectionSpecialty.create({ data });
    res.json({ success: true, specialty });
  } catch (error: any) {
    console.error('Erro ao criar specialty:', error);
    res.status(400).json({ success: false, error: error.message || 'Erro ao criar specialty' });
  }
};

export const updateSpecialty = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = specialtySchema.partial().parse(req.body);
    const specialty = await prisma.sectionSpecialty.update({
      where: { id },
      data,
    });
    res.json({ success: true, specialty });
  } catch (error: any) {
    console.error('Erro ao atualizar specialty:', error);
    res.status(400).json({ success: false, error: error.message || 'Erro ao atualizar specialty' });
  }
};

export const deleteSpecialty = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.sectionSpecialty.delete({ where: { id } });
    res.json({ success: true, message: 'Specialty deletada com sucesso' });
  } catch (error: any) {
    console.error('Erro ao deletar specialty:', error);
    res.status(400).json({ success: false, error: error.message || 'Erro ao deletar specialty' });
  }
};

// ==================== FISCAL BENEFITS SECTION ====================

const fiscalBenefitSchema = z.object({
  icon: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  slug: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  excerpt: z.string().optional().nullable(),
  featured_image_url: z.string().optional().nullable(),
  order: z.number().optional(),
  is_active: z.boolean().optional(),
});

export const getFiscalBenefits = async (req: Request, res: Response) => {
  try {
    const benefits = await prisma.sectionFiscalBenefit.findMany({
      where: { is_active: true },
      orderBy: { order: 'asc' },
    });
    res.json({ success: true, benefits });
  } catch (error) {
    console.error('Erro ao buscar fiscal benefits:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar fiscal benefits' });
  }
};

export const getAllFiscalBenefits = async (req: AuthRequest, res: Response) => {
  try {
    const benefits = await prisma.sectionFiscalBenefit.findMany({
      orderBy: { order: 'asc' },
    });
    res.json({ success: true, benefits });
  } catch (error) {
    console.error('Erro ao buscar fiscal benefits:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar fiscal benefits' });
  }
};

export const createFiscalBenefit = async (req: AuthRequest, res: Response) => {
  try {
    const data = fiscalBenefitSchema.parse(req.body);
    // Gerar slug se não fornecido
    if (!data.slug && data.name) {
      data.slug = data.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
    const benefit = await prisma.sectionFiscalBenefit.create({ data });
    res.json({ success: true, benefit });
  } catch (error: any) {
    console.error('Erro ao criar fiscal benefit:', error);
    res.status(400).json({ success: false, error: error.message || 'Erro ao criar fiscal benefit' });
  }
};

export const updateFiscalBenefit = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = fiscalBenefitSchema.partial().parse(req.body);
    // Gerar slug se nome foi atualizado e slug não foi fornecido
    if (data.name && !data.slug) {
      data.slug = data.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
    const benefit = await prisma.sectionFiscalBenefit.update({
      where: { id },
      data,
    });
    res.json({ success: true, benefit });
  } catch (error: any) {
    console.error('Erro ao atualizar fiscal benefit:', error);
    res.status(400).json({ success: false, error: error.message || 'Erro ao atualizar fiscal benefit' });
  }
};

export const deleteFiscalBenefit = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.sectionFiscalBenefit.delete({ where: { id } });
    res.json({ success: true, message: 'Fiscal benefit deletado com sucesso' });
  } catch (error: any) {
    console.error('Erro ao deletar fiscal benefit:', error);
    res.status(400).json({ success: false, error: error.message || 'Erro ao deletar fiscal benefit' });
  }
};

export const getFiscalBenefitBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const benefit = await prisma.sectionFiscalBenefit.findUnique({
      where: { slug },
    });
    if (!benefit) {
      return res.status(404).json({ success: false, error: 'Benefício não encontrado' });
    }
    res.json({ success: true, benefit });
  } catch (error: any) {
    console.error('Erro ao buscar fiscal benefit:', error);
    res.status(500).json({ success: false, error: error.message || 'Erro ao buscar benefício' });
  }
};

export const uploadFiscalBenefitImage = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Nenhum arquivo enviado' });
    }

    const { id } = req.params;

    // Valida o arquivo (apenas imagens)
    FileService.validateImageFile(req.file);

    // Faz upload do arquivo
    const uploadResult = await FileService.uploadFile(req.file);

    // Buscar benefício existente
    const existingBenefit = await prisma.sectionFiscalBenefit.findUnique({
      where: { id },
    });

    if (!existingBenefit) {
      // Deletar arquivo se benefício não existir
      const filename = uploadResult.url.split('/').pop();
      if (filename) {
        await FileService.deleteFile(filename);
      }
      return res.status(404).json({ success: false, error: 'Benefício não encontrado' });
    }

    // Deletar imagem antiga se existir
    if (existingBenefit.featured_image_url && existingBenefit.featured_image_url.startsWith('/uploads/')) {
      try {
        const oldFilename = existingBenefit.featured_image_url.split('/').pop();
        if (oldFilename) {
          await FileService.deleteFile(oldFilename);
        }
      } catch (error) {
        console.warn('Erro ao deletar imagem antiga:', error);
      }
    }

    // Atualizar benefício com nova imagem
    const benefit = await prisma.sectionFiscalBenefit.update({
      where: { id },
      data: {
        featured_image_url: uploadResult.url,
      },
    });

    res.json({
      success: true,
      message: 'Imagem enviada com sucesso',
      data: uploadResult,
      benefit,
    });
  } catch (error: any) {
    console.error('Erro ao fazer upload da imagem:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao fazer upload da imagem',
    });
  }
};

// ==================== FUN FACTS SECTION ====================

const funFactSchema = z.object({
  icon: z.string().min(1),
  label: z.string().min(1),
  value: z.string().min(1),
  suffix: z.string().optional().nullable(),
  order: z.number().optional(),
  is_active: z.boolean().optional(),
});

export const getFunFacts = async (req: Request, res: Response) => {
  try {
    const funFacts = await prisma.sectionFunFact.findMany({
      where: { is_active: true },
      orderBy: { order: 'asc' },
    });
    res.json({ success: true, funFacts });
  } catch (error) {
    console.error('Erro ao buscar fun facts:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar fun facts' });
  }
};

export const getAllFunFacts = async (req: AuthRequest, res: Response) => {
  try {
    const funFacts = await prisma.sectionFunFact.findMany({
      orderBy: { order: 'asc' },
    });
    res.json({ success: true, funFacts });
  } catch (error) {
    console.error('Erro ao buscar fun facts:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar fun facts' });
  }
};

export const createFunFact = async (req: AuthRequest, res: Response) => {
  try {
    const data = funFactSchema.parse(req.body);
    const funFact = await prisma.sectionFunFact.create({ data });
    res.json({ success: true, funFact });
  } catch (error: any) {
    console.error('Erro ao criar fun fact:', error);
    res.status(400).json({ success: false, error: error.message || 'Erro ao criar fun fact' });
  }
};

export const updateFunFact = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = funFactSchema.partial().parse(req.body);
    const funFact = await prisma.sectionFunFact.update({
      where: { id },
      data,
    });
    res.json({ success: true, funFact });
  } catch (error: any) {
    console.error('Erro ao atualizar fun fact:', error);
    res.status(400).json({ success: false, error: error.message || 'Erro ao atualizar fun fact' });
  }
};

export const deleteFunFact = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.sectionFunFact.delete({ where: { id } });
    res.json({ success: true, message: 'Fun fact deletado com sucesso' });
  } catch (error: any) {
    console.error('Erro ao deletar fun fact:', error);
    res.status(400).json({ success: false, error: error.message || 'Erro ao deletar fun fact' });
  }
};

// ==================== CERTIFICATIONS SECTION ====================

const certificationSchema = z.object({
  icon: z.string().min(1),
  name: z.string().min(1),
  acronym: z.string().optional().nullable(),
  description: z.string().min(1),
  order: z.number().optional(),
  is_active: z.boolean().optional(),
});

export const getCertifications = async (req: Request, res: Response) => {
  try {
    const certifications = await prisma.sectionCertification.findMany({
      where: { is_active: true },
      orderBy: { order: 'asc' },
    });
    res.json({ success: true, certifications });
  } catch (error) {
    console.error('Erro ao buscar certifications:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar certifications' });
  }
};

export const getAllCertifications = async (req: AuthRequest, res: Response) => {
  try {
    const certifications = await prisma.sectionCertification.findMany({
      orderBy: { order: 'asc' },
    });
    res.json({ success: true, certifications });
  } catch (error) {
    console.error('Erro ao buscar certifications:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar certifications' });
  }
};

export const createCertification = async (req: AuthRequest, res: Response) => {
  try {
    const data = certificationSchema.parse(req.body);
    const certification = await prisma.sectionCertification.create({ data });
    res.json({ success: true, certification });
  } catch (error: any) {
    console.error('Erro ao criar certification:', error);
    res.status(400).json({ success: false, error: error.message || 'Erro ao criar certification' });
  }
};

export const updateCertification = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = certificationSchema.partial().parse(req.body);
    const certification = await prisma.sectionCertification.update({
      where: { id },
      data,
    });
    res.json({ success: true, certification });
  } catch (error: any) {
    console.error('Erro ao atualizar certification:', error);
    res.status(400).json({ success: false, error: error.message || 'Erro ao atualizar certification' });
  }
};

export const deleteCertification = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.sectionCertification.delete({ where: { id } });
    res.json({ success: true, message: 'Certification deletada com sucesso' });
  } catch (error: any) {
    console.error('Erro ao deletar certification:', error);
    res.status(400).json({ success: false, error: error.message || 'Erro ao deletar certification' });
  }
};

// ==================== NEWSLETTER SECTION ====================

const newsletterSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  button_text: z.string().optional().nullable(),
  background_image_url: z.string().nullable().optional(),
});

export const getNewsletter = async (req: Request, res: Response) => {
  try {
    let newsletter = await prisma.sectionNewsletter.findFirst();
    if (!newsletter) {
      newsletter = await prisma.sectionNewsletter.create({
        data: {
          title: 'Fique por dentro das novidades',
          button_text: 'Inscrever-se',
        },
      });
    }
    res.json({ success: true, newsletter });
  } catch (error) {
    console.error('Erro ao buscar newsletter:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar newsletter' });
  }
};

export const updateNewsletter = async (req: AuthRequest, res: Response) => {
  try {
    const data = newsletterSchema.parse(req.body);
    let newsletter = await prisma.sectionNewsletter.findFirst();
    if (!newsletter) {
      newsletter = await prisma.sectionNewsletter.create({ data });
    } else {
      newsletter = await prisma.sectionNewsletter.update({
        where: { id: newsletter.id },
        data,
      });
    }
    res.json({ success: true, newsletter });
  } catch (error: any) {
    console.error('Erro ao atualizar newsletter:', error);
    res.status(400).json({ success: false, error: error.message || 'Erro ao atualizar newsletter' });
  }
};

export const uploadNewsletterImage = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Nenhum arquivo enviado' });
    }
    FileService.validateImageFile(req.file);
    const uploadResult = await FileService.uploadFile(req.file);
    
    let newsletter = await prisma.sectionNewsletter.findFirst();
    if (!newsletter) {
      newsletter = await prisma.sectionNewsletter.create({
        data: { title: 'Fique por dentro das novidades' },
      });
    }
    
    const oldImageUrl = newsletter.background_image_url;
    if (oldImageUrl && oldImageUrl.startsWith('/uploads/')) {
      try {
        const oldFilename = oldImageUrl.split('/').pop();
        if (oldFilename) await FileService.deleteFile(oldFilename);
      } catch (e) {
        console.warn('Erro ao deletar imagem antiga:', e);
      }
    }
    
    newsletter = await prisma.sectionNewsletter.update({
      where: { id: newsletter.id },
      data: { background_image_url: uploadResult.url },
    });
    
    res.json({ success: true, newsletter, data: { url: uploadResult.url } });
  } catch (error: any) {
    console.error('Erro ao fazer upload:', error);
    res.status(500).json({ success: false, error: error.message || 'Erro ao fazer upload' });
  }
};

// ==================== CLIENTS SECTION ====================

const clientsSchema = z.object({
  title: z.string().optional(),
  background_image_url: z.string().nullable().optional(),
});

export const getClients = async (req: Request, res: Response) => {
  try {
    let clients = await prisma.sectionClients.findFirst();
    if (!clients) {
      clients = await prisma.sectionClients.create({
        data: { title: 'Empresas que Confiam em Nosso Trabalho' },
      });
    }
    res.json({ success: true, clients });
  } catch (error) {
    console.error('Erro ao buscar clients:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar clients' });
  }
};

export const updateClients = async (req: AuthRequest, res: Response) => {
  try {
    const data = clientsSchema.parse(req.body);
    let clients = await prisma.sectionClients.findFirst();
    if (!clients) {
      clients = await prisma.sectionClients.create({ data });
    } else {
      clients = await prisma.sectionClients.update({
        where: { id: clients.id },
        data,
      });
    }
    res.json({ success: true, clients });
  } catch (error: any) {
    console.error('Erro ao atualizar clients:', error);
    res.status(400).json({ success: false, error: error.message || 'Erro ao atualizar clients' });
  }
};

export const uploadClientsImage = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Nenhum arquivo enviado' });
    }
    FileService.validateImageFile(req.file);
    const uploadResult = await FileService.uploadFile(req.file);
    
    let clients = await prisma.sectionClients.findFirst();
    if (!clients) {
      clients = await prisma.sectionClients.create({
        data: { title: 'Empresas que Confiam em Nosso Trabalho' },
      });
    }
    
    const oldImageUrl = clients.background_image_url;
    if (oldImageUrl && oldImageUrl.startsWith('/uploads/')) {
      try {
        const oldFilename = oldImageUrl.split('/').pop();
        if (oldFilename) await FileService.deleteFile(oldFilename);
      } catch (e) {
        console.warn('Erro ao deletar imagem antiga:', e);
      }
    }
    
    clients = await prisma.sectionClients.update({
      where: { id: clients.id },
      data: { background_image_url: uploadResult.url },
    });
    
    res.json({ success: true, clients, data: { url: uploadResult.url } });
  } catch (error: any) {
    console.error('Erro ao fazer upload:', error);
    res.status(500).json({ success: false, error: error.message || 'Erro ao fazer upload' });
  }
};



