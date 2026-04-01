// main.js - Ponto de entrada no diretório raiz
// Este arquivo redireciona para site/main.js onde estão as dependências
import('./site/main.js').catch(error => {
  console.error('❌ Erro ao carregar site/main.js:');
  console.error(error);
  process.exit(1);
});



