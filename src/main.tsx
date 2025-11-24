import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { ErrorBoundary } from './components/ErrorBoundary'

console.log('🚀 Inicializando aplicação...');

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('❌ Root element not found');
  throw new Error('Root element not found');
}

console.log('✓ Root element encontrado');

try {
  console.log('✓ Criando root do React...');
  const root = createRoot(rootElement);
  console.log('✓ Renderizando App...');
  
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
  
  console.log('✓ Aplicação renderizada com sucesso!');
} catch (error) {
  console.error('❌ Erro ao renderizar a aplicação:', error);
  const errorMessage = error instanceof Error ? error.toString() : String(error);
  rootElement.innerHTML = `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; background: #f9fafb;">
      <div style="max-width: 500px; width: 100%; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); padding: 24px;">
        <h1 style="font-size: 24px; font-weight: bold; color: #dc2626; margin-bottom: 16px;">
          Erro ao carregar a aplicação
        </h1>
        <p style="color: #374151; margin-bottom: 16px;">
          Ocorreu um erro ao inicializar a aplicação. Por favor, verifique o console do navegador para mais detalhes.
        </p>
        <pre style="background: #f3f4f6; padding: 12px; border-radius: 4px; overflow: auto; font-size: 12px; color: #1f2937;">
          ${errorMessage}
        </pre>
        <button 
          onclick="window.location.reload()" 
          style="margin-top: 16px; width: 100%; background: #3bb664; color: white; padding: 12px; border: none; border-radius: 4px; cursor: pointer; font-weight: 500;"
        >
          Recarregar Página
        </button>
      </div>
    </div>
  `;
}
