// Script para importar apenas os dados do Hero
// Execute: node importar-hero-vps.js

import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function importarHero() {
  console.log('Importando dados do Hero...');

  const inputDir = path.join(__dirname, 'dados_exportados');
  const filePath = path.join(inputDir, 'heroes.json');

  try {
    // Verificar se o arquivo existe
    await fs.access(filePath);
    
    const heroes = JSON.parse(await fs.readFile(filePath, 'utf-8'));
    
    if (heroes.length === 0) {
      console.log('Nenhum registro de Hero encontrado no arquivo');
      return;
    }

    // Importar cada registro
    for (const hero of heroes) {
      await prisma.hero.upsert({
        where: { id: hero.id },
        update: {
          badge_text: hero.badge_text,
          title_line1: hero.title_line1,
          title_line2: hero.title_line2,
          description: hero.description,
          background_image_url: hero.background_image_url,
          hero_image_url: hero.hero_image_url,
          button1_text: hero.button1_text,
          button1_link: hero.button1_link,
          button2_text: hero.button2_text,
          button2_link: hero.button2_link,
          stat_years: hero.stat_years,
          stat_clients: hero.stat_clients,
          stat_network: hero.stat_network,
          indicator1_title: hero.indicator1_title,
          indicator1_value: hero.indicator1_value,
          indicator2_title: hero.indicator2_title,
          indicator2_value: hero.indicator2_value,
          indicator3_title: hero.indicator3_title,
          indicator3_value: hero.indicator3_value,
        },
        create: {
          id: hero.id,
          badge_text: hero.badge_text,
          title_line1: hero.title_line1,
          title_line2: hero.title_line2,
          description: hero.description,
          background_image_url: hero.background_image_url,
          hero_image_url: hero.hero_image_url,
          button1_text: hero.button1_text,
          button1_link: hero.button1_link,
          button2_text: hero.button2_text,
          button2_link: hero.button2_link,
          stat_years: hero.stat_years,
          stat_clients: hero.stat_clients,
          stat_network: hero.stat_network,
          indicator1_title: hero.indicator1_title,
          indicator1_value: hero.indicator1_value,
          indicator2_title: hero.indicator2_title,
          indicator2_value: hero.indicator2_value,
          indicator3_title: hero.indicator3_title,
          indicator3_value: hero.indicator3_value,
        },
      });
    }

    console.log(`✅ Hero: ${heroes.length} registro(s) importado(s)`);
    console.log('');
    console.log('Dados importados com sucesso!');
    console.log('Reinicie a aplicacao: pm2 restart central-rnc');

  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error('❌ Arquivo heroes.json não encontrado!');
      console.error('   Execute no Windows: node exportar-dados-local.js');
      console.error('   E envie: scp dados_exportados/heroes.json root@72.60.155.69:/root/app/dados_exportados/');
    } else {
      console.error('❌ Erro ao importar Hero:', error);
    }
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

importarHero();


