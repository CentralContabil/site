import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    hcaptcha: {
      render: (element: HTMLElement, options: { sitekey: string; callback?: (token: string) => void; 'error-callback'?: () => void; 'expired-callback'?: () => void; theme?: string; size?: string }) => string;
      reset: (widgetId: string) => void;
      getResponse: (widgetId: string) => string;
      execute: (widgetId: string) => void;
    };
  }
}

interface ReCaptchaProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  theme?: 'light' | 'dark';
  size?: 'normal' | 'compact';
}

export const ReCaptcha: React.FC<ReCaptchaProps> = ({ 
  siteKey, 
  onVerify, 
  onExpire,
  theme = 'light',
  size = 'normal'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!containerRef.current) return;

    let mounted = true;
    let timeoutId: NodeJS.Timeout;
    let checkInterval: NodeJS.Timeout;

    // Verificar se o script existe, se não, adicionar
    const ensureScript = () => {
      const existingScript = document.querySelector('script[src*="hcaptcha"]');
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = 'https://js.hcaptcha.com/1/api.js';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          console.log('Script hCaptcha carregado');
        };
        script.onerror = () => {
          console.error('Erro ao carregar script hCaptcha');
          if (mounted) {
            setError('Erro ao carregar verificação. Verifique sua conexão.');
            setIsLoading(false);
          }
        };
        document.head.appendChild(script);
      }
    };

    ensureScript();

    const loadCaptcha = () => {
      // Verificar se hcaptcha já está disponível
      if (window.hcaptcha && typeof window.hcaptcha.render === 'function') {
        if (!mounted || !containerRef.current || widgetIdRef.current !== null) return;
        
        try {
          console.log('Renderizando hCaptcha com siteKey:', siteKey);
          widgetIdRef.current = window.hcaptcha.render(containerRef.current, {
            sitekey: siteKey,
            callback: (token: string) => {
              console.log('hCaptcha verificado, token recebido');
              if (mounted) {
                onVerify(token);
                setIsLoading(false);
                setError('');
              }
            },
            'error-callback': () => {
              console.log('hCaptcha erro');
              if (mounted) {
                setError('Erro na verificação. Tente novamente.');
                setIsLoading(false);
              }
            },
            'expired-callback': () => {
              console.log('hCaptcha expirado');
              if (mounted) {
                if (onExpire) {
                  onExpire();
                }
                setIsLoading(true);
              }
            },
            theme: theme,
            size: size,
          });
          (window as any).captchaWidgetId = widgetIdRef.current;
          console.log('hCaptcha renderizado com sucesso, widgetId:', widgetIdRef.current);
          setIsLoading(false);
          setError('');
        } catch (err) {
          console.error('Erro ao renderizar hCaptcha:', err);
          if (mounted) {
            setError('Erro ao carregar verificação. Tente recarregar a página.');
            setIsLoading(false);
          }
        }
      } else {
        console.log('Aguardando hcaptcha carregar...');
        // Aguardar o script carregar
        checkInterval = setInterval(() => {
          if (window.hcaptcha && typeof window.hcaptcha.render === 'function') {
            console.log('hcaptcha carregado, renderizando...');
            if (checkInterval) clearInterval(checkInterval);
            if (timeoutId) clearTimeout(timeoutId);
            loadCaptcha();
          }
        }, 100);

        // Timeout após 10 segundos
        timeoutId = setTimeout(() => {
          if (checkInterval) clearInterval(checkInterval);
          if (mounted && (!window.hcaptcha || typeof window.hcaptcha.render !== 'function')) {
            console.error('Timeout: hcaptcha não carregou');
            setError('Timeout ao carregar verificação. Verifique sua conexão e recarregue a página.');
            setIsLoading(false);
          }
        }, 10000);
      }
    };

    // Aguardar um pouco para garantir que o DOM está pronto
    const initTimeout = setTimeout(() => {
      loadCaptcha();
    }, 100);

    return () => {
      mounted = false;
      clearTimeout(initTimeout);
      if (timeoutId) clearTimeout(timeoutId);
      if (checkInterval) clearInterval(checkInterval);
      if (widgetIdRef.current !== null && containerRef.current) {
        try {
          containerRef.current.innerHTML = '';
        } catch (e) {
          // Ignorar erros ao limpar
        }
        widgetIdRef.current = null;
        (window as any).captchaWidgetId = undefined;
      }
    };
  }, [siteKey, onVerify, onExpire, theme, size]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-4 border border-red-300 bg-red-50">
        <p className="text-red-600 text-sm text-center mb-2">{error}</p>
        <button
          onClick={() => {
            setError('');
            setIsLoading(true);
            window.location.reload();
          }}
          className="text-red-600 hover:text-red-800 text-sm underline"
        >
          Recarregar página
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div ref={containerRef} className="min-h-[78px] flex items-center justify-center">
        {isLoading && (
          <div className="text-gray-500 text-sm">Carregando verificação...</div>
        )}
      </div>
    </div>
  );
};

