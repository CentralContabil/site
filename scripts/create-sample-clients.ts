import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleClients = [
  {
    name: 'TechSolutions ES',
    logo_url: null,
    website_url: 'https://techsolutions.com.br',
    facebook_url: null,
    instagram_url: 'https://instagram.com/techsolutions',
    linkedin_url: 'https://linkedin.com/company/techsolutions',
    twitter_url: null,
    order: 1,
    is_active: true,
  },
  {
    name: 'Indústria Vitória',
    logo_url: null,
    website_url: 'https://industriavitoria.com.br',
    facebook_url: 'https://facebook.com/industriavitoria',
    instagram_url: null,
    linkedin_url: 'https://linkedin.com/company/industriavitoria',
    twitter_url: null,
    order: 2,
    is_active: true,
  },
  {
    name: 'Comércio Serra',
    logo_url: null,
    website_url: null,
    facebook_url: 'https://facebook.com/comercioserra',
    instagram_url: 'https://instagram.com/comercioserra',
    linkedin_url: null,
    twitter_url: null,
    order: 3,
    is_active: true,
  },
  {
    name: 'Construções Capixabas',
    logo_url: null,
    website_url: 'https://construcoescapixabas.com.br',
    facebook_url: null,
    instagram_url: 'https://instagram.com/construcoescapixabas',
    linkedin_url: 'https://linkedin.com/company/construcoescapixabas',
    twitter_url: null,
    order: 4,
    is_active: true,
  },
  {
    name: 'Agronegócio ES',
    logo_url: null,
    website_url: 'https://agronegocioes.com.br',
    facebook_url: 'https://facebook.com/agronegocioes',
    instagram_url: null,
    linkedin_url: 'https://linkedin.com/company/agronegocioes',
    twitter_url: null,
    order: 5,
    is_active: true,
  },
  {
    name: 'Serviços Vila Velha',
    logo_url: null,
    website_url: null,
    facebook_url: null,
    instagram_url: 'https://instagram.com/servicosvilavelha',
    linkedin_url: 'https://linkedin.com/company/servicosvilavelha',
    twitter_url: null,
    order: 6,
    is_active: true,
  },
  {
    name: 'Logística Espírito Santo',
    logo_url: null,
    website_url: 'https://logisticaes.com.br',
    facebook_url: null,
    instagram_url: null,
    linkedin_url: 'https://linkedin.com/company/logisticaes',
    twitter_url: null,
    order: 7,
    is_active: true,
  },
  {
    name: 'Turismo Capixaba',
    logo_url: null,
    website_url: 'https://turismocapixaba.com.br',
    facebook_url: 'https://facebook.com/turismocapixaba',
    instagram_url: 'https://instagram.com/turismocapixaba',
    linkedin_url: null,
    twitter_url: null,
    order: 8,
    is_active: true,
  },
];

async function main() {
  console.log('Criando clientes fictícios...');

  for (const client of sampleClients) {
    try {
      // Verificar se já existe
      const existing = await prisma.client.findFirst({
        where: { name: client.name },
      });

      if (existing) {
        console.log(`Cliente "${client.name}" já existe, pulando...`);
        continue;
      }

      await prisma.client.create({
        data: client,
      });
      console.log(`✅ Cliente "${client.name}" criado com sucesso!`);
    } catch (error) {
      console.error(`❌ Erro ao criar cliente "${client.name}":`, error);
    }
  }

  console.log('\n✅ Processo concluído!');
}

main()
  .catch((e) => {
    console.error('Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


