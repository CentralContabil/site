import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

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

const formSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  slug: z.string().optional(),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
});

const formFieldSchema = z.object({
  form_id: z.string().uuid().optional(),
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

// Listar todos os formulários
export const getForms = async (req: Request, res: Response) => {
  try {
    const { active_only } = req.query;
    
    const where: any = {};
    if (active_only === 'true') {
      where.is_active = true;
    }

    const forms = await prisma.form.findMany({
      where,
      include: {
        fields: {
          where: { is_active: true },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    res.json({ forms });
  } catch (error: any) {
    console.error('Error fetching forms:', error);
    res.status(500).json({ error: error?.message || 'Erro ao buscar formulários' });
  }
};

// Buscar formulário por ID
export const getFormById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const form = await prisma.form.findUnique({
      where: { id },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    if (!form) {
      return res.status(404).json({ error: 'Formulário não encontrado' });
    }

    res.json({ form });
  } catch (error: any) {
    console.error('Error fetching form:', error);
    res.status(500).json({ error: error?.message || 'Erro ao buscar formulário' });
  }
};

// Buscar formulário por slug
export const getFormBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const form = await prisma.form.findUnique({
      where: { slug },
      include: {
        fields: {
          where: { is_active: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!form) {
      return res.status(404).json({ error: 'Formulário não encontrado' });
    }

    if (!form.is_active) {
      return res.status(404).json({ error: 'Formulário não encontrado' });
    }

    res.json({ form });
  } catch (error: any) {
    console.error('Error fetching form:', error);
    res.status(500).json({ error: error?.message || 'Erro ao buscar formulário' });
  }
};

// Criar formulário
export const createForm = async (req: Request, res: Response) => {
  try {
    const data = formSchema.parse(req.body);
    
    let slug = data.slug || slugify(data.title);
    
    // Garantir slug único
    const existingForm = await prisma.form.findUnique({
      where: { slug }
    });

    if (existingForm) {
      slug = `${slug}-${Date.now()}`;
    }

    const form = await prisma.form.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        is_active: data.is_active ?? true,
      },
      include: {
        fields: true,
      },
    });

    res.status(201).json({ form });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Error creating form:', error);
    res.status(500).json({ error: error?.message || 'Erro ao criar formulário' });
  }
};

// Atualizar formulário
export const updateForm = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = formSchema.partial().parse(req.body);

    // Se slug foi fornecido, garantir que é único
    if (data.slug) {
      const existingForm = await prisma.form.findFirst({
        where: {
          slug: data.slug,
          id: { not: id },
        },
      });

      if (existingForm) {
        return res.status(400).json({ error: 'Slug já está em uso' });
      }
    }

    const form = await prisma.form.update({
      where: { id },
      data,
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
      },
    });

    res.json({ form });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Error updating form:', error);
    res.status(500).json({ error: error?.message || 'Erro ao atualizar formulário' });
  }
};

// Deletar formulário
export const deleteForm = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.form.delete({
      where: { id },
    });

    res.json({ message: 'Formulário deletado com sucesso' });
  } catch (error: any) {
    console.error('Error deleting form:', error);
    res.status(500).json({ error: error?.message || 'Erro ao deletar formulário' });
  }
};

// Criar campo de formulário
export const createFormField = async (req: Request, res: Response) => {
  try {
    const data = formFieldSchema.parse(req.body);

    if (!data.form_id) {
      return res.status(400).json({ error: 'form_id é obrigatório' });
    }

    const formField = await prisma.formField.create({
      data: {
        form_id: data.form_id,
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
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Error creating form field:', error);
    res.status(500).json({ error: error?.message || 'Erro ao criar campo do formulário' });
  }
};

// Atualizar campo de formulário
export const updateFormField = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = formFieldSchema.omit({ form_id: true }).partial().parse(req.body);

    const formField = await prisma.formField.update({
      where: { id },
      data,
    });

    res.json({ formField });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Error updating form field:', error);
    res.status(500).json({ error: error?.message || 'Erro ao atualizar campo do formulário' });
  }
};

// Deletar campo de formulário
export const deleteFormField = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.formField.delete({
      where: { id },
    });

    res.json({ message: 'Campo deletado com sucesso' });
  } catch (error: any) {
    console.error('Error deleting form field:', error);
    res.status(500).json({ error: error?.message || 'Erro ao deletar campo' });
  }
};

// Submeter formulário reutilizável
export const submitForm = async (req: Request, res: Response) => {
  try {
    const { form_id, form_data, captchaToken, honeypot, landing_page_id } = req.body;

    if (!form_id || !form_data) {
      return res.status(400).json({ error: 'form_id e form_data são obrigatórios' });
    }

    // Validação honeypot
    if (honeypot && honeypot.trim() !== '') {
      console.log('Bot detectado via honeypot no formulário');
      return res.status(400).json({ error: 'Requisição inválida' });
    }

    // Verificar se formulário existe e está ativo
    const form = await prisma.form.findUnique({
      where: { id: form_id },
      include: {
        fields: {
          where: { is_active: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!form) {
      return res.status(404).json({ error: 'Formulário não encontrado' });
    }

    if (!form.is_active) {
      return res.status(404).json({ error: 'Formulário não está ativo' });
    }

    // Validar dados do formulário
    const errors: string[] = [];
    for (const field of form.fields) {
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
      console.log('Modo desenvolvimento: Validação hCaptcha bypassada');
    }

    // Obter informações do cliente
    const ip_address = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const user_agent = req.headers['user-agent'];
    const referrer = req.headers['referer'];

    // Criar submissão
    const submission = await prisma.formSubmission.create({
      data: {
        form_id,
        landing_page_id: landing_page_id || null,
        form_data: JSON.stringify(form_data),
        ip_address: Array.isArray(ip_address) ? ip_address[0] : ip_address,
        user_agent: user_agent || null,
        referrer: referrer || null,
      },
    });

    // Enviar email de notificação
    try {
      const { ConfigurationService } = await import('../services/configurationService.js');
      const { emailService } = await import('../services/emailService.js');
      
      const config = await ConfigurationService.getConfiguration();
      const recipientEmail = config.contact_email || config.email || process.env.SMTP_USER || '';
      
      if (recipientEmail) {
        const emailSent = await emailService.sendLandingPageNotification(recipientEmail, {
          landingPageTitle: form.title,
          landingPageSlug: form.slug,
          formData: form_data,
          formFields: form.fields.map(f => ({ field_label: f.field_label, field_name: f.field_name })),
        });

        if (emailSent) {
          console.log('✅ Email de notificação de formulário enviado para:', recipientEmail);
        } else {
          console.warn('⚠️ Falha ao enviar email de notificação, mas submissão foi salva');
        }
      }
    } catch (emailError) {
      console.error('❌ Erro ao enviar email de notificação:', emailError);
    }

    res.status(201).json({ 
      message: 'Formulário enviado com sucesso',
      submission: {
        id: submission.id,
        created_at: submission.created_at,
      },
    });
  } catch (error: any) {
    console.error('Error submitting form:', error);
    res.status(500).json({ error: error?.message || 'Erro ao enviar formulário' });
  }
};

