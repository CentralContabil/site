import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { FileService } from '../services/fileService';

// Esquema de validação
const updateHeroSchema = z.object({
  badge_text: z.string().min(1, 'Texto do badge é obrigatório').optional(),
  title_line1: z.string().min(1, 'Primeira linha do título é obrigatória').optional(),
  title_line2: z.string().min(1, 'Segunda linha do título é obrigatória').optional(),
  description: z.string().min(1, 'Descrição é obrigatória').optional(),
  background_image_url: z.string().nullable().optional(),
  hero_image_url: z.string().nullable().optional(),
  button1_text: z.string().optional().nullable(),
  button1_link: z.string().optional().nullable(),
  button2_text: z.string().optional().nullable(),
  button2_link: z.string().optional().nullable(),
  stat_years: z.string().optional().nullable(), // Mantido para compatibilidade
  stat_clients: z.string().optional().nullable(), // Mantido para compatibilidade
  stat_network: z.string().optional().nullable(), // Mantido para compatibilidade
  indicator1_title: z.string().optional().nullable(),
  indicator1_value: z.string().optional().nullable(),
  indicator2_title: z.string().optional().nullable(),
  indicator2_value: z.string().optional().nullable(),
  indicator3_title: z.string().optional().nullable(),
  indicator3_value: z.string().optional().nullable(),
});

/**
 * Obtém os dados do Hero (público)
 */
export const getHero = async (req: Request, res: Response) => {
  try {
    let hero = await prisma.hero.findFirst();

    // Se não existir, criar um registro padrão
    if (!hero) {
      hero = await prisma.hero.create({
        data: {
          badge_text: 'Contabilidade Consultiva',
          title_line1: 'Soluções que Vão',
          title_line2: 'Além da Contabilidade',
          description: 'Com mais de 34 anos de atuação, oferecemos consultoria contábil estratégica para impulsionar o crescimento do seu negócio com segurança e inovação.',
          button1_text: 'Agende uma Consultoria',
          button1_link: '#contato',
          button2_text: 'Conheça Nossos Serviços',
          button2_link: '#servicos',
          stat_years: '34+',
          stat_clients: '500+',
          stat_network: 'RNC',
          indicator1_title: 'Anos',
          indicator1_value: '36+',
          indicator2_title: 'Clientes',
          indicator2_value: '500+',
          indicator3_title: 'Associado',
          indicator3_value: 'RNC',
        },
      });
    }

    res.json({
      success: true,
      hero: {
        id: hero.id,
        badgeText: hero.badge_text,
        titleLine1: hero.title_line1,
        titleLine2: hero.title_line2,
        description: hero.description,
        backgroundImageUrl: hero.background_image_url,
        heroImageUrl: hero.hero_image_url,
        button1Text: hero.button1_text,
        button1Link: hero.button1_link,
        button2Text: hero.button2_text,
        button2Link: hero.button2_link,
        statYears: hero.stat_years,
        statClients: hero.stat_clients,
        statNetwork: hero.stat_network,
        indicator1Title: hero.indicator1_title,
        indicator1Value: hero.indicator1_value,
        indicator2Title: hero.indicator2_title,
        indicator2Value: hero.indicator2_value,
        indicator3Title: hero.indicator3_title,
        indicator3Value: hero.indicator3_value,
        updatedAt: hero.updated_at,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar Hero:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar dados do Hero',
    });
  }
};

/**
 * Atualiza os dados do Hero (admin)
 */
export const updateHero = async (req: AuthRequest, res: Response) => {
  try {
    const validation = updateHeroSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.errors[0].message,
      });
    }

    const data = validation.data;

    // Converter camelCase para snake_case
    const updateData: any = {};
    if (data.badge_text !== undefined) updateData.badge_text = data.badge_text;
    if (data.title_line1 !== undefined) updateData.title_line1 = data.title_line1;
    if (data.title_line2 !== undefined) updateData.title_line2 = data.title_line2;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.background_image_url !== undefined) updateData.background_image_url = data.background_image_url;
    if (data.hero_image_url !== undefined) updateData.hero_image_url = data.hero_image_url;
    if (data.button1_text !== undefined) updateData.button1_text = data.button1_text;
    if (data.button1_link !== undefined) updateData.button1_link = data.button1_link;
    if (data.button2_text !== undefined) updateData.button2_text = data.button2_text;
    if (data.button2_link !== undefined) updateData.button2_link = data.button2_link;
    if (data.stat_years !== undefined) updateData.stat_years = data.stat_years;
    if (data.stat_clients !== undefined) updateData.stat_clients = data.stat_clients;
    if (data.stat_network !== undefined) updateData.stat_network = data.stat_network;
    if (data.indicator1_title !== undefined) updateData.indicator1_title = data.indicator1_title;
    if (data.indicator1_value !== undefined) updateData.indicator1_value = data.indicator1_value;
    if (data.indicator2_title !== undefined) updateData.indicator2_title = data.indicator2_title;
    if (data.indicator2_value !== undefined) updateData.indicator2_value = data.indicator2_value;
    if (data.indicator3_title !== undefined) updateData.indicator3_title = data.indicator3_title;
    if (data.indicator3_value !== undefined) updateData.indicator3_value = data.indicator3_value;

    // Buscar ou criar o registro
    let hero = await prisma.hero.findFirst();

    if (!hero) {
      hero = await prisma.hero.create({
        data: {
          badge_text: updateData.badge_text || 'Contabilidade Consultiva',
          title_line1: updateData.title_line1 || 'Soluções que Vão',
          title_line2: updateData.title_line2 || 'Além da Contabilidade',
          description: updateData.description || 'Com mais de 34 anos de atuação...',
          background_image_url: updateData.background_image_url || null,
          hero_image_url: updateData.hero_image_url || null,
          button1_text: updateData.button1_text || null,
          button1_link: updateData.button1_link || null,
          button2_text: updateData.button2_text || null,
          button2_link: updateData.button2_link || null,
          stat_years: updateData.stat_years || null,
          stat_clients: updateData.stat_clients || null,
          stat_network: updateData.stat_network || null,
          indicator1_title: updateData.indicator1_title || 'Anos',
          indicator1_value: updateData.indicator1_value || '36+',
          indicator2_title: updateData.indicator2_title || 'Clientes',
          indicator2_value: updateData.indicator2_value || '500+',
          indicator3_title: updateData.indicator3_title || 'Associado',
          indicator3_value: updateData.indicator3_value || 'RNC',
        },
      });
    } else {
      hero = await prisma.hero.update({
        where: { id: hero.id },
        data: updateData,
      });
    }

    res.json({
      success: true,
      hero: {
        id: hero.id,
        badgeText: hero.badge_text,
        titleLine1: hero.title_line1,
        titleLine2: hero.title_line2,
        description: hero.description,
        backgroundImageUrl: hero.background_image_url,
        heroImageUrl: hero.hero_image_url,
        button1Text: hero.button1_text,
        button1Link: hero.button1_link,
        button2Text: hero.button2_text,
        button2Link: hero.button2_link,
        statYears: hero.stat_years,
        statClients: hero.stat_clients,
        statNetwork: hero.stat_network,
        indicator1Title: hero.indicator1_title,
        indicator1Value: hero.indicator1_value,
        indicator2Title: hero.indicator2_title,
        indicator2Value: hero.indicator2_value,
        indicator3Title: hero.indicator3_title,
        indicator3Value: hero.indicator3_value,
        updatedAt: hero.updated_at,
      },
    });
  } catch (error) {
    console.error('Erro ao atualizar Hero:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar dados do Hero',
    });
  }
};

/**
 * Faz upload de imagem do Hero (admin)
 */
export const uploadHeroImage = async (req: AuthRequest, res: Response) => {
  try {
    console.log('📤 uploadHeroImage iniciado');
    
    if (!req.file) {
      console.log('❌ Nenhum arquivo recebido');
      return res.status(400).json({
        success: false,
        error: 'Nenhum arquivo enviado',
      });
    }

    const { type = 'background' } = req.body;
    console.log('📋 Tipo de imagem:', type);
    
    if (!['background', 'hero'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Tipo de imagem inválido. Use "background" ou "hero"',
      });
    }

    // Valida o arquivo
    try {
      FileService.validateImageFile(req.file);
      console.log('✅ Arquivo validado com sucesso');
    } catch (validationError: any) {
      console.error('❌ Erro na validação do arquivo:', validationError);
      return res.status(400).json({
        success: false,
        error: validationError.message || 'Arquivo inválido',
      });
    }
    
    // Faz upload do arquivo
    console.log('📤 Fazendo upload do arquivo...');
    const uploadResult = await FileService.uploadFile(req.file);
    console.log('✅ Upload concluído:', uploadResult.url);
    
    // Busca ou cria o Hero
    let hero = await prisma.hero.findFirst();
    
    if (!hero) {
      hero = await prisma.hero.create({
        data: {
          badge_text: 'Contabilidade Consultiva',
          title_line1: 'Soluções que Vão',
          title_line2: 'Além da Contabilidade',
          description: 'Com mais de 34 anos de atuação...',
        },
      });
    }

    // Deleta imagem antiga se existir (não bloqueia o upload se falhar)
    const fieldName = type === 'background' ? 'background_image_url' : 'hero_image_url';
    const oldImageUrl = hero[fieldName as keyof typeof hero] as string | null;
    
    if (oldImageUrl && oldImageUrl.trim() !== '') {
      try {
        // Extrair apenas o nome do arquivo da URL
        const urlParts = oldImageUrl.split('/');
        const oldFilename = urlParts[urlParts.length - 1];
        
        // Só tenta deletar se for um arquivo local (começa com /uploads/)
        if (oldImageUrl.startsWith('/uploads/') && oldFilename) {
          console.log('🗑️ Tentando deletar imagem antiga:', oldFilename);
          await FileService.deleteFile(oldFilename);
          console.log('✅ Imagem antiga deletada com sucesso');
        } else {
          console.log('ℹ️ Imagem antiga é uma URL externa, não será deletada:', oldImageUrl);
        }
      } catch (error) {
        // Não interrompe o upload se a deleção falhar
        console.warn('⚠️ Erro ao deletar imagem antiga (continuando com upload):', error);
      }
    }

    // Atualiza Hero com nova imagem
    hero = await prisma.hero.update({
      where: { id: hero.id },
      data: {
        [fieldName]: uploadResult.url,
      },
    });

    console.log('✅ Hero atualizado com sucesso');
    
    res.json({
      success: true,
      message: 'Imagem enviada com sucesso',
      data: {
        url: uploadResult.url,
        type,
      },
      hero: {
        id: hero.id,
        badgeText: hero.badge_text,
        titleLine1: hero.title_line1,
        titleLine2: hero.title_line2,
        description: hero.description,
        backgroundImageUrl: hero.background_image_url,
        heroImageUrl: hero.hero_image_url,
        button1Text: hero.button1_text,
        button1Link: hero.button1_link,
        button2Text: hero.button2_text,
        button2Link: hero.button2_link,
        statYears: hero.stat_years,
        statClients: hero.stat_clients,
        statNetwork: hero.stat_network,
        updatedAt: hero.updated_at,
      },
    });
  } catch (error: any) {
    console.error('❌ Erro ao fazer upload da imagem do Hero:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Erro ao fazer upload da imagem',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
};

/**
 * Deleta imagem do Hero (admin)
 */
export const deleteHeroImage = async (req: AuthRequest, res: Response) => {
  try {
    const { type } = req.params;
    
    if (!['background', 'hero'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Tipo de imagem inválido. Use "background" ou "hero"',
      });
    }

    let hero = await prisma.hero.findFirst();
    
    if (!hero) {
      return res.status(404).json({
        success: false,
        error: 'Hero não encontrado',
      });
    }

    const fieldName = type === 'background' ? 'background_image_url' : 'hero_image_url';
    const imageUrl = hero[fieldName as keyof typeof hero] as string;
    
    if (imageUrl) {
      const filename = imageUrl.split('/').pop();
      if (filename) {
        await FileService.deleteFile(filename);
      }
    }

    // Atualiza Hero removendo a URL da imagem
    hero = await prisma.hero.update({
      where: { id: hero.id },
      data: {
        [fieldName]: null,
      },
    });

    res.json({
      success: true,
      message: 'Imagem removida com sucesso',
      hero: {
        id: hero.id,
        badgeText: hero.badge_text,
        titleLine1: hero.title_line1,
        titleLine2: hero.title_line2,
        description: hero.description,
        backgroundImageUrl: hero.background_image_url,
        heroImageUrl: hero.hero_image_url,
        button1Text: hero.button1_text,
        button1Link: hero.button1_link,
        button2Text: hero.button2_text,
        button2Link: hero.button2_link,
        statYears: hero.stat_years,
        statClients: hero.stat_clients,
        statNetwork: hero.stat_network,
        updatedAt: hero.updated_at,
      },
    });
  } catch (error: any) {
    console.error('Erro ao deletar imagem do Hero:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao deletar imagem',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
};

