import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function exportarDados() {
  console.log('📦 Iniciando exportação de dados do banco local...');

  const outputDir = path.join(__dirname, 'dados_exportados');
  
  // Criar diretório de saída
  try {
    await fs.mkdir(outputDir, { recursive: true });
  } catch (error) {
    // Diretório já existe
  }

  try {
    // Exportar cada tabela
    console.log('📊 Exportando tabelas...');

    // Configurações
    const configurations = await prisma.configuration.findMany();
    await fs.writeFile(
      path.join(outputDir, 'configurations.json'),
      JSON.stringify(configurations, null, 2)
    );
    console.log(`✅ Configurações: ${configurations.length} registros`);

    // Slides
    const slides = await prisma.slide.findMany();
    await fs.writeFile(
      path.join(outputDir, 'slides.json'),
      JSON.stringify(slides, null, 2)
    );
    console.log(`✅ Slides: ${slides.length} registros`);

    // Serviços
    const services = await prisma.service.findMany();
    await fs.writeFile(
      path.join(outputDir, 'services.json'),
      JSON.stringify(services, null, 2)
    );
    console.log(`✅ Serviços: ${services.length} registros`);

    // Depoimentos
    const testimonials = await prisma.testimonial.findMany();
    await fs.writeFile(
      path.join(outputDir, 'testimonials.json'),
      JSON.stringify(testimonials, null, 2)
    );
    console.log(`✅ Depoimentos: ${testimonials.length} registros`);

    // Blog Posts
    const blogPosts = await prisma.blogPost.findMany({
      include: {
        categories: true,
        tags: true,
      },
    });
    await fs.writeFile(
      path.join(outputDir, 'blogPosts.json'),
      JSON.stringify(blogPosts, null, 2)
    );
    console.log(`✅ Posts do Blog: ${blogPosts.length} registros`);

    // Categorias
    const categories = await prisma.category.findMany();
    await fs.writeFile(
      path.join(outputDir, 'categories.json'),
      JSON.stringify(categories, null, 2)
    );
    console.log(`✅ Categorias: ${categories.length} registros`);

    // Tags
    const tags = await prisma.tag.findMany();
    await fs.writeFile(
      path.join(outputDir, 'tags.json'),
      JSON.stringify(tags, null, 2)
    );
    console.log(`✅ Tags: ${tags.length} registros`);

    // Hero
    const heroes = await prisma.hero.findMany();
    await fs.writeFile(
      path.join(outputDir, 'heroes.json'),
      JSON.stringify(heroes, null, 2)
    );
    console.log(`✅ Hero: ${heroes.length} registros`);

    // Seções - SectionFeature
    const sectionFeatures = await prisma.sectionFeature.findMany();
    await fs.writeFile(
      path.join(outputDir, 'sectionFeatures.json'),
      JSON.stringify(sectionFeatures, null, 2)
    );
    console.log(`✅ Section Features: ${sectionFeatures.length} registros`);

    // Seções - SectionAbout
    const sectionAbout = await prisma.sectionAbout.findMany({
      include: { images: true },
    });
    await fs.writeFile(
      path.join(outputDir, 'sectionAbout.json'),
      JSON.stringify(sectionAbout, null, 2)
    );
    console.log(`✅ Section About: ${sectionAbout.length} registros`);

    // Seções - SectionSpecialty
    const sectionSpecialties = await prisma.sectionSpecialty.findMany();
    await fs.writeFile(
      path.join(outputDir, 'sectionSpecialties.json'),
      JSON.stringify(sectionSpecialties, null, 2)
    );
    console.log(`✅ Section Specialties: ${sectionSpecialties.length} registros`);

    // Seções - SectionFiscalBenefit
    const sectionFiscalBenefits = await prisma.sectionFiscalBenefit.findMany();
    await fs.writeFile(
      path.join(outputDir, 'sectionFiscalBenefits.json'),
      JSON.stringify(sectionFiscalBenefits, null, 2)
    );
    console.log(`✅ Section Fiscal Benefits: ${sectionFiscalBenefits.length} registros`);

    // Seções - SectionFunFact
    const sectionFunFacts = await prisma.sectionFunFact.findMany();
    await fs.writeFile(
      path.join(outputDir, 'sectionFunFacts.json'),
      JSON.stringify(sectionFunFacts, null, 2)
    );
    console.log(`✅ Section Fun Facts: ${sectionFunFacts.length} registros`);

    // Seções - SectionCertification
    const sectionCertifications = await prisma.sectionCertification.findMany();
    await fs.writeFile(
      path.join(outputDir, 'sectionCertifications.json'),
      JSON.stringify(sectionCertifications, null, 2)
    );
    console.log(`✅ Section Certifications: ${sectionCertifications.length} registros`);

    // Seções - SectionNewsletter
    const sectionNewsletter = await prisma.sectionNewsletter.findMany();
    await fs.writeFile(
      path.join(outputDir, 'sectionNewsletter.json'),
      JSON.stringify(sectionNewsletter, null, 2)
    );
    console.log(`✅ Section Newsletter: ${sectionNewsletter.length} registros`);

    // Seções - SectionClients
    const sectionClients = await prisma.sectionClients.findMany();
    await fs.writeFile(
      path.join(outputDir, 'sectionClients.json'),
      JSON.stringify(sectionClients, null, 2)
    );
    console.log(`✅ Section Clients: ${sectionClients.length} registros`);

    // Privacy Policy
    const privacyPolicy = await prisma.privacyPolicy.findMany();
    await fs.writeFile(
      path.join(outputDir, 'privacyPolicy.json'),
      JSON.stringify(privacyPolicy, null, 2)
    );
    console.log(`✅ Privacy Policy: ${privacyPolicy.length} registros`);

    // Login Page
    const loginPage = await prisma.loginPage.findMany();
    await fs.writeFile(
      path.join(outputDir, 'loginPage.json'),
      JSON.stringify(loginPage, null, 2)
    );
    console.log(`✅ Login Page: ${loginPage.length} registros`);

    // Careers Page
    const careersPage = await prisma.careersPage.findMany();
    await fs.writeFile(
      path.join(outputDir, 'careersPage.json'),
      JSON.stringify(careersPage, null, 2)
    );
    console.log(`✅ Careers Page: ${careersPage.length} registros`);

    // Clientes
    const clients = await prisma.client.findMany();
    await fs.writeFile(
      path.join(outputDir, 'clients.json'),
      JSON.stringify(clients, null, 2)
    );
    console.log(`✅ Clientes: ${clients.length} registros`);

    // Newsletter Subscriptions
    const subscriptions = await prisma.newsletterSubscription.findMany();
    await fs.writeFile(
      path.join(outputDir, 'newsletterSubscriptions.json'),
      JSON.stringify(subscriptions, null, 2)
    );
    console.log(`✅ Inscrições Newsletter: ${subscriptions.length} registros`);

    // Contact Messages
    const contactMessages = await prisma.contactMessage.findMany();
    await fs.writeFile(
      path.join(outputDir, 'contactMessages.json'),
      JSON.stringify(contactMessages, null, 2)
    );
    console.log(`✅ Mensagens de Contato: ${contactMessages.length} registros`);

    // Job Positions (Áreas de Interesse) - ANTES de Job Applications
    const jobPositions = await prisma.jobPosition.findMany();
    await fs.writeFile(
      path.join(outputDir, 'jobPositions.json'),
      JSON.stringify(jobPositions, null, 2)
    );
    console.log(`✅ Áreas de Interesse: ${jobPositions.length} registros`);

    // Job Applications
    const jobApplications = await prisma.jobApplication.findMany();
    await fs.writeFile(
      path.join(outputDir, 'jobApplications.json'),
      JSON.stringify(jobApplications, null, 2)
    );
    console.log(`✅ Candidaturas: ${jobApplications.length} registros`);

    // Access Logs
    const accessLogs = await prisma.accessLog.findMany();
    await fs.writeFile(
      path.join(outputDir, 'accessLogs.json'),
      JSON.stringify(accessLogs, null, 2)
    );
    console.log(`✅ Logs de Acesso: ${accessLogs.length} registros`);

    // Landing Pages
    const landingPages = await prisma.landingPage.findMany({
      include: {
        form_fields: true,
        forms: true,
      },
    });
    await fs.writeFile(
      path.join(outputDir, 'landingPages.json'),
      JSON.stringify(landingPages, null, 2)
    );
    console.log(`✅ Landing Pages: ${landingPages.length} registros`);

    // Forms (Formulários Reutilizáveis)
    const forms = await prisma.form.findMany({
      include: {
        fields: true,
      },
    });
    await fs.writeFile(
      path.join(outputDir, 'forms.json'),
      JSON.stringify(forms, null, 2)
    );
    console.log(`✅ Formulários: ${forms.length} registros`);

    // Form Submissions (opcional - pode não querer exportar)
    const formSubmissions = await prisma.formSubmission.findMany();
    await fs.writeFile(
      path.join(outputDir, 'formSubmissions.json'),
      JSON.stringify(formSubmissions, null, 2)
    );
    console.log(`✅ Submissões de Formulário: ${formSubmissions.length} registros`);

    // Section Fiscal Benefits Config
    const sectionFiscalBenefitsConfig = await prisma.sectionFiscalBenefitsConfig.findMany();
    await fs.writeFile(
      path.join(outputDir, 'sectionFiscalBenefitsConfig.json'),
      JSON.stringify(sectionFiscalBenefitsConfig, null, 2)
    );
    console.log(`✅ Config Fiscal Benefits: ${sectionFiscalBenefitsConfig.length} registros`);

    console.log('\n✅ Exportação concluída!');
    console.log(`📁 Arquivos salvos em: ${outputDir}`);
    console.log('\n📝 Próximos passos:');
    console.log('1. Envie a pasta "dados_exportados" para a VPS');
    console.log('2. Execute o script de importação na VPS');

  } catch (error) {
    console.error('❌ Erro ao exportar dados:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

exportarDados();

