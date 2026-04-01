import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { FileService } from '../services/fileService.js';
import { emailService } from '../services/emailService.js';
import { ConfigurationService } from '../services/configurationService.js';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

const landingPageSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  slug: z.string().optional(),
  description: z.string().optional(),
  hero_title: z.string().optional(),
  hero_subtitle: z.string().optional(),
  hero_image_url: z.string().optional(),
  hero_background_color: z.string().optional(),
  content: z.string().optional(),
  featured_image_url: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  meta_keywords: z.string().optional(),
  is_active: z.boolean().optional(),
  is_published: z.boolean().optional(),
});

const formFieldSchema = z.object({
  landing_page_id: z.string().uuid(),
  field_type: z.enum(['text', 'email', 'tel', 'textarea', 'select', 'checkbox', 'radio', 'number', 'date', 'file']),
  field_name: z.string().min(1, 'Nome do campo é obrigatório'),
  field_label: z.string().min(1, 'Label do campo é obrigatório'),
  placeholder: z.string().optional(),
  help_text: z.string().optional(),
  is_required: z.boolean().optional(),
  validation_rules: z.string().optional(),
  options: z.string().optional(),
  order: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
});

// Landing Pages CRUD
export const getLandingPages = async (req: Request, res: Response) => {
  try {
    const { published_only } = req.query;
    
    const where: any = {};
    if (published_only === 'true') {
      where.is_published = true;
      where.is_active = true;
    }

    const landingPages = await prisma.landingPage.findMany({
      where,
      include: {
        form_fields: {
          where: { is_active: true },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            form_submissions: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    res.json({ landingPages });
  } catch (error: any) {
    console.error('❌ Get landing pages error:', error);
    console.error('❌ Error details:', error?.message, error?.stack);
    res.status(500).json({ error: error?.message || 'Erro ao buscar landing pages' });
  }
};

export const getLandingPageBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const landingPage = await prisma.landingPage.findUnique({
      where: { slug },
      include: {
        form_fields: {
          where: { is_active: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!landingPage) {
      return res.status(404).json({ error: 'Landing page não encontrada' });
    }

    if (!landingPage.is_published || !landingPage.is_active) {
      return res.status(404).json({ error: 'Landing page não encontrada' });
    }

    res.json({ landingPage });
  } catch (error) {
    console.error('Error fetching landing page:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getLandingPageById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const landingPage = await prisma.landingPage.findUnique({
      where: { id },
      include: {
        form_fields: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            form_submissions: true,
          },
        },
      },
    });

    if (!landingPage) {
      return res.status(404).json({ error: 'Landing page não encontrada' });
    }

    res.json({ landingPage });
  } catch (error) {
    console.error('Error fetching landing page:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createLandingPage = async (req: Request, res: Response) => {
  try {
    const data = landingPageSchema.parse(req.body);
    
    let slug = data.slug || slugify(data.title);
    
    // Ensure unique slug
    const existingPage = await prisma.landingPage.findUnique({
      where: { slug }
    });

    if (existingPage) {
      slug = `${slug}-${Date.now()}`;
    }

    const landingPage = await prisma.landingPage.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        hero_title: data.hero_title,
        hero_subtitle: data.hero_subtitle,
        hero_image_url: data.hero_image_url,
        hero_background_color: data.hero_background_color,
        content: data.content,
        featured_image_url: data.featured_image_url,
        meta_title: data.meta_title,
        meta_description: data.meta_description,
        meta_keywords: data.meta_keywords,
        is_active: data.is_active ?? true,
        is_published: data.is_published ?? false,
        published_at: data.is_published ? new Date() : null,
      },
      include: {
        form_fields: true,
      },
    });

    res.status(201).json({ landingPage });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Error creating landing page:', error);
    res.status(500).json({ error: 'Erro ao criar landing page' });
  }
};

export const updateLandingPage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = landingPageSchema.partial().parse(req.body);

    // Check if slug is being updated and ensure uniqueness
    if (data.slug) {
      const existingPage = await prisma.landingPage.findFirst({
        where: {
          slug: data.slug,
          id: { not: id },
        },
      });

      if (existingPage) {
        return res.status(400).json({ error: 'Slug já está em uso' });
      }
    }

    const updateData: any = { ...data };
    
    // If is_published is being set to true, set published_at
    if (data.is_published === true) {
      const currentPage = await prisma.landingPage.findUnique({ where: { id } });
      if (currentPage && !currentPage.published_at) {
        updateData.published_at = new Date();
      }
    }

    const landingPage = await prisma.landingPage.update({
      where: { id },
      data: updateData,
      include: {
        form_fields: {
          orderBy: { order: 'asc' },
        },
      },
    });

    res.json({ landingPage });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Error updating landing page:', error);
    console.error('Error details:', error?.message, error?.stack);
    res.status(500).json({ error: error?.message || 'Erro ao atualizar landing page' });
  }
};

export const deleteLandingPage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.landingPage.delete({
      where: { id },
    });

    res.json({ message: 'Landing page deletada com sucesso' });
  } catch (error) {
    console.error('Error deleting landing page:', error);
    res.status(500).json({ error: 'Erro ao deletar landing page' });
  }
};

export const uploadLandingPageImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    // Validar o arquivo
    FileService.validateImageFile(req.file);

    // Fazer upload
    const uploadResult = await FileService.uploadFile(req.file);

    res.json({ url: uploadResult.url });
  } catch (error: any) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: error?.message || 'Erro ao fazer upload da imagem' });
  }
};

// Form Fields CRUD
export const createFormField = async (req: Request, res: Response) => {
  try {
    const data = formFieldSchema.parse(req.body);

    const formField = await prisma.formField.create({
      data: {
        landing_page_id: data.landing_page_id,
        field_type: data.field_type,
        field_name: data.field_name,
        field_label: data.field_label,
        placeholder: data.placeholder,
        help_text: data.help_text,
        is_required: data.is_required ?? false,
        validation_rules: data.validation_rules,
        options: data.options,
        order: data.order ?? 0,
        is_active: data.is_active ?? true,
      },
    });

    res.status(201).json({ formField });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Error creating form field:', error);
    res.status(500).json({ error: 'Erro ao criar campo do formulário' });
  }
};

export const updateFormField = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = formFieldSchema.omit({ landing_page_id: true }).partial().parse(req.body);

    const formField = await prisma.formField.update({
      where: { id },
      data,
    });

    res.json({ formField });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Error updating form field:', error);
    res.status(500).json({ error: 'Erro ao atualizar campo do formulário' });
  }
};

export const deleteFormField = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.formField.delete({
      where: { id },
    });

    res.json({ message: 'Campo deletado com sucesso' });
  } catch (error) {
    console.error('Error deleting form field:', error);
    res.status(500).json({ error: 'Erro ao deletar campo' });
  }
};

export const reorderFormFields = async (req: Request, res: Response) => {
  try {
    const { fieldIds } = req.body; // Array de IDs na nova ordem

    if (!Array.isArray(fieldIds)) {
      return res.status(400).json({ error: 'fieldIds deve ser um array' });
    }

    const updates = fieldIds.map((fieldId: string, index: number) =>
      prisma.formField.update({
        where: { id: fieldId },
        data: { order: index },
      })
    );

    await Promise.all(updates);

    res.json({ message: 'Ordem atualizada com sucesso' });
  } catch (error) {
    console.error('Error reordering form fields:', error);
    res.status(500).json({ error: 'Erro ao reordenar campos' });
  }
};

// Form Submissions
export const getFormSubmissions = async (req: Request, res: Response) => {
  try {
    const { landing_page_id } = req.query;

    const where: any = {};
    if (landing_page_id) {
      where.landing_page_id = landing_page_id as string;
    }

    const submissions = await prisma.formSubmission.findMany({
      where,
      include: {
        landing_page: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    res.json({ submissions });
  } catch (error) {
    console.error('Error fetching form submissions:', error);
    res.status(500).json({ error: 'Erro ao buscar submissões' });
  }
};

export const getFormSubmissionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const submission = await prisma.formSubmission.findUnique({
      where: { id },
      include: {
        landing_page: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submissão não encontrada' });
    }

    res.json({ submission });
  } catch (error) {
    console.error('Error fetching form submission:', error);
    res.status(500).json({ error: 'Erro ao buscar submissão' });
  }
};

export const submitForm = async (req: Request, res: Response) => {
  try {
    const { landing_page_id, form_data, captchaToken, honeypot } = req.body;

    if (!landing_page_id || !form_data) {
      return res.status(400).json({ error: 'landing_page_id e form_data são obrigatórios' });
    }

    // Validação honeypot - se preenchido, é um bot
    if (honeypot && honeypot.trim() !== '') {
      console.log('Bot detectado via honeypot na landing page');
      return res.status(400).json({ error: 'Requisição inválida' });
    }

    // Verify landing page exists and is published
    const landingPage = await prisma.landingPage.findUnique({
      where: { id: landing_page_id },
      include: {
        form_fields: {
          where: { is_active: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!landingPage) {
      return res.status(404).json({ error: 'Landing page não encontrada' });
    }

    if (!landingPage.is_published || !landingPage.is_active) {
      return res.status(404).json({ error: 'Landing page não está publicada' });
    }

    // Validate form data against form fields
    const errors: string[] = [];
    for (const field of landingPage.form_fields) {
      if (field.is_required && !form_data[field.field_name]) {
        errors.push(`${field.field_label} é obrigatório`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Dados inválidos', errors });
    }

    // Validar hCaptcha (desabilitado em desenvolvimento)
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (!isDevelopment) {
      if (!captchaToken) {
        return res.status(400).json({ 
          error: 'Por favor, confirme que você não é um robô' 
        });
      }

      // Verificar hCaptcha apenas em produção
      const hcaptchaSecretKey = process.env.HCAPTCHA_SECRET_KEY;
      if (!hcaptchaSecretKey) {
        console.warn('HCAPTCHA_SECRET_KEY não configurada');
        return res.status(500).json({ 
          error: 'Configuração de segurança incompleta. Entre em contato com o suporte.' 
        });
      }

      const verifyUrl = 'https://hcaptcha.com/siteverify';
      
      try {
        const captchaFormData = new URLSearchParams();
        captchaFormData.append('secret', hcaptchaSecretKey);
        captchaFormData.append('response', captchaToken);

        const hcaptchaResponse = await fetch(verifyUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: captchaFormData.toString(),
        });
        const hcaptchaData = await hcaptchaResponse.json();
        
        if (!hcaptchaData.success) {
          console.error('hCaptcha validation failed:', hcaptchaData);
          return res.status(400).json({ 
            error: 'Falha na verificação de segurança. Por favor, tente novamente.' 
          });
        }
      } catch (captchaError) {
        console.error('Erro ao validar hCaptcha:', captchaError);
        return res.status(500).json({ 
          error: 'Erro ao validar verificação de segurança. Tente novamente.' 
        });
      }
    } else {
      // Em desenvolvimento, apenas logar
      console.log('Modo desenvolvimento: Validação hCaptcha bypassada');
    }

    // Get client info
    const ip_address = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const user_agent = req.headers['user-agent'];
    const referrer = req.headers['referer'];

    const submission = await prisma.formSubmission.create({
      data: {
        landing_page_id,
        form_data: JSON.stringify(form_data),
        ip_address: Array.isArray(ip_address) ? ip_address[0] : ip_address,
        user_agent: user_agent || null,
        referrer: referrer || null,
      },
    });

    // Enviar email de notificação
    try {
      const config = await ConfigurationService.getConfiguration();
      const recipientEmail = config.contact_email || config.email || process.env.SMTP_USER || '';
      
      if (recipientEmail) {
        const emailSent = await emailService.sendLandingPageNotification(recipientEmail, {
          landingPageTitle: landingPage.title,
          landingPageSlug: landingPage.slug,
          formData: form_data,
          formFields: landingPage.form_fields,
        });

        if (emailSent) {
          console.log('✅ Email de notificação de landing page enviado para:', recipientEmail);
        } else {
          console.warn('⚠️ Falha ao enviar email de notificação, mas submissão foi salva');
        }
      } else {
        console.warn('⚠️ Nenhum email destinatário configurado para notificações de landing page');
      }
    } catch (emailError) {
      console.error('❌ Erro ao enviar email de notificação de landing page:', emailError);
      // Não falha a requisição se o email falhar, pois a submissão já foi salva
    }

    res.status(201).json({ 
      message: 'Formulário enviado com sucesso',
      submission: {
        id: submission.id,
        created_at: submission.created_at,
      },
    });
  } catch (error) {
    console.error('Error submitting form:', error);
    res.status(500).json({ error: 'Erro ao enviar formulário' });
  }
};

export const markSubmissionAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { is_read } = req.body;

    const submission = await prisma.formSubmission.update({
      where: { id },
      data: { is_read: is_read ?? true },
    });

    res.json({ submission });
  } catch (error) {
    console.error('Error updating submission:', error);
    res.status(500).json({ error: 'Erro ao atualizar submissão' });
  }
};

export const deleteFormSubmission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.formSubmission.delete({
      where: { id },
    });

    res.json({ message: 'Submissão deletada com sucesso' });
  } catch (error) {
    console.error('Error deleting submission:', error);
    res.status(500).json({ error: 'Erro ao deletar submissão' });
  }
};

