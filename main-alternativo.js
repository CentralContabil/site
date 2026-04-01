// main-alternativo.js - Versão alternativa que compila TypeScript primeiro
// Use esta versão se o import direto de .ts não funcionar

import dotenv from 'dotenv';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

dotenv.config();

// Verificar se o arquivo compilado existe
const compiledPath = join(process.cwd(), 'api', 'dist', 'server.js');

if (!existsSync(compiledPath)) {
  console.log('📦 Compilando TypeScript...');
  try {
    // Compilar TypeScript
    execSync('npx tsc api/server.ts --outDir api/dist --module esnext --target es2020 --moduleResolution node --esModuleInterop', {
      stdio: 'inherit'
    });
    console.log('✅ TypeScript compilado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao compilar TypeScript:', error);
    process.exit(1);
  }
}

// Importar o arquivo JavaScript compilado
try {
  await import('./api/dist/server.js');
} catch (error) {
  console.error('❌ Erro ao iniciar o servidor:');
  console.error(error);
  process.exit(1);
}



