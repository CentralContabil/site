import { useEffect } from 'react';
import { useConfiguration } from '../hooks/useConfiguration';

export const ScriptsInjector: React.FC = () => {
  const { configuration } = useConfiguration();

  useEffect(() => {
    if (!configuration) return;

    // Injetar scripts no <head>
    if (configuration.head_scripts || configuration.headScripts) {
      const headScripts = configuration.head_scripts || configuration.headScripts || '';
      
      // Verificar se já existe um container para scripts do head
      let headContainer = document.getElementById('custom-head-scripts');
      
      if (!headContainer) {
        headContainer = document.createElement('div');
        headContainer.id = 'custom-head-scripts';
        document.head.appendChild(headContainer);
      } else {
        // Limpar scripts antigos
        headContainer.innerHTML = '';
      }

      // Inserir novos scripts
      headContainer.innerHTML = headScripts;

      // Executar scripts que foram inseridos
      const scripts = headContainer.querySelectorAll('script');
      scripts.forEach((oldScript) => {
        const newScript = document.createElement('script');
        
        // Copiar atributos
        Array.from(oldScript.attributes).forEach((attr) => {
          newScript.setAttribute(attr.name, attr.value);
        });
        
        // Copiar conteúdo se houver
        if (oldScript.textContent) {
          newScript.textContent = oldScript.textContent;
        }
        
        // Substituir o script antigo pelo novo
        oldScript.parentNode?.replaceChild(newScript, oldScript);
      });
    }

    // Injetar scripts antes do </body>
    if (configuration.body_scripts || configuration.bodyScripts) {
      const bodyScripts = configuration.body_scripts || configuration.bodyScripts || '';
      
      // Verificar se já existe um container para scripts do body
      let bodyContainer = document.getElementById('custom-body-scripts');
      
      if (!bodyContainer) {
        bodyContainer = document.createElement('div');
        bodyContainer.id = 'custom-body-scripts';
        document.body.appendChild(bodyContainer);
      } else {
        // Limpar scripts antigos
        bodyContainer.innerHTML = '';
      }

      // Inserir novos scripts
      bodyContainer.innerHTML = bodyScripts;

      // Executar scripts que foram inseridos
      const scripts = bodyContainer.querySelectorAll('script');
      scripts.forEach((oldScript) => {
        const newScript = document.createElement('script');
        
        // Copiar atributos
        Array.from(oldScript.attributes).forEach((attr) => {
          newScript.setAttribute(attr.name, attr.value);
        });
        
        // Copiar conteúdo se houver
        if (oldScript.textContent) {
          newScript.textContent = oldScript.textContent;
        }
        
        // Substituir o script antigo pelo novo
        oldScript.parentNode?.replaceChild(newScript, oldScript);
      });
    }

    // Cleanup function
    return () => {
      // Não remover os containers, apenas limpar se necessário
      // Os scripts serão atualizados na próxima renderização
    };
  }, [configuration]);

  return null;
};




