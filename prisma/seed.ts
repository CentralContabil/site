import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar administrador padrão
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.admin.upsert({
    where: { email: 'sistema@central-rnc.com.br' },
    update: {},
    create: {
      email: 'sistema@central-rnc.com.br',
      password_hash: adminPassword,
      name: 'Administrador Central RNC',
    },
  });

  // Criar segundo administrador para Wagner
  const admin2 = await prisma.admin.upsert({
    where: { email: 'wagner.guerra@gmail.com' },
    update: {},
    create: {
      email: 'wagner.guerra@gmail.com',
      password_hash: adminPassword,
      name: 'Wagner Guerra',
    },
  });

  // Criar configurações padrão
  const config = await prisma.configuration.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      company_name: 'Central Contábil',
      phone: '(27) 2104-8300',
      email: 'contato@central-rnc.com.br',
      address: 'Avenida Central, n° 1345, Parque Residencial Laranjeiras, Serra/ES. CEP: 29165-130',
      business_hours: 'Segunda a Quinta-feira: 8h às 18h | Sexta-feira: 8h às 17h',
      facebook_url: 'https://facebook.com/centralcontabil',
      instagram_url: 'https://instagram.com/centralcontabil',
      linkedin_url: 'https://linkedin.com/company/centralcontabil',
    },
  });

  // Criar slides padrão
  const slides = await Promise.all([
    prisma.slide.upsert({
      where: { id: 'slide-1' },
      update: {},
      create: {
        id: 'slide-1',
        title: 'Soluções Contábeis Personalizadas',
        subtitle: 'Especialistas em contabilidade para pequenas e médias empresas',
        image_url: 'https://images.unsplash.com/photo-1554224155-6726b468ff31?w=1200&h=800&fit=crop',
        button_text: 'Saiba Mais',
        button_link: '#servicos',
        order: 1,
        is_active: true,
      },
    }),
    prisma.slide.upsert({
      where: { id: 'slide-2' },
      update: {},
      create: {
        id: 'slide-2',
        title: 'Assessoria Tributária Especializada',
        subtitle: 'Minimize seus custos com planejamento tributário inteligente',
        image_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=800&fit=crop',
        button_text: 'Entre em Contato',
        button_link: '#contato',
        order: 2,
        is_active: true,
      },
    }),
    prisma.slide.upsert({
      where: { id: 'slide-3' },
      update: {},
      create: {
        id: 'slide-3',
        title: 'Abertura de Empresa Simplificada',
        subtitle: 'Comece seu negócio com toda assessoria contábil necessária',
        image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=800&fit=crop',
        button_text: 'Solicite um Orçamento',
        button_link: '#contato',
        order: 3,
        is_active: true,
      },
    }),
  ]);

  // Função para gerar slug
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

  // Criar serviços padrão
  const services = await Promise.all([
    prisma.service.upsert({
      where: { id: 'service-1' },
      update: { slug: 'abertura-de-empresa' },
      create: {
        id: 'service-1',
        name: 'Abertura de Empresa',
        slug: 'abertura-de-empresa',
        description: 'Assessoria completa para abertura de CNPJ, escolha do regime tributário e legalização do seu negócio. Cuidamos de todo o processo burocrático para você.',
        content: '<p>Nossa equipe especializada oferece uma assessoria completa para abertura de empresa, desde a escolha do melhor regime tributário até a legalização completa do seu negócio.</p><p>Oferecemos suporte em todas as etapas do processo, garantindo agilidade e segurança na abertura da sua empresa.</p>',
        icon: 'building',
        order: 1,
        is_active: true,
      },
    }),
    prisma.service.upsert({
      where: { id: 'service-2' },
      update: { slug: 'contabilidade-consultiva' },
      create: {
        id: 'service-2',
        name: 'Contabilidade Consultiva',
        slug: 'contabilidade-consultiva',
        description: 'Serviços contábeis com análise detalhada e orientação estratégica para crescimento do seu negócio. Transforme dados em decisões inteligentes.',
        content: '<p>A contabilidade consultiva vai além dos números. Oferecemos análise detalhada e orientação estratégica para o crescimento sustentável do seu negócio.</p><p>Transformamos dados contábeis em insights valiosos para tomada de decisão.</p>',
        icon: 'calculator',
        order: 2,
        is_active: true,
      },
    }),
    prisma.service.upsert({
      where: { id: 'service-3' },
      update: { slug: 'departamento-pessoal' },
      create: {
        id: 'service-3',
        name: 'Departamento Pessoal',
        slug: 'departamento-pessoal',
        description: 'Gestão completa de folha de pagamento, admissões, demissões e obrigações trabalhistas. Garantia de conformidade com a legislação.',
        content: '<p>Gestão completa de folha de pagamento, admissões, demissões e todas as obrigações trabalhistas.</p><p>Garantimos total conformidade com a legislação trabalhista vigente.</p>',
        icon: 'users',
        order: 3,
        is_active: true,
      },
    }),
    prisma.service.upsert({
      where: { id: 'service-4' },
      update: { slug: 'fiscal-e-tributaria' },
      create: {
        id: 'service-4',
        name: 'Fiscal e Tributária',
        slug: 'fiscal-e-tributaria',
        description: 'Planejamento tributário, elaboração de guias e cumprimento de obrigações fiscais. Reduza custos dentro da legalidade.',
        content: '<p>Planejamento tributário estratégico, elaboração de guias e cumprimento de todas as obrigações fiscais.</p><p>Reduza custos tributários dentro da legalidade, otimizando a carga fiscal da sua empresa.</p>',
        icon: 'file-text',
        order: 4,
        is_active: true,
      },
    }),
    prisma.service.upsert({
      where: { id: 'service-5' },
      update: { slug: 'legalizacao-de-empresas' },
      create: {
        id: 'service-5',
        name: 'Legalização de Empresas',
        slug: 'legalizacao-de-empresas',
        description: 'Regularização de empresas com pendências fiscais e trabalhistas junto aos órgãos competentes. Recupere a saúde do seu negócio.',
        content: '<p>Regularização completa de empresas com pendências fiscais e trabalhistas junto aos órgãos competentes.</p><p>Recupere a saúde do seu negócio com nosso suporte especializado.</p>',
        icon: 'shield',
        order: 5,
        is_active: true,
      },
    }),
    prisma.service.upsert({
      where: { id: 'service-6' },
      update: { slug: 'assessoria-financeira' },
      create: {
        id: 'service-6',
        name: 'Assessoria Financeira',
        slug: 'assessoria-financeira',
        description: 'Análise de demonstrativos financeiros e orientação para melhoria da saúde financeira. Tomar decisões baseadas em dados.',
        content: '<p>Análise detalhada de demonstrativos financeiros e orientação estratégica para melhoria da saúde financeira.</p><p>Tomamos decisões baseadas em dados concretos e análises precisas.</p>',
        icon: 'trending-up',
        order: 6,
        is_active: true,
      },
    }),
  ]);

  // Criar depoimentos padrão
  const testimonials = await Promise.all([
    prisma.testimonial.upsert({
      where: { id: 'testimonial-1' },
      update: {},
      create: {
        id: 'testimonial-1',
        client_name: 'João Silva',
        company: 'Silva & Associados',
        testimonial_text: 'Excelente serviço! A equipe é muito profissional e atenciosa. Nos ajudou a organizar toda a contabilidade da empresa com muita eficiência. Super recomendo!',
        order: 1,
        is_active: true,
      },
    }),
    prisma.testimonial.upsert({
      where: { id: 'testimonial-2' },
      update: {},
      create: {
        id: 'testimonial-2',
        client_name: 'Maria Santos',
        company: 'Comércio Varejista Ltda',
        testimonial_text: 'Estou muito satisfeita com os serviços prestados. A assessoria tributária fez toda a diferença para o crescimento do meu negócio. Profissionais excelentes!',
        order: 2,
        is_active: true,
      },
    }),
    prisma.testimonial.upsert({
      where: { id: 'testimonial-3' },
      update: {},
      create: {
        id: 'testimonial-3',
        client_name: 'Pedro Oliveira',
        company: 'Tecnologia Inovadora',
        testimonial_text: 'Profissionais extremamente competentes. Sempre disponíveis para tirar dúvidas e oferecer as melhores soluções contábeis. São parceiros fundamentais para nossa empresa.',
        order: 3,
        is_active: true,
      },
    }),
  ]);

  // Criar posts de blog de exemplo
  const blogPosts = await Promise.all([
    prisma.blogPost.upsert({
      where: { slug: 'planejamento-tributario-2024-guia-completo' },
      update: {},
      create: {
        title: 'Planejamento Tributário 2024: Guia Completo para Empresas',
        slug: 'planejamento-tributario-2024-guia-completo',
        excerpt: 'Descubra como o planejamento tributário pode reduzir significativamente a carga fiscal da sua empresa em 2024. Estratégias legais e eficientes para otimizar seus impostos.',
        content: `<h2>O que é Planejamento Tributário?</h2>
<p>O planejamento tributário é uma ferramenta estratégica que permite às empresas reduzir legalmente a carga fiscal através da análise detalhada da legislação e da escolha do melhor regime tributário para cada situação.</p>

<h2>Benefícios do Planejamento Tributário</h2>
<ul>
<li><strong>Redução de custos:</strong> Economia significativa na carga tributária</li>
<li><strong>Conformidade legal:</strong> Garantia de estar em dia com todas as obrigações fiscais</li>
<li><strong>Competitividade:</strong> Preços mais competitivos no mercado</li>
<li><strong>Segurança:</strong> Evita autuações e multas fiscais</li>
</ul>

<h2>Principais Estratégias para 2024</h2>
<p>Em 2024, algumas estratégias se destacam:</p>
<ol>
<li><strong>Análise do regime tributário:</strong> Verificar se o Simples Nacional, Lucro Presumido ou Lucro Real é mais vantajoso</li>
<li><strong>Aproveitamento de incentivos fiscais:</strong> Como o Compete-ES e outros programas estaduais</li>
<li><strong>Otimização de despesas:</strong> Identificar despesas dedutíveis que podem reduzir a base de cálculo</li>
<li><strong>Planejamento de operações:</strong> Estruturar operações de forma mais eficiente fiscalmente</li>
</ol>

<h2>Como a Central Contábil Pode Ajudar</h2>
<p>Nossa equipe especializada em planejamento tributário está preparada para analisar sua empresa e desenvolver estratégias personalizadas que se adequem ao seu perfil e objetivos. Com mais de 34 anos de experiência, já ajudamos centenas de empresas a otimizar sua carga tributária.</p>

<p>Entre em contato conosco e descubra como podemos ajudar sua empresa a economizar com planejamento tributário estratégico.</p>`,
        featured_image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=600&fit=crop',
        author: 'Equipe Central Contábil',
        is_published: true,
        published_at: new Date('2024-01-15'),
      },
    }),
    prisma.blogPost.upsert({
      where: { slug: 'compete-es-beneficios-fiscais-espirito-santo' },
      update: {},
      create: {
        title: 'Compete-ES: Conheça os Benefícios Fiscais no Espírito Santo',
        slug: 'compete-es-beneficios-fiscais-espirito-santo',
        excerpt: 'O programa Compete-ES oferece incentivos fiscais significativos para empresas que investem no Espírito Santo. Saiba como sua empresa pode se beneficiar.',
        content: `<h2>O que é o Compete-ES?</h2>
<p>O Compete-ES (Programa de Competitividade do Espírito Santo) é uma iniciativa do governo estadual que oferece incentivos fiscais para empresas que investem no estado, visando promover o desenvolvimento econômico e a geração de empregos.</p>

<h2>Principais Benefícios</h2>
<ul>
<li><strong>Redução de ICMS:</strong> Até 75% de redução na alíquota de ICMS</li>
<li><strong>Crédito Presumido:</strong> Geração de créditos fiscais para compensação</li>
<li><strong>Isenção de Taxas:</strong> Dispensa de algumas taxas estaduais</li>
<li><strong>Desoneração:</strong> Redução da carga tributária em operações específicas</li>
</ul>

<h2>Quem Pode Participar?</h2>
<p>Empresas de diversos segmentos podem se beneficiar do Compete-ES:</p>
<ul>
<li>Indústrias</li>
<li>Comércio atacadista</li>
<li>E-commerce</li>
<li>Empresas de importação</li>
<li>Setor de serviços qualificados</li>
</ul>

<h2>Como Solicitar o Benefício</h2>
<p>O processo de habilitação ao Compete-ES envolve:</p>
<ol>
<li>Análise de elegibilidade da empresa</li>
<li>Preparação da documentação necessária</li>
<li>Protocolo junto à Secretaria de Estado da Fazenda (SEFAZ-ES)</li>
<li>Acompanhamento do processo de aprovação</li>
<li>Manutenção das obrigações para continuidade do benefício</li>
</ol>

<h2>Nossa Experiência</h2>
<p>A Central Contábil possui vasta experiência em processos de habilitação ao Compete-ES e outros programas de incentivos fiscais. Nossa equipe especializada pode orientar sua empresa em todo o processo, desde a análise de elegibilidade até a manutenção dos benefícios.</p>

<p>Entre em contato e descubra se sua empresa pode se beneficiar do Compete-ES!</p>`,
        featured_image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop',
        author: 'Equipe Central Contábil',
        is_published: true,
        published_at: new Date('2024-02-10'),
      },
    }),
    prisma.blogPost.upsert({
      where: { slug: 'simples-nacional-vs-lucro-presumido-qual-escolher' },
      update: {},
      create: {
        title: 'Simples Nacional vs Lucro Presumido: Qual Escolher?',
        slug: 'simples-nacional-vs-lucro-presumido-qual-escolher',
        excerpt: 'A escolha do regime tributário é fundamental para a saúde financeira da sua empresa. Entenda as diferenças entre Simples Nacional e Lucro Presumido.',
        content: `<h2>Entendendo os Regimes Tributários</h2>
<p>A escolha do regime tributário adequado é uma das decisões mais importantes para uma empresa, pois impacta diretamente na carga tributária e na complexidade das obrigações fiscais.</p>

<h2>Simples Nacional</h2>
<h3>Vantagens:</h3>
<ul>
<li>Unificação de impostos em uma única guia (DAS)</li>
<li>Alíquotas progressivas conforme o faturamento</li>
<li>Menor burocracia e obrigações acessórias</li>
<li>Ideal para pequenas empresas</li>
</ul>

<h3>Desvantagens:</h3>
<ul>
<li>Limite de faturamento anual (R$ 4,8 milhões em 2024)</li>
<li>Algumas atividades não podem optar</li>
<li>Restrições para empresas com sócios no exterior</li>
</ul>

<h2>Lucro Presumido</h2>
<h3>Vantagens:</h2>
<ul>
<li>Sem limite de faturamento</li>
<li>Alíquotas fixas sobre a receita bruta</li>
<li>Mais flexibilidade para diferentes tipos de empresa</li>
<li>Possibilidade de reduzir a base de cálculo com despesas</li>
</ul>

<h3>Desvantagens:</h3>
<ul>
<li>Mais obrigações acessórias</li>
<li>Múltiplas guias de impostos</li>
<li>Maior complexidade na apuração</li>
<li>Pode ser mais oneroso para empresas com margem baixa</li>
</ul>

<h2>Como Escolher?</h2>
<p>A escolha deve ser baseada em:</p>
<ol>
<li><strong>Faturamento:</strong> Verificar se está dentro do limite do Simples</li>
<li><strong>Atividade:</strong> Confirmar se a atividade permite optar pelo Simples</li>
<li><strong>Margem de lucro:</strong> Analisar qual regime é mais vantajoso</li>
<li><strong>Estrutura:</strong> Considerar a capacidade de cumprir obrigações</li>
<li><strong>Projeções:</strong> Avaliar o crescimento esperado</li>
</ol>

<h2>Análise Personalizada</h2>
<p>Cada empresa é única e a escolha do regime tributário deve ser feita com base em uma análise detalhada. A Central Contábil oferece consultoria especializada para ajudar sua empresa a escolher o regime mais adequado, considerando todas as variáveis e projeções futuras.</p>

<p>Entre em contato e agende uma consultoria tributária personalizada!</p>`,
        featured_image_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=600&fit=crop',
        author: 'Equipe Central Contábil',
        is_published: true,
        published_at: new Date('2024-03-05'),
      },
    }),
    prisma.blogPost.upsert({
      where: { slug: 'obrigacoes-fiscais-mensais-empresas-brasil' },
      update: {},
      create: {
        title: 'Obrigações Fiscais Mensais: Guia Completo para Empresas',
        slug: 'obrigacoes-fiscais-mensais-empresas-brasil',
        excerpt: 'Mantenha sua empresa em dia com todas as obrigações fiscais mensais. Confira o calendário completo e evite multas e autuações.',
        content: `<h2>Importância das Obrigações Fiscais</h2>
<p>O cumprimento das obrigações fiscais é fundamental para manter a empresa em conformidade com a legislação e evitar multas, juros e outras penalidades que podem comprometer a saúde financeira do negócio.</p>

<h2>Principais Obrigações Mensais</h2>
<h3>1. Impostos Federais</h3>
<ul>
<li><strong>IRPJ e CSLL:</strong> Imposto de Renda e Contribuição Social sobre o Lucro Líquido</li>
<li><strong>PIS e COFINS:</strong> Contribuições sociais sobre o faturamento</li>
<li><strong>IRRF:</strong> Imposto de Renda Retido na Fonte</li>
<li><strong>INSS:</strong> Contribuições previdenciárias</li>
</ul>

<h3>2. Impostos Estaduais</h3>
<ul>
<li><strong>ICMS:</strong> Imposto sobre Circulação de Mercadorias e Serviços</li>
<li><strong>GIA:</strong> Guia de Informação e Apuração do ICMS</li>
</ul>

<h3>3. Impostos Municipais</h3>
<ul>
<li><strong>ISS:</strong> Imposto Sobre Serviços</li>
<li><strong>IPTU:</strong> Imposto sobre Propriedade Predial e Territorial Urbana (quando aplicável)</li>
</ul>

<h3>4. Obrigações Trabalhistas</h3>
<ul>
<li><strong>Folha de Pagamento:</strong> Cálculo e recolhimento de encargos</li>
<li><strong>eSocial:</strong> Envio de informações trabalhistas</li>
<li><strong>FGTS:</strong> Depósito mensal</li>
<li><strong>RAIS:</strong> Relação Anual de Informações Sociais (anual, mas com preparação mensal)</li>
</ul>

<h2>Calendário de Vencimentos</h2>
<p>Os vencimentos variam conforme o regime tributário e o porte da empresa. É importante manter um calendário atualizado para não perder prazos.</p>

<h2>Consequências do Atraso</h2>
<ul>
<li>Multas e juros sobre valores em atraso</li>
<li>Bloqueio de CNPJ</li>
<li>Impedimento de participar de licitações</li>
<li>Dificuldades para obter empréstimos</li>
<li>Possibilidade de enquadramento como empresa inidônea</li>
</ul>

<h2>Como a Central Contábil Pode Ajudar</h2>
<p>Nossa equipe especializada cuida de todas as obrigações fiscais da sua empresa, garantindo que tudo seja feito dentro dos prazos e em conformidade com a legislação. Oferecemos:</p>
<ul>
<li>Planejamento de obrigações mensais</li>
<li>Cálculo e recolhimento de impostos</li>
<li>Envio de declarações e guias</li>
<li>Acompanhamento de prazos</li>
<li>Alertas preventivos</li>
</ul>

<p>Deixe sua empresa em dia com a contabilidade! Entre em contato conosco.</p>`,
        featured_image_url: 'https://images.unsplash.com/photo-1554224155-6726b468ff31?w=1200&h=600&fit=crop',
        author: 'Equipe Central Contábil',
        is_published: true,
        published_at: new Date('2024-03-20'),
      },
    }),
    prisma.blogPost.upsert({
      where: { slug: 'abertura-empresa-passo-passo-guia-completo' },
      update: {},
      create: {
        title: 'Abertura de Empresa: Passo a Passo Completo',
        slug: 'abertura-empresa-passo-passo-guia-completo',
        excerpt: 'Planejando abrir uma empresa? Confira nosso guia completo com todos os passos necessários para abrir seu negócio de forma correta e sem complicações.',
        content: `<h2>Por Que Ter um Planejamento?</h2>
<p>Abrir uma empresa é um processo que envolve várias etapas e documentos. Ter um planejamento adequado evita retrabalho, economiza tempo e garante que tudo seja feito corretamente desde o início.</p>

<h2>Passo a Passo para Abertura</h2>
<h3>1. Definição do Tipo de Empresa</h3>
<p>Antes de tudo, é necessário definir o tipo societário:</p>
<ul>
<li><strong>MEI (Microempreendedor Individual):</strong> Para faturamento até R$ 81.000/ano</li>
<li><strong>EIRELI:</strong> Empresa Individual de Responsabilidade Limitada</li>
<li><strong>LTDA:</strong> Sociedade Limitada</li>
<li><strong>SA:</strong> Sociedade Anônima</li>
</ul>

<h3>2. Definição da Atividade</h3>
<p>É fundamental definir corretamente o CNAE (Código Nacional de Atividade Econômica) que melhor representa a atividade da empresa.</p>

<h3>3. Escolha do Nome</h3>
<p>Verificar a disponibilidade do nome empresarial junto à Junta Comercial ou Cartório de Registro de Pessoas Jurídicas.</p>

<h3>4. Definição do Regime Tributário</h3>
<p>Escolher entre Simples Nacional, Lucro Presumido ou Lucro Real, conforme a atividade e faturamento.</p>

<h3>5. Documentação Necessária</h3>
<ul>
<li>RG e CPF dos sócios</li>
<li>Comprovante de residência</li>
<li>Contrato social ou requerimento de empresário</li>
<li>Alvará de localização (quando necessário)</li>
</ul>

<h3>6. Registro na Junta Comercial</h3>
<p>Registro do contrato social ou requerimento de empresário na Junta Comercial do estado.</p>

<h3>7. Obtenção do CNPJ</h3>
<p>Cadastro na Receita Federal para obtenção do CNPJ.</p>

<h3>8. Inscrições Estaduais e Municipais</h3>
<ul>
<li>Inscrição Estadual (IE) para ICMS</li>
<li>Inscrição Municipal para ISS</li>
</ul>

<h3>9. Licenças e Alvarás</h3>
<p>Dependendo da atividade, podem ser necessários:</p>
<ul>
<li>Alvará de funcionamento</li>
<li>Licença sanitária</li>
<li>Licença ambiental</li>
<li>Outras licenças específicas</li>
</ul>

<h3>10. Abertura de Conta Bancária</h3>
<p>Com o CNPJ em mãos, é possível abrir conta corrente empresarial.</p>

<h2>Erros Comuns a Evitar</h2>
<ul>
<li>Escolher CNAE incorreto</li>
<li>Não definir corretamente o regime tributário</li>
<li>Esquecer de fazer inscrições necessárias</li>
<li>Não manter documentação organizada</li>
<li>Não contratar contador desde o início</li>
</ul>

<h2>Como a Central Contábil Pode Ajudar</h2>
<p>A Central Contábil oferece serviço completo de abertura de empresa, cuidando de todas as etapas do processo:</p>
<ul>
<li>Orientação sobre tipo societário e regime tributário</li>
<li>Elaboração de contrato social</li>
<li>Protocolo de todos os documentos</li>
<li>Acompanhamento de todo o processo</li>
<li>Orientação pós-abertura</li>
</ul>

<p>Abra sua empresa com quem entende do assunto! Entre em contato conosco.</p>`,
        featured_image_url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&h=600&fit=crop',
        author: 'Equipe Central Contábil',
        is_published: true,
        published_at: new Date('2024-04-01'),
      },
    }),
    prisma.blogPost.upsert({
      where: { slug: 'esocial-entenda-o-que-e-e-como-funciona' },
      update: {},
      create: {
        title: 'eSocial: Entenda o que é e Como Funciona',
        slug: 'esocial-entenda-o-que-e-e-como-funciona',
        excerpt: 'O eSocial é uma plataforma do governo que unifica o envio de informações trabalhistas, previdenciárias e fiscais. Saiba como funciona e como sua empresa deve se adequar.',
        content: `<h2>O que é o eSocial?</h2>
<p>O eSocial é um sistema eletrônico do governo federal que unifica o envio de informações trabalhistas, previdenciárias e fiscais das empresas. Foi criado para simplificar e padronizar a comunicação entre empregadores e órgãos públicos.</p>

<h2>Objetivos do eSocial</h2>
<ul>
<li>Reduzir a burocracia</li>
<li>Eliminar a duplicidade de informações</li>
<li>Facilitar a fiscalização</li>
<li>Melhorar a qualidade dos dados</li>
<li>Agilizar processos</li>
</ul>

<h2>Quem Deve Usar?</h2>
<p>Todas as empresas que possuem funcionários registrados devem utilizar o eSocial, incluindo:</p>
<ul>
<li>Empresas de todos os portes</li>
<li>MEI com funcionários</li>
<li>Órgãos públicos</li>
<li>Empregadores domésticos</li>
</ul>

<h2>Eventos do eSocial</h2>
<p>O sistema contempla diversos eventos, como:</p>
<ul>
<li><strong>S-1000:</strong> Informações do empregador</li>
<li><strong>S-1005:</strong> Tabelas de estabelecimentos</li>
<li><strong>S-1010:</strong> Rubricas</li>
<li><strong>S-2200:</strong> Cadastramento inicial do vínculo</li>
<li><strong>S-1200:</strong> Remuneração de trabalhador vinculado ao Regime Geral de Previdência Social</li>
<li><strong>S-2299:</strong> Desligamento</li>
<li>E muitos outros eventos específicos</li>
</ul>

<h2>Prazos e Obrigações</h2>
<p>Os prazos variam conforme o tipo de evento:</p>
<ul>
<li>Eventos de cadastro: até o dia 7 do mês seguinte</li>
<li>Eventos de folha: até o dia 7 do mês seguinte</li>
<li>Eventos não periódicos: conforme ocorrência</li>
</ul>

<h2>Consequências do Não Cumprimento</h2>
<ul>
<li>Multas por atraso ou omissão</li>
<li>Bloqueio de CNPJ</li>
<li>Impedimento de participar de licitações</li>
<li>Dificuldades para obter empréstimos</li>
</ul>

<h2>Como a Central Contábil Pode Ajudar</h2>
<p>Nossa equipe especializada em eSocial oferece:</p>
<ul>
<li>Cadastro inicial no sistema</li>
<li>Envio de todos os eventos necessários</li>
<li>Acompanhamento de prazos</li>
<li>Correção de inconsistências</li>
<li>Treinamento para sua equipe</li>
<li>Suporte contínuo</li>
</ul>

<p>Mantenha sua empresa em conformidade com o eSocial! Entre em contato conosco.</p>`,
        featured_image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop',
        author: 'Equipe Central Contábil',
        is_published: true,
        published_at: new Date('2024-04-15'),
      },
    }),
  ]);

  console.log('✅ Seed concluído com sucesso!');
  console.log('👤 Administradores criados:');
  console.log('   - sistema@central-rnc.com.br / admin123');
  console.log('   - wagner.guerra@gmail.com / admin123');
  console.log('🏢 Configurações da empresa criadas');
  console.log(`📊 ${slides.length} slides criados`);
  console.log(`🔧 ${services.length} serviços criados`);
  console.log(`💬 ${testimonials.length} depoimentos criados`);
  console.log(`📝 ${blogPosts.length} posts de blog criados`);

  // Criar dados padrão do Hero
  let hero = await prisma.hero.findFirst();
  if (!hero) {
    hero = await prisma.hero.create({
      data: {
        badge_text: 'Contabilidade Consultiva',
        title_line1: 'Soluções que Vão',
        title_line2: 'Além da Contabilidade',
        description: 'Com mais de 34 anos de atuação, oferecemos consultoria contábil estratégica para impulsionar o crescimento do seu negócio com segurança e inovação.',
        background_image_url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1920&h=1080&fit=crop&q=80',
        hero_image_url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20businessman%20pointing%20upward%20smiling%20confident%20wearing%20suit%20tie%20glasses%20transparent%20background%20isolated%20high%20quality%20professional%20photography%20white%20background&image_size=portrait_9_16',
        button1_text: 'Agende uma Consultoria',
        button1_link: '#contato',
        button2_text: 'Conheça Nossos Serviços',
        button2_link: '#servicos',
        stat_years: '34+',
        stat_clients: '500+',
        stat_network: 'RNC',
      },
    });
    console.log('🎯 Hero criado');
  } else {
    console.log('🎯 Hero já existe');
  }

  // Criar dados padrão das seções
  // Features
  const features = await Promise.all([
    prisma.sectionFeature.upsert({
      where: { id: 'feature-1' },
      update: {},
      create: {
        id: 'feature-1',
        icon: 'Shield',
        title: 'Conformidade Garantida',
        description: 'Garantimos total conformidade fiscal e tributária para seu negócio',
        order: 1,
        is_active: true,
      },
    }),
    prisma.sectionFeature.upsert({
      where: { id: 'feature-2' },
      update: {},
      create: {
        id: 'feature-2',
        icon: 'Zap',
        title: 'Agilidade nos Processos',
        description: 'Entregas rápidas e eficientes sem comprometer a qualidade',
        order: 2,
        is_active: true,
      },
    }),
    prisma.sectionFeature.upsert({
      where: { id: 'feature-3' },
      update: {},
      create: {
        id: 'feature-3',
        icon: 'Settings',
        title: 'Soluções Personalizadas',
        description: 'Consultoria adaptada às necessidades específicas do seu negócio',
        order: 3,
        is_active: true,
      },
    }),
    prisma.sectionFeature.upsert({
      where: { id: 'feature-4' },
      update: {},
      create: {
        id: 'feature-4',
        icon: 'TrendingUp',
        title: 'Otimização Tributária',
        description: 'Redução legal da carga tributária com estratégias inteligentes',
        order: 4,
        is_active: true,
      },
    }),
    prisma.sectionFeature.upsert({
      where: { id: 'feature-5' },
      update: {},
      create: {
        id: 'feature-5',
        icon: 'Users',
        title: 'Equipe Qualificada',
        description: 'Profissionais certificados e atualizados com as últimas normas',
        order: 5,
        is_active: true,
      },
    }),
    prisma.sectionFeature.upsert({
      where: { id: 'feature-6' },
      update: {},
      create: {
        id: 'feature-6',
        icon: 'Award',
        title: 'Excelência Comprovada',
        description: 'Mais de 34 anos de tradição e milhares de clientes satisfeitos',
        order: 6,
        is_active: true,
      },
    }),
  ]);
  console.log(`⭐ ${features.length} features criadas`);

  // About
  let about = await prisma.sectionAbout.findFirst();
  if (!about) {
    about = await prisma.sectionAbout.create({
      data: {
        badge_text: 'Sobre Nós',
        title: 'Quem Somos',
        description: 'Com mais de 34 anos de atuação, a Central Contábil – Soluções Empresariais é uma das maiores e mais experientes empresas de Contabilidade do Estado do Espírito Santo. Nossas soluções vão além da contabilidade tradicional: atuamos de forma integrada e estratégica para que o seu negócio tenha a melhor performance contábil, fiscal e tributária.',
        stat_years: '34+',
        stat_clients: '500+',
        stat_network: 'RNC',
      },
    });
    console.log('📋 Seção About criada');
  } else {
    console.log('📋 Seção About já existe');
  }

  // Specialties
  const specialties = await Promise.all([
    prisma.sectionSpecialty.upsert({
      where: { id: 'specialty-1' },
      update: {},
      create: {
        id: 'specialty-1',
        icon: 'Store',
        name: 'Contabilidade Atacadista',
        description: 'Especialização em contabilidade para empresas do setor atacadista, com conhecimento profundo das particularidades fiscais e tributárias do segmento.',
        order: 1,
        is_active: true,
      },
    }),
    prisma.sectionSpecialty.upsert({
      where: { id: 'specialty-2' },
      update: {},
      create: {
        id: 'specialty-2',
        icon: 'TrendingUp',
        name: 'Planejamento Tributário',
        description: 'A sua empresa pode estar pagando mais impostos do que deveria. Por meio de um Planejamento Tributário é possível reduzir custos e aumentar o rendimento do seu negócio!',
        order: 2,
        is_active: true,
      },
    }),
    prisma.sectionSpecialty.upsert({
      where: { id: 'specialty-3' },
      update: {},
      create: {
        id: 'specialty-3',
        icon: 'ShoppingCart',
        name: 'Contabilidade E-Commerce',
        description: 'Especialização em contabilidade para empresas de e-commerce, com foco em compliance fiscal, tributação de vendas online e otimização tributária.',
        order: 3,
        is_active: true,
      },
    }),
  ]);
  console.log(`🎯 ${specialties.length} especialidades criadas`);

  // Fiscal Benefits
  const fiscalBenefits = await Promise.all([
    prisma.sectionFiscalBenefit.upsert({
      where: { id: 'benefit-1' },
      update: {},
      create: {
        id: 'benefit-1',
        icon: 'Award',
        name: 'Compete-ES',
        description: 'Programa de incentivo fiscal para empresas que investem no Espírito Santo.',
        order: 1,
        is_active: true,
      },
    }),
    prisma.sectionFiscalBenefit.upsert({
      where: { id: 'benefit-2' },
      update: {},
      create: {
        id: 'benefit-2',
        icon: 'ShoppingBag',
        name: 'Compete Atacadista',
        description: 'Incentivo fiscal específico para empresas do setor atacadista.',
        order: 2,
        is_active: true,
      },
    }),
    prisma.sectionFiscalBenefit.upsert({
      where: { id: 'benefit-3' },
      update: {},
      create: {
        id: 'benefit-3',
        icon: 'Package',
        name: 'Compete E-Commerce',
        description: 'Benefícios fiscais para empresas de comércio eletrônico.',
        order: 3,
        is_active: true,
      },
    }),
    prisma.sectionFiscalBenefit.upsert({
      where: { id: 'benefit-4' },
      update: {},
      create: {
        id: 'benefit-4',
        icon: 'Building2',
        name: 'Compete-Importação',
        description: 'Incentivos para empresas que realizam importações.',
        order: 4,
        is_active: true,
      },
    }),
  ]);
  console.log(`💰 ${fiscalBenefits.length} benefícios fiscais criados`);

  // Fun Facts
  const funFacts = await Promise.all([
    prisma.sectionFunFact.upsert({
      where: { id: 'funfact-1' },
      update: {},
      create: {
        id: 'funfact-1',
        icon: 'Users',
        label: 'Clientes Atendidos',
        value: '500',
        suffix: '+',
        order: 1,
        is_active: true,
      },
    }),
    prisma.sectionFunFact.upsert({
      where: { id: 'funfact-2' },
      update: {},
      create: {
        id: 'funfact-2',
        icon: 'Briefcase',
        label: 'Anos de Experiência',
        value: '34',
        suffix: '+',
        order: 2,
        is_active: true,
      },
    }),
    prisma.sectionFunFact.upsert({
      where: { id: 'funfact-3' },
      update: {},
      create: {
        id: 'funfact-3',
        icon: 'Coffee',
        label: 'Xícaras de Café',
        value: '10000',
        suffix: '+',
        order: 3,
        is_active: true,
      },
    }),
    prisma.sectionFunFact.upsert({
      where: { id: 'funfact-4' },
      update: {},
      create: {
        id: 'funfact-4',
        icon: 'Trophy',
        label: 'Prêmios Recebidos',
        value: '15',
        suffix: '+',
        order: 4,
        is_active: true,
      },
    }),
  ]);
  console.log(`📊 ${funFacts.length} fun facts criados`);

  // Certifications
  const certifications = await Promise.all([
    prisma.sectionCertification.upsert({
      where: { id: 'cert-1' },
      update: {},
      create: {
        id: 'cert-1',
        icon: 'Shield',
        name: 'Rede Nacional de Contabilidade',
        acronym: 'RNC',
        description: 'Associados à maior rede de contabilidade do Brasil',
        order: 1,
        is_active: true,
      },
    }),
    prisma.sectionCertification.upsert({
      where: { id: 'cert-2' },
      update: {},
      create: {
        id: 'cert-2',
        icon: 'Award',
        name: 'Grupo Master',
        acronym: 'GM',
        description: 'Integrantes do Grupo Master de Contabilidade Consultiva',
        order: 2,
        is_active: true,
      },
    }),
    prisma.sectionCertification.upsert({
      where: { id: 'cert-3' },
      update: {},
      create: {
        id: 'cert-3',
        icon: 'CheckCircle',
        name: 'ISO 9001',
        acronym: 'ISO',
        description: 'Padrões internacionais de qualidade em nossos processos',
        order: 3,
        is_active: true,
      },
    }),
  ]);
  console.log(`🏆 ${certifications.length} certificações criadas`);

  // Newsletter
  let newsletter = await prisma.sectionNewsletter.findFirst();
  if (!newsletter) {
    newsletter = await prisma.sectionNewsletter.create({
      data: {
        title: 'Fique por dentro das novidades',
        subtitle: 'Receba atualizações e dicas exclusivas',
        description: 'Inscreva-se em nossa newsletter e receba conteúdo exclusivo sobre contabilidade, gestão empresarial e novidades fiscais.',
        button_text: 'Inscrever-se',
      },
    });
    console.log('📧 Seção Newsletter criada');
  } else {
    console.log('📧 Seção Newsletter já existe');
  }
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });