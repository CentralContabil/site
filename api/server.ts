/**
 * local server entry file, for local development
 */
import app from './app.js';

/**
 * start server with port
 * Na KingHost, a porta é fornecida automaticamente como process.env.PORT_nome-do-script
 * Exemplo: se o script for "start.sh", use process.env.PORT_START
 * Se o script for "site", use process.env.PORT_SITE
 * Fallback para desenvolvimento local: process.env.PORT || 3006
 */
const PORT = process.env.PORT_START || process.env.PORT_SITE || process.env.PORT || 3006;

// Log para debug - mostrar todas as variáveis de porta disponíveis
console.log('🔍 Variáveis de porta disponíveis:');
console.log(`   PORT_START: ${process.env.PORT_START || 'não definido'}`);
console.log(`   PORT_SITE: ${process.env.PORT_SITE || 'não definido'}`);
console.log(`   PORT: ${process.env.PORT || 'não definido'}`);
console.log(`   Porta escolhida: ${PORT}`);

const server = app.listen(PORT, () => {
  console.log(`✅ Server ready on port ${PORT}`);
});

/**
 * close server
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;