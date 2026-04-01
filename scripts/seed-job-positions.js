import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultJobPositions = [
  {
    name: 'Contador',
    description: 'Profissional responsável pela contabilidade geral, escrituração fiscal e tributária, elaboração de demonstrações contábeis e assessoria contábil.',
    order: 1,
    is_active: true,
  },
  {
    name: 'Analista Contábil',
    description: 'Análise de lançamentos contábeis, conciliações bancárias, controle de contas a pagar e receber, e apoio na elaboração de relatórios contábeis.',
    order: 2,
    is_active: true,
  },
  {
    name: 'Analista Fiscal',
    description: 'Responsável pelo cálculo e apuração de impostos, elaboração de obrigações acessórias (SPED, EFD, DCTF), planejamento tributário e análise de legislação fiscal.',
    order: 3,
    is_active: true,
  },
  {
    name: 'Assistente Contábil',
    description: 'Apoio nas rotinas contábeis, organização de documentos, digitação de lançamentos, arquivamento e controle de prazos.',
    order: 4,
    is_active: true,
  },
  {
    name: 'Assistente Fiscal',
    description: 'Auxílio nas rotinas fiscais, organização de documentos fiscais, controle de prazos de obrigações acessórias e apoio na apuração de impostos.',
    order: 5,
    is_active: true,
  },
  {
    name: 'Departamento Pessoal',
    description: 'Responsável pelo processamento de folha de pagamento, cálculo de encargos sociais, controle de férias, 13º salário, admissões e demissões.',
    order: 6,
    is_active: true,
  },
  {
    name: 'Analista de Departamento Pessoal',
    description: 'Análise e processamento de folha de pagamento, cálculo de provisões, controle de benefícios, e-Social e relacionamento com funcionários.',
    order: 7,
    is_active: true,
  },
  {
    name: 'Assistente de Departamento Pessoal',
    description: 'Apoio nas rotinas de departamento pessoal, organização de documentos, controle de ponto, férias e benefícios.',
    order: 8,
    is_active: true,
  },
  {
    name: 'Auxiliar Contábil',
    description: 'Auxílio nas rotinas contábeis básicas, organização de documentos, arquivamento e apoio geral ao setor contábil.',
    order: 9,
    is_active: true,
  },
  {
    name: 'Auxiliar Fiscal',
    description: 'Auxílio nas rotinas fiscais básicas, organização de documentos fiscais, controle de prazos e apoio geral ao setor fiscal.',
    order: 10,
    is_active: true,
  },
  {
    name: 'Estagiário Contábil',
    description: 'Estágio na área contábil com aprendizado prático em escrituração, lançamentos contábeis e rotinas administrativas.',
    order: 11,
    is_active: true,
  },
  {
    name: 'Estagiário Fiscal',
    description: 'Estágio na área fiscal com aprendizado prático em apuração de impostos, obrigações acessórias e rotinas fiscais.',
    order: 12,
    is_active: true,
  },
  {
    name: 'Estagiário Departamento Pessoal',
    description: 'Estágio na área de departamento pessoal com aprendizado prático em folha de pagamento, e-Social e rotinas de RH.',
    order: 13,
    is_active: true,
  },
  {
    name: 'Coordenador Contábil',
    description: 'Coordenação da equipe contábil, supervisão de processos, análise de demonstrações contábeis e relacionamento com clientes.',
    order: 14,
    is_active: true,
  },
  {
    name: 'Coordenador Fiscal',
    description: 'Coordenação da equipe fiscal, supervisão de processos tributários, planejamento fiscal estratégico e relacionamento com clientes.',
    order: 15,
    is_active: true,
  },
  {
    name: 'Supervisor Contábil',
    description: 'Supervisão de equipe contábil, revisão de trabalhos, garantia de qualidade dos processos e treinamento de colaboradores.',
    order: 16,
    is_active: true,
  },
  {
    name: 'Supervisor Fiscal',
    description: 'Supervisão de equipe fiscal, revisão de apurações tributárias, garantia de conformidade fiscal e treinamento de colaboradores.',
    order: 17,
    is_active: true,
  },
  {
    name: 'Gerente Contábil',
    description: 'Gestão completa do setor contábil, estratégias de melhoria de processos, relacionamento com clientes de grande porte e liderança de equipe.',
    order: 18,
    is_active: true,
  },
  {
    name: 'Gerente Fiscal',
    description: 'Gestão completa do setor fiscal, planejamento tributário estratégico, relacionamento com clientes de grande porte e liderança de equipe.',
    order: 19,
    is_active: true,
  },
  {
    name: 'Auditor Contábil',
    description: 'Realização de auditorias contábeis, análise de controles internos, verificação de conformidade e elaboração de relatórios de auditoria.',
    order: 20,
    is_active: true,
  },
  {
    name: 'Consultor Contábil',
    description: 'Consultoria contábil estratégica, análise de processos, implementação de melhorias e assessoria especializada para clientes.',
    order: 21,
    is_active: true,
  },
  {
    name: 'Consultor Fiscal',
    description: 'Consultoria fiscal estratégica, planejamento tributário, análise de oportunidades fiscais e assessoria especializada para clientes.',
    order: 22,
    is_active: true,
  },
];

async function seedJobPositions() {
  console.log('🌱 Iniciando seed de áreas de interesse...\n');

  try {
    for (const position of defaultJobPositions) {
      // Verificar se já existe uma área com o mesmo nome
      const existing = await prisma.jobPosition.findFirst({
        where: { name: position.name },
      });

      if (existing) {
        console.log(`⏭️  Área "${position.name}" já existe. Pulando...`);
        continue;
      }

      // Criar a área de interesse
      await prisma.jobPosition.create({
        data: position,
      });

      console.log(`✅ Área "${position.name}" criada com sucesso!`);
    }

    console.log('\n✨ Seed de áreas de interesse concluído!');
    console.log(`📊 Total de áreas criadas: ${defaultJobPositions.length}`);
  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedJobPositions()
  .then(() => {
    console.log('\n🎉 Processo finalizado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Erro fatal:', error);
    process.exit(1);
  });


