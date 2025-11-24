import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkBenefits() {
  try {
    const benefits = await prisma.sectionFiscalBenefit.findMany({
      orderBy: { order: 'asc' }
    });
    
    console.log('Benefícios encontrados no banco:\n');
    benefits.forEach(b => {
      console.log(`- ${b.name}`);
      console.log(`  Slug: ${b.slug || 'SEM SLUG'}`);
      console.log(`  ID: ${b.id}`);
      console.log('');
    });
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBenefits();


