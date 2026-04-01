import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verificar() {
  console.log('🔍 Verificando configuração de Job Positions...\n');

  try {
    // Verificar se o modelo existe no Prisma Client
    console.log('1. Verificando se JobPosition existe no Prisma Client...');
    if (typeof prisma.jobPosition === 'undefined') {
      console.log('❌ ERRO: prisma.jobPosition não existe!');
      console.log('   Execute: npx prisma generate');
      process.exit(1);
    } else {
      console.log('✅ Prisma Client tem o modelo JobPosition');
    }

    // Tentar contar registros
    console.log('\n2. Verificando tabela no banco de dados...');
    const count = await prisma.jobPosition.count();
    console.log(`✅ Tabela existe e tem ${count} registro(s)`);

    // Listar todas as áreas
    if (count > 0) {
      console.log('\n3. Listando áreas cadastradas:');
      const positions = await prisma.jobPosition.findMany({
        orderBy: { order: 'asc' },
      });
      positions.forEach((pos, index) => {
        console.log(`   ${index + 1}. ${pos.name} (${pos.is_active ? 'Ativa' : 'Inativa'})`);
      });
    } else {
      console.log('\n⚠️  Nenhuma área cadastrada ainda.');
      console.log('   Execute: npm run seed:job-positions');
    }

    console.log('\n✅ Verificação concluída com sucesso!');
  } catch (error) {
    console.error('\n❌ ERRO durante verificação:', error.message);
    if (error.message.includes('Unknown model')) {
      console.log('\n💡 Solução:');
      console.log('   1. Execute: npx prisma generate');
      console.log('   2. Execute: npx prisma db push');
      console.log('   3. Reinicie o servidor backend');
    } else if (error.message.includes('relation') || error.message.includes('table')) {
      console.log('\n💡 Solução:');
      console.log('   1. Execute: npx prisma db push');
      console.log('   2. Execute: npm run seed:job-positions');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verificar();


