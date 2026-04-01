// main.js - Ponto de entrada para aplicação Node.js na KingHost
// ⚠️ RECOMENDADO: Configure o painel para usar "tsx api/server.ts" diretamente
// Se o painel não permitir, compile o TypeScript primeiro (veja instruções abaixo)

// Carregar variáveis de ambiente
import dotenv from 'dotenv';
dotenv.config();

// Importar e iniciar o servidor compilado
// Os arquivos TypeScript foram compilados para JavaScript em api/dist/
try {
  await import('./api/dist/server.js');
} catch (error) {
  console.error('❌ Erro ao iniciar o servidor:');
  console.error(error);
  console.error('');
  console.error('💡 Verifique se o TypeScript foi compilado:');
  console.error('   npx tsc');
  console.error('');
  console.error('💡 OU configure o painel para usar tsx diretamente:');
  console.error('   Script: tsx api/server.ts');
  process.exit(1);
}

