import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function importarDados() {
  console.log('📥 Iniciando importação de dados na VPS...');

  const inputDir = path.join(__dirname, 'dados_exportados');

  // Verificar se o diretório existe
  try {
    await fs.access(inputDir);
  } catch (error) {
    console.error('❌ Diretório "dados_exportados" não encontrado!');
    console.error('   Certifique-se de que os arquivos foram enviados para a VPS.');
    process.exit(1);
  }

  let hasErrors = false;
  
  // Função auxiliar para importar com tratamento de erro individual
  const importWithErrorHandling = async (name, importFn) => {
    try {
      await importFn();
    } catch (error) {
      console.error(`❌ Erro ao importar ${name}:`, error.message);
      hasErrors = true;
    }
  };

  try {
    // Importar cada tabela
    console.log('📊 Importando tabelas...\n');

    // Configurações
    if (await fs.access(path.join(inputDir, 'configurations.json')).then(() => true).catch(() => false)) {
      const configurations = JSON.parse(await fs.readFile(path.join(inputDir, 'configurations.json'), 'utf-8'));
      for (const config of configurations) {
        await prisma.configuration.upsert({
          where: { id: config.id },
          update: config,
          create: config,
        });
      }
      console.log(`✅ Configurações: ${configurations.length} registros importados`);
    }

    // Slides
    if (await fs.access(path.join(inputDir, 'slides.json')).then(() => true).catch(() => false)) {
      const slides = JSON.parse(await fs.readFile(path.join(inputDir, 'slides.json'), 'utf-8'));
      for (const slide of slides) {
        await prisma.slide.upsert({
          where: { id: slide.id },
          update: slide,
          create: slide,
        });
      }
      console.log(`✅ Slides: ${slides.length} registros importados`);
    }

    // Serviços
    if (await fs.access(path.join(inputDir, 'services.json')).then(() => true).catch(() => false)) {
      const services = JSON.parse(await fs.readFile(path.join(inputDir, 'services.json'), 'utf-8'));
      for (const service of services) {
        await prisma.service.upsert({
          where: { id: service.id },
          update: service,
          create: service,
        });
      }
      console.log(`✅ Serviços: ${services.length} registros importados`);
    }

    // Depoimentos
    if (await fs.access(path.join(inputDir, 'testimonials.json')).then(() => true).catch(() => false)) {
      const testimonials = JSON.parse(await fs.readFile(path.join(inputDir, 'testimonials.json'), 'utf-8'));
      for (const testimonial of testimonials) {
        await prisma.testimonial.upsert({
          where: { id: testimonial.id },
          update: testimonial,
          create: testimonial,
        });
      }
      console.log(`✅ Depoimentos: ${testimonials.length} registros importados`);
    }

    // Categorias (antes dos posts do blog)
    if (await fs.access(path.join(inputDir, 'categories.json')).then(() => true).catch(() => false)) {
      const categories = JSON.parse(await fs.readFile(path.join(inputDir, 'categories.json'), 'utf-8'));
      for (const category of categories) {
        await prisma.category.upsert({
          where: { id: category.id },
          update: category,
          create: category,
        });
      }
      console.log(`✅ Categorias: ${categories.length} registros importados`);
    }

    // Tags (antes dos posts do blog)
    if (await fs.access(path.join(inputDir, 'tags.json')).then(() => true).catch(() => false)) {
      const tags = JSON.parse(await fs.readFile(path.join(inputDir, 'tags.json'), 'utf-8'));
      for (const tag of tags) {
        await prisma.tag.upsert({
          where: { id: tag.id },
          update: tag,
          create: tag,
        });
      }
      console.log(`✅ Tags: ${tags.length} registros importados`);
    }

    // Blog Posts
    if (await fs.access(path.join(inputDir, 'blogPosts.json')).then(() => true).catch(() => false)) {
      try {
        const blogPosts = JSON.parse(await fs.readFile(path.join(inputDir, 'blogPosts.json'), 'utf-8'));
        let imported = 0;
        let errors = 0;
        for (const post of blogPosts) {
          try {
            const { categories, tags, ...postData } = post;
            // Tentar atualizar primeiro, se não existir, criar
            const existing = await prisma.blogPost.findUnique({ where: { id: post.id } });
            if (existing) {
              await prisma.blogPost.update({
                where: { id: post.id },
                data: {
                  ...postData,
                  categories: {
                    set: categories?.map((c) => ({ id: c.id })) || [],
                  },
                  tags: {
                    set: tags?.map((t) => ({ id: t.id })) || [],
                  },
                },
              });
            } else {
              // Verificar se já existe por slug
              const existingBySlug = await prisma.blogPost.findUnique({ where: { slug: postData.slug } });
              if (existingBySlug) {
                // Atualizar o existente
                await prisma.blogPost.update({
                  where: { slug: postData.slug },
                  data: {
                    ...postData,
                    id: existingBySlug.id, // Manter o ID existente
                    categories: {
                      set: categories?.map((c) => ({ id: c.id })) || [],
                    },
                    tags: {
                      set: tags?.map((t) => ({ id: t.id })) || [],
                    },
                  },
                });
              } else {
                await prisma.blogPost.create({
                  data: {
                    ...postData,
                    categories: {
                      connect: categories?.map((c) => ({ id: c.id })) || [],
                    },
                    tags: {
                      connect: tags?.map((t) => ({ id: t.id })) || [],
                    },
                  },
                });
              }
            }
            imported++;
          } catch (error) {
            errors++;
            console.warn(`⚠️  Erro ao importar post ${post.id || post.slug}:`, error.message);
          }
        }
        console.log(`✅ Posts do Blog: ${imported} registros importados${errors > 0 ? `, ${errors} erros` : ''}`);
      } catch (error) {
        console.error('❌ Erro ao importar Posts do Blog:', error.message);
      }
    }

    // Hero
    if (await fs.access(path.join(inputDir, 'heroes.json')).then(() => true).catch(() => false)) {
      const heroes = JSON.parse(await fs.readFile(path.join(inputDir, 'heroes.json'), 'utf-8'));
      for (const hero of heroes) {
        await prisma.hero.upsert({
          where: { id: hero.id },
          update: hero,
          create: hero,
        });
      }
      console.log(`✅ Hero: ${heroes.length} registros importados`);
    }

    // Seções - SectionFeature
    if (await fs.access(path.join(inputDir, 'sectionFeatures.json')).then(() => true).catch(() => false)) {
      const sectionFeatures = JSON.parse(await fs.readFile(path.join(inputDir, 'sectionFeatures.json'), 'utf-8'));
      for (const feature of sectionFeatures) {
        await prisma.sectionFeature.upsert({
          where: { id: feature.id },
          update: feature,
          create: feature,
        });
      }
      console.log(`✅ Section Features: ${sectionFeatures.length} registros importados`);
    }

    // Seções - SectionAbout
    if (await fs.access(path.join(inputDir, 'sectionAbout.json')).then(() => true).catch(() => false)) {
      const sectionAbout = JSON.parse(await fs.readFile(path.join(inputDir, 'sectionAbout.json'), 'utf-8'));
      for (const about of sectionAbout) {
        const { images, ...aboutData } = about;
        await prisma.sectionAbout.upsert({
          where: { id: about.id },
          update: {
            ...aboutData,
            images: {
              deleteMany: {},
              create: images?.map((img) => ({
                id: img.id,
                image_url: img.image_url,
                description: img.description,
                order: img.order,
                is_active: img.is_active,
              })) || [],
            },
          },
          create: {
            ...aboutData,
            images: {
              create: images?.map((img) => ({
                id: img.id,
                image_url: img.image_url,
                description: img.description,
                order: img.order,
                is_active: img.is_active,
              })) || [],
            },
          },
        });
      }
      console.log(`✅ Section About: ${sectionAbout.length} registros importados`);
    }

    // Seções - SectionSpecialty
    if (await fs.access(path.join(inputDir, 'sectionSpecialties.json')).then(() => true).catch(() => false)) {
      const sectionSpecialties = JSON.parse(await fs.readFile(path.join(inputDir, 'sectionSpecialties.json'), 'utf-8'));
      for (const specialty of sectionSpecialties) {
        await prisma.sectionSpecialty.upsert({
          where: { id: specialty.id },
          update: specialty,
          create: specialty,
        });
      }
      console.log(`✅ Section Specialties: ${sectionSpecialties.length} registros importados`);
    }

    // Seções - SectionFiscalBenefit
    if (await fs.access(path.join(inputDir, 'sectionFiscalBenefits.json')).then(() => true).catch(() => false)) {
      const sectionFiscalBenefits = JSON.parse(await fs.readFile(path.join(inputDir, 'sectionFiscalBenefits.json'), 'utf-8'));
      for (const benefit of sectionFiscalBenefits) {
        await prisma.sectionFiscalBenefit.upsert({
          where: { id: benefit.id },
          update: benefit,
          create: benefit,
        });
      }
      console.log(`✅ Section Fiscal Benefits: ${sectionFiscalBenefits.length} registros importados`);
    }

    // Seções - SectionFunFact
    if (await fs.access(path.join(inputDir, 'sectionFunFacts.json')).then(() => true).catch(() => false)) {
      const sectionFunFacts = JSON.parse(await fs.readFile(path.join(inputDir, 'sectionFunFacts.json'), 'utf-8'));
      for (const funFact of sectionFunFacts) {
        await prisma.sectionFunFact.upsert({
          where: { id: funFact.id },
          update: funFact,
          create: funFact,
        });
      }
      console.log(`✅ Section Fun Facts: ${sectionFunFacts.length} registros importados`);
    }

    // Seções - SectionCertification
    if (await fs.access(path.join(inputDir, 'sectionCertifications.json')).then(() => true).catch(() => false)) {
      const sectionCertifications = JSON.parse(await fs.readFile(path.join(inputDir, 'sectionCertifications.json'), 'utf-8'));
      for (const cert of sectionCertifications) {
        await prisma.sectionCertification.upsert({
          where: { id: cert.id },
          update: cert,
          create: cert,
        });
      }
      console.log(`✅ Section Certifications: ${sectionCertifications.length} registros importados`);
    }

    // Seções - SectionNewsletter
    if (await fs.access(path.join(inputDir, 'sectionNewsletter.json')).then(() => true).catch(() => false)) {
      const sectionNewsletter = JSON.parse(await fs.readFile(path.join(inputDir, 'sectionNewsletter.json'), 'utf-8'));
      for (const newsletter of sectionNewsletter) {
        await prisma.sectionNewsletter.upsert({
          where: { id: newsletter.id },
          update: newsletter,
          create: newsletter,
        });
      }
      console.log(`✅ Section Newsletter: ${sectionNewsletter.length} registros importados`);
    }

    // Seções - SectionClients
    if (await fs.access(path.join(inputDir, 'sectionClients.json')).then(() => true).catch(() => false)) {
      const sectionClients = JSON.parse(await fs.readFile(path.join(inputDir, 'sectionClients.json'), 'utf-8'));
      for (const clientSection of sectionClients) {
        await prisma.sectionClients.upsert({
          where: { id: clientSection.id },
          update: clientSection,
          create: clientSection,
        });
      }
      console.log(`✅ Section Clients: ${sectionClients.length} registros importados`);
    }

    // Privacy Policy
    if (await fs.access(path.join(inputDir, 'privacyPolicy.json')).then(() => true).catch(() => false)) {
      const privacyPolicy = JSON.parse(await fs.readFile(path.join(inputDir, 'privacyPolicy.json'), 'utf-8'));
      for (const policy of privacyPolicy) {
        await prisma.privacyPolicy.upsert({
          where: { id: policy.id },
          update: policy,
          create: policy,
        });
      }
      console.log(`✅ Privacy Policy: ${privacyPolicy.length} registros importados`);
    }

    // Login Page
    if (await fs.access(path.join(inputDir, 'loginPage.json')).then(() => true).catch(() => false)) {
      const loginPage = JSON.parse(await fs.readFile(path.join(inputDir, 'loginPage.json'), 'utf-8'));
      for (const page of loginPage) {
        await prisma.loginPage.upsert({
          where: { id: page.id },
          update: page,
          create: page,
        });
      }
      console.log(`✅ Login Page: ${loginPage.length} registros importados`);
    }

    // Careers Page
    if (await fs.access(path.join(inputDir, 'careersPage.json')).then(() => true).catch(() => false)) {
      const careersPage = JSON.parse(await fs.readFile(path.join(inputDir, 'careersPage.json'), 'utf-8'));
      for (const page of careersPage) {
        await prisma.careersPage.upsert({
          where: { id: page.id },
          update: page,
          create: page,
        });
      }
      console.log(`✅ Careers Page: ${careersPage.length} registros importados`);
    }

    // Clientes
    await importWithErrorHandling('Clientes', async () => {
      if (await fs.access(path.join(inputDir, 'clients.json')).then(() => true).catch(() => false)) {
        const clients = JSON.parse(await fs.readFile(path.join(inputDir, 'clients.json'), 'utf-8'));
        let imported = 0;
        for (const client of clients) {
          try {
            await prisma.client.upsert({
              where: { id: client.id },
              update: client,
              create: client,
            });
            imported++;
          } catch (error) {
            console.warn(`⚠️  Erro ao importar cliente ${client.id}:`, error.message);
          }
        }
        console.log(`✅ Clientes: ${imported} registros importados`);
      }
    });

    // Newsletter Subscriptions
    if (await fs.access(path.join(inputDir, 'newsletterSubscriptions.json')).then(() => true).catch(() => false)) {
      const subscriptions = JSON.parse(await fs.readFile(path.join(inputDir, 'newsletterSubscriptions.json'), 'utf-8'));
      for (const subscription of subscriptions) {
        await prisma.newsletterSubscription.upsert({
          where: { id: subscription.id },
          update: subscription,
          create: subscription,
        });
      }
      console.log(`✅ Inscrições Newsletter: ${subscriptions.length} registros importados`);
    }

    // Contact Messages (opcional - pode não querer importar)
    if (await fs.access(path.join(inputDir, 'contactMessages.json')).then(() => true).catch(() => false)) {
      const contactMessages = JSON.parse(await fs.readFile(path.join(inputDir, 'contactMessages.json'), 'utf-8'));
      for (const message of contactMessages) {
        await prisma.contactMessage.upsert({
          where: { id: message.id },
          update: message,
          create: message,
        });
      }
      console.log(`✅ Mensagens de Contato: ${contactMessages.length} registros importados`);
    }

    // Job Positions (Áreas de Interesse) - ANTES de Job Applications
    if (await fs.access(path.join(inputDir, 'jobPositions.json')).then(() => true).catch(() => false)) {
      const jobPositions = JSON.parse(await fs.readFile(path.join(inputDir, 'jobPositions.json'), 'utf-8'));
      for (const position of jobPositions) {
        await prisma.jobPosition.upsert({
          where: { id: position.id },
          update: position,
          create: position,
        });
      }
      console.log(`✅ Áreas de Interesse: ${jobPositions.length} registros importados`);
    }

    // Job Applications (opcional) - DEPOIS de Job Positions
    if (await fs.access(path.join(inputDir, 'jobApplications.json')).then(() => true).catch(() => false)) {
      const jobApplications = JSON.parse(await fs.readFile(path.join(inputDir, 'jobApplications.json'), 'utf-8'));
      let importedCount = 0;
      let skippedCount = 0;
      
      for (const application of jobApplications) {
        try {
          // Se tiver position_id, verificar se a position existe
          if (application.position_id) {
            const positionExists = await prisma.jobPosition.findUnique({
              where: { id: application.position_id }
            });
            
            if (!positionExists) {
              console.log(`   ⚠️  Pulando candidatura ${application.id}: position_id ${application.position_id} não existe`);
              skippedCount++;
              continue;
            }
          }
          
          await prisma.jobApplication.upsert({
            where: { id: application.id },
            update: application,
            create: application,
          });
          importedCount++;
        } catch (error) {
          if (error.code === 'P2003') {
            console.log(`   ⚠️  Pulando candidatura ${application.id}: referência inválida (position_id: ${application.position_id})`);
            skippedCount++;
          } else {
            throw error;
          }
        }
      }
      console.log(`✅ Candidaturas: ${importedCount} importadas, ${skippedCount} puladas`);
    }

    // Access Logs (opcional - geralmente não precisa importar)
    // Comentado para não importar logs antigos
    // if (await fs.access(path.join(inputDir, 'accessLogs.json')).then(() => true).catch(() => false)) {
    //   const accessLogs = JSON.parse(await fs.readFile(path.join(inputDir, 'accessLogs.json'), 'utf-8'));
    //   for (const log of accessLogs) {
    //     await prisma.accessLog.upsert({
    //       where: { id: log.id },
    //       update: log,
    //       create: log,
    //     });
    //   }
    //   console.log(`✅ Logs de Acesso: ${accessLogs.length} registros importados`);
    // }

    // Section Fiscal Benefits Config
    await importWithErrorHandling('Config Fiscal Benefits', async () => {
      if (await fs.access(path.join(inputDir, 'sectionFiscalBenefitsConfig.json')).then(() => true).catch(() => false)) {
        const configs = JSON.parse(await fs.readFile(path.join(inputDir, 'sectionFiscalBenefitsConfig.json'), 'utf-8'));
        for (const config of configs) {
          await prisma.sectionFiscalBenefitsConfig.upsert({
            where: { id: config.id },
            update: config,
            create: config,
          });
        }
        console.log(`✅ Config Fiscal Benefits: ${configs.length} registros importados`);
      }
    });

    // Forms (Formulários Reutilizáveis) - ANTES de Landing Pages
    await importWithErrorHandling('Formulários', async () => {
      if (await fs.access(path.join(inputDir, 'forms.json')).then(() => true).catch(() => false)) {
        const forms = JSON.parse(await fs.readFile(path.join(inputDir, 'forms.json'), 'utf-8'));
        for (const form of forms) {
          const { fields, landing_pages, ...formData } = form;
          await prisma.form.upsert({
            where: { id: form.id },
            update: {
              ...formData,
              fields: {
                deleteMany: {},
                create: fields?.map((f) => ({
                  field_type: f.field_type,
                  field_name: f.field_name,
                  field_label: f.field_label,
                  placeholder: f.placeholder,
                  help_text: f.help_text,
                  is_required: f.is_required,
                  validation_rules: f.validation_rules,
                  options: f.options,
                  order: f.order,
                  is_active: f.is_active,
                })) || [],
              },
            },
            create: {
              ...formData,
              fields: {
                create: fields?.map((f) => ({
                  field_type: f.field_type,
                  field_name: f.field_name,
                  field_label: f.field_label,
                  placeholder: f.placeholder,
                  help_text: f.help_text,
                  is_required: f.is_required,
                  validation_rules: f.validation_rules,
                  options: f.options,
                  order: f.order,
                  is_active: f.is_active,
                })) || [],
              },
            },
          });
        }
        console.log(`✅ Formulários: ${forms.length} registros importados`);
      }
    });

    // Landing Pages - DEPOIS de Forms
    await importWithErrorHandling('Landing Pages', async () => {
      if (await fs.access(path.join(inputDir, 'landingPages.json')).then(() => true).catch(() => false)) {
        const landingPages = JSON.parse(await fs.readFile(path.join(inputDir, 'landingPages.json'), 'utf-8'));
        for (const page of landingPages) {
          const { form_fields, forms, ...pageData } = page;
          await prisma.landingPage.upsert({
            where: { id: page.id },
            update: {
              ...pageData,
              form_fields: {
                deleteMany: {},
                create: form_fields?.map((f) => ({
                  field_type: f.field_type,
                  field_name: f.field_name,
                  field_label: f.field_label,
                  placeholder: f.placeholder,
                  help_text: f.help_text,
                  is_required: f.is_required,
                  validation_rules: f.validation_rules,
                  options: f.options,
                  order: f.order,
                  is_active: f.is_active,
                })) || [],
              },
              forms: {
                set: forms?.map((f) => ({ id: f.id })) || [],
              },
            },
            create: {
              ...pageData,
              form_fields: {
                create: form_fields?.map((f) => ({
                  field_type: f.field_type,
                  field_name: f.field_name,
                  field_label: f.field_label,
                  placeholder: f.placeholder,
                  help_text: f.help_text,
                  is_required: f.is_required,
                  validation_rules: f.validation_rules,
                  options: f.options,
                  order: f.order,
                  is_active: f.is_active,
                })) || [],
              },
              forms: {
                connect: forms?.map((f) => ({ id: f.id })) || [],
              },
            },
          });
        }
        console.log(`✅ Landing Pages: ${landingPages.length} registros importados`);
      }
    });

    // Form Submissions (opcional - pode não querer importar)
    await importWithErrorHandling('Submissões de Formulário', async () => {
      if (await fs.access(path.join(inputDir, 'formSubmissions.json')).then(() => true).catch(() => false)) {
        const submissions = JSON.parse(await fs.readFile(path.join(inputDir, 'formSubmissions.json'), 'utf-8'));
        let imported = 0;
        let skipped = 0;
        for (const submission of submissions) {
          try {
            await prisma.formSubmission.upsert({
              where: { id: submission.id },
              update: submission,
              create: submission,
            });
            imported++;
          } catch (error) {
            skipped++;
            console.warn(`⚠️  Erro ao importar submissão ${submission.id}:`, error.message);
          }
        }
        console.log(`✅ Submissões de Formulário: ${imported} importadas, ${skipped} puladas`);
      }
    });

    console.log('\n✅ Importação concluída!');
    if (hasErrors) {
      console.log('⚠️  Alguns erros ocorreram durante a importação, mas o processo continuou.');
    }
    console.log('\n📝 Próximos passos:');
    console.log('1. Verifique os dados no site');
    console.log('2. Teste as funcionalidades');

  } catch (error) {
    console.error('❌ Erro crítico ao importar dados:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

importarDados();

