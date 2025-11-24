import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const benefitsToAdd = [
  {
    name: 'Invest-ES',
    icon: 'TrendingDown',
    description: 'Programa de incentivo para novos investimentos no Espírito Santo, oferecendo benefícios fiscais para empresas que investem no estado.',
    slug: 'invest-es',
    excerpt: 'Programa de incentivo fiscal que oferece diferimento, isenção, crédito presumido e redução de base de cálculo do ICMS para empresas que realizam investimentos produtivos no Espírito Santo.',
    content: `<h2>O que é o Invest-ES?</h2>
<p>O Invest-ES (Programa de Incentivo ao Investimento no Estado do Espírito Santo) é um programa de incentivo fiscal voltado para a implantação, expansão e modernização de empresas no estado, especialmente no setor industrial.</p>

<h2>Principais Benefícios</h2>
<ul>
  <li>Diferimento do ICMS para aquisição de equipamentos e máquinas</li>
  <li>Isenção de ICMS em operações específicas</li>
  <li>Crédito presumido de ICMS</li>
  <li>Redução da base de cálculo do ICMS</li>
  <li>Estorno de débito de ICMS</li>
  <li>Benefícios para investimentos produtivos</li>
</ul>

<h2>Quem pode se beneficiar?</h2>
<p>Empresas que realizam novos investimentos no Espírito Santo, especialmente nos setores de indústria, tecnologia e serviços especializados, que atendam aos critérios de geração de empregos e investimento mínimo estabelecidos pelo programa.</p>

<h2>Requisitos para Adesão</h2>
<ul>
  <li>Investimento mínimo conforme estabelecido pelo programa</li>
  <li>Geração de empregos diretos no estado</li>
  <li>Regularidade fiscal e trabalhista</li>
  <li>Enquadramento em setores prioritários</li>
  <li>Projeto de investimento aprovado</li>
</ul>

<h2>Como funciona?</h2>
<p>O benefício é concedido mediante assinatura de Termo de Compromisso com o Governo do Estado, onde a empresa se compromete a realizar investimentos e gerar empregos em troca dos benefícios fiscais oferecidos pelo programa.</p>

<h2>Setores Prioritários</h2>
<p>O programa prioriza investimentos em setores estratégicos como indústria de transformação, tecnologia, logística, energia e infraestrutura, contribuindo para o desenvolvimento econômico sustentável do estado.</p>`,
    order: 5,
    is_active: true,
  },
  {
    name: 'Invest-Indústria',
    icon: 'Factory',
    description: 'Incentivos fiscais específicos para o setor industrial no Espírito Santo.',
    slug: 'invest-industria',
    excerpt: 'Programa de incentivo fiscal específico para empresas do setor industrial, oferecendo redução de ICMS e benefícios sobre insumos e matérias-primas.',
    content: `<h2>O que é o Invest-Indústria?</h2>
<p>O Invest-Indústria é um programa de incentivo fiscal específico para empresas do setor industrial, oferecendo benefícios tributários para indústrias que operam no Espírito Santo.</p>

<h2>Principais Benefícios</h2>
<ul>
  <li>Redução de ICMS para operações industriais</li>
  <li>Benefícios sobre insumos e matérias-primas</li>
  <li>Créditos fiscais para aquisição de equipamentos</li>
  <li>Diferimento de ICMS em operações de entrada</li>
  <li>Simplificação de processos fiscais</li>
  <li>Incentivos para modernização industrial</li>
</ul>

<h2>Quem pode se beneficiar?</h2>
<p>Empresas do setor industrial que operam no Espírito Santo, especialmente aquelas que realizam transformação de matérias-primas, fabricação de produtos e geram empregos no estado.</p>

<h2>Requisitos</h2>
<ul>
  <li>Atividade industrial comprovada</li>
  <li>Investimento em modernização ou expansão</li>
  <li>Geração de empregos diretos</li>
  <li>Regularidade fiscal e trabalhista</li>
  <li>Enquadramento no CNAE industrial</li>
</ul>

<h2>Benefícios Específicos</h2>
<p>O programa oferece benefícios específicos para aquisição de máquinas, equipamentos e insumos utilizados no processo produtivo, reduzindo significativamente a carga tributária das empresas industriais.</p>`,
    order: 6,
    is_active: true,
  },
  {
    name: 'Contribuinte Substituto',
    icon: 'Users',
    description: 'Regime especial de tributação para empresas qualificadas como contribuinte substituto no Espírito Santo.',
    slug: 'contribuinte-substituto',
    excerpt: 'Regime especial que permite que empresas qualificadas assumam a responsabilidade pelo recolhimento de ICMS, oferecendo benefícios fiscais e simplificação de processos.',
    content: `<h2>O que é Contribuinte Substituto?</h2>
<p>O regime de Contribuinte Substituto permite que empresas qualificadas assumam a responsabilidade pelo recolhimento de ICMS nas operações, oferecendo benefícios fiscais e simplificação de processos tributários.</p>

<h2>Principais Benefícios</h2>
<ul>
  <li>Simplificação de processos fiscais</li>
  <li>Redução de obrigações acessórias</li>
  <li>Benefícios tributários específicos</li>
  <li>Maior controle sobre a cadeia de fornecimento</li>
  <li>Eliminação da necessidade de antecipação do ICMS-ST</li>
  <li>Otimização do fluxo de caixa</li>
</ul>

<h2>Quem pode se beneficiar?</h2>
<p>Empresas que atendem aos critérios para se qualificar como contribuinte substituto, geralmente empresas de grande porte com operações significativas no estado, especialmente aquelas que comercializam produtos sujeitos à Substituição Tributária (ICMS-ST).</p>

<h2>Requisitos para Credenciamento</h2>
<ul>
  <li>Inscrição estadual no Espírito Santo</li>
  <li>Regularidade fiscal e trabalhista</li>
  <li>Atendimento aos critérios estabelecidos pela SEFAZ-ES</li>
  <li>Envio mensal da GIA-ST (Guia de Informações e Apuração - Substituição Tributária)</li>
  <li>Comercialização de produtos sujeitos à ST</li>
</ul>

<h2>Como funciona?</h2>
<p>Empresas credenciadas como contribuintes substitutos podem adquirir mercadorias sem o acréscimo do ICMS-ST, assumindo a responsabilidade pelo recolhimento do imposto nas operações subsequentes. Isso otimiza o fluxo de caixa e simplifica os processos tributários.</p>

<h2>Regime Especial de Obrigação Acessória (REOA)</h2>
<p>O REOA é essencial para empresas que atuam como contribuintes substitutos, permitindo a aquisição de mercadorias sem a antecipação do ICMS-ST, o que resulta em significativa economia de capital de giro.</p>`,
    order: 7,
    is_active: true,
  },
  {
    name: 'Fundap',
    icon: 'FileText',
    description: 'Fundo de Desenvolvimento e Apoio à Pesquisa do Espírito Santo, oferecendo incentivos para pesquisa e desenvolvimento.',
    slug: 'fundap',
    excerpt: 'Programa que oferece incentivos fiscais para empresas que investem em pesquisa, desenvolvimento e inovação no Espírito Santo.',
    content: `<h2>O que é o Fundap?</h2>
<p>O Fundap (Fundo de Desenvolvimento e Apoio à Pesquisa do Espírito Santo) é um programa do Governo do Espírito Santo que oferece incentivos fiscais para empresas que investem em pesquisa, desenvolvimento e inovação.</p>

<h2>Principais Benefícios</h2>
<ul>
  <li>Redução de ICMS sobre investimentos em P&D</li>
  <li>Créditos fiscais para projetos de pesquisa</li>
  <li>Apoio financeiro a projetos de inovação</li>
  <li>Parcerias com instituições de pesquisa</li>
  <li>Incentivos para desenvolvimento de novas tecnologias</li>
  <li>Benefícios para empresas de base tecnológica</li>
</ul>

<h2>Quem pode se beneficiar?</h2>
<p>Empresas que investem em pesquisa, desenvolvimento e inovação no Espírito Santo, especialmente aquelas que desenvolvem novos produtos, processos ou tecnologias, e empresas de base tecnológica.</p>

<h2>Requisitos</h2>
<ul>
  <li>Investimento em projetos de P&D aprovados</li>
  <li>Parcerias com instituições de pesquisa reconhecidas</li>
  <li>Regularidade fiscal e trabalhista</li>
  <li>Projetos que contribuam para o desenvolvimento tecnológico do estado</li>
  <li>Comprovação de gastos com pesquisa e desenvolvimento</li>
</ul>

<h2>Como funciona?</h2>
<p>O programa oferece créditos fiscais e reduções de ICMS para empresas que investem em projetos de pesquisa e desenvolvimento aprovados, incentivando a inovação e o desenvolvimento tecnológico no estado.</p>

<h2>Áreas de Atuação</h2>
<p>O Fundap prioriza projetos nas áreas de tecnologia, inovação, desenvolvimento de produtos, processos industriais, biotecnologia e outras áreas estratégicas para o desenvolvimento econômico do Espírito Santo.</p>

<h2>Parcerias com Instituições</h2>
<p>O programa incentiva parcerias entre empresas e instituições de pesquisa, universidades e centros tecnológicos, promovendo a transferência de conhecimento e tecnologia.</p>`,
    order: 8,
    is_active: true,
  },
];

async function addMissingBenefits() {
  try {
    console.log('🔄 Adicionando benefícios fiscais faltantes...\n');

    for (const benefit of benefitsToAdd) {
      // Verificar se já existe
      const existing = await prisma.sectionFiscalBenefit.findFirst({
        where: { slug: benefit.slug },
      });

      if (existing) {
        // Atualizar se já existir
        await prisma.sectionFiscalBenefit.update({
          where: { id: existing.id },
          data: benefit,
        });
        console.log(`✅ Atualizado: ${benefit.name}`);
      } else {
        // Criar novo
        await prisma.sectionFiscalBenefit.create({
          data: benefit,
        });
        console.log(`✅ Criado: ${benefit.name}`);
      }
    }

    console.log('\n✨ Benefícios fiscais adicionados/atualizados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao adicionar benefícios:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addMissingBenefits();


