import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mapeamento de nomes para slugs
const slugMap: Record<string, string> = {
  'Compete-ES': 'compete-es',
  'Compete Atacadista': 'compete-atacadista',
  'Compete E-Commerce': 'compete-e-commerce',
  'Compete-Importação': 'compete-importacao',
  'Invest-ES': 'invest-es',
  'Invest-Indústria': 'invest-industria',
  'Contribuinte Substituto': 'contribuinte-substituto',
  'Fundap': 'fundap',
};

async function updateSlugs() {
  try {
    console.log('🔄 Atualizando slugs dos benefícios fiscais...\n');

    const benefits = await prisma.sectionFiscalBenefit.findMany();

    if (benefits.length === 0) {
      console.log('⚠️  Nenhum benefício fiscal encontrado no banco de dados.');
      return;
    }

    for (const benefit of benefits) {
      const slug = slugMap[benefit.name] || 
        benefit.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');

      if (benefit.slug !== slug) {
        await prisma.sectionFiscalBenefit.update({
          where: { id: benefit.id },
          data: { slug },
        });
        console.log(`✅ ${benefit.name} -> ${slug}`);
      } else {
        console.log(`⏭️  ${benefit.name} já possui slug: ${slug}`);
      }
    }

    console.log('\n✨ Slugs atualizados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao atualizar slugs:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateSlugs();


