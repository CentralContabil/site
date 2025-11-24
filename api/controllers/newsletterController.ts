import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

interface NewsletterPayload {
  email?: string;
  name?: string;
}

const escapeCsvValue = (value: string) => {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

export const createSubscription = async (req: Request, res: Response) => {
  try {
    const { email, name }: NewsletterPayload = req.body;
    if (!email) {
      return res.status(400).json({ error: 'O email é obrigatório' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await prisma.newsletterSubscription.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }

    const subscription = await prisma.newsletterSubscription.create({
      data: {
        email: normalizedEmail,
        name: name?.trim() || undefined,
      },
    });

    res.status(201).json({ subscription });
  } catch (error) {
    console.error('Erro ao criar inscrição:', error);
    res.status(500).json({ error: 'Erro ao salvar inscrição' });
  }
};

export const listSubscriptions = async (_req: Request, res: Response) => {
  try {
    const subscriptions = await prisma.newsletterSubscription.findMany({
      orderBy: {
        created_at: 'desc',
      },
    });

    res.json({ subscriptions });
  } catch (error) {
    console.error('Erro ao listar inscrições:', error);
    res.status(500).json({ error: 'Erro ao buscar inscrições' });
  }
};

export const deleteSubscription = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const subscription = await prisma.newsletterSubscription.findUnique({
      where: { id },
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Inscrição não encontrada' });
    }

    await prisma.newsletterSubscription.delete({
      where: { id },
    });

    res.json({ message: 'Inscrição removida com sucesso' });
  } catch (error) {
    console.error('Erro ao remover inscrição:', error);
    res.status(500).json({ error: 'Erro ao remover inscrição' });
  }
};

export const exportSubscriptions = async (_req: Request, res: Response) => {
  try {
    const subscriptions = await prisma.newsletterSubscription.findMany({
      orderBy: {
        created_at: 'desc',
      },
    });

    const header = ['Email', 'Nome', 'Cadastrado em'];
    const rows = subscriptions.map((subscription) => [
      escapeCsvValue(subscription.email),
      escapeCsvValue(subscription.name || ''),
      escapeCsvValue(subscription.created_at.toISOString()),
    ]);

    const csv = [header, ...rows].map((row) => row.join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="inscricoes-newsletter.csv"');
    res.send(csv);
  } catch (error) {
    console.error('Erro ao exportar inscrições:', error);
    res.status(500).json({ error: 'Erro ao exportar inscrições' });
  }
};

