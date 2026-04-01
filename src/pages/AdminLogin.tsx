import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'sonner';
import { useConfiguration } from '@/hooks/useConfiguration';
import { apiService } from '@/services/api';
import { LoginPage } from '@/types';
import * as LucideIcons from 'lucide-react';

// Cor verde padrão do site
const PRIMARY_COLOR = '#3bb664';
const PRIMARY_COLOR_HOVER = '#2d9a4f';

type LoginStep = 'email' | 'code';

export default function AdminLogin() {
  const [step, setStep] = useState<LoginStep>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginPage, setLoginPage] = useState<LoginPage | null>(null);
  const [loadingLoginPage, setLoadingLoginPage] = useState(true);
  const navigate = useNavigate();
  const { configuration } = useConfiguration();

  // Carrega email salvo se existir
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberEmail');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  // Carrega dados da página de login
  useEffect(() => {
    const loadLoginPage = async () => {
      try {
        setLoadingLoginPage(true);
        const response = await apiService.getLoginPage();
        setLoginPage(response.loginPage);
      } catch (error) {
        console.error('Erro ao carregar dados da página de login:', error);
      } finally {
        setLoadingLoginPage(false);
      }
    };
    loadLoginPage();
  }, []);

  // Função para enviar código
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = email.trim().toLowerCase();
    
    if (!trimmedEmail) {
      toast.error('Por favor, informe seu email.');
      return;
    }

    if (!emailRegex.test(trimmedEmail)) {
      toast.error('Por favor, informe um email válido.');
      return;
    }

    setIsLoading(true);

    try {
      // Em desenvolvimento, usar o proxy do Vite (/api)
      // Em produção, usar a variável de ambiente ou fallback
      const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
      const url = `${API_BASE_URL}/auth/send-code`;
      
      console.log('📧 Enviando código para:', trimmedEmail);
      console.log('📧 URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: trimmedEmail, 
          type: 'email' 
        }),
      });

      console.log('📧 Status da resposta:', response.status);
      console.log('📧 Status OK:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro na resposta:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || 'Erro ao enviar código' };
        }
        toast.error(errorData.error || errorData.message || 'Erro ao enviar código.');
        return;
      }

      const data = await response.json();
      
      console.log('📧 Resposta do servidor:', data);

      if (data.success === true) {
        toast.success('Código enviado! Verifique seu email (incluindo a pasta de spam).');
        setStep('code'); // Muda para a tela de código
        setCode(''); // Limpa o campo de código
      } else {
        toast.error(data.error || data.message || 'Erro ao enviar código.');
      }
    } catch (error: any) {
      console.error('❌ Erro ao enviar código:', error);
      console.error('❌ Tipo do erro:', error?.constructor?.name);
      console.error('❌ Mensagem:', error?.message);
      
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        toast.error('Erro de conexão. Verifique se o servidor está rodando.');
      } else {
        toast.error('Erro ao enviar código. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Função para verificar código
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação do código
    const trimmedCode = code.trim();
    
    if (!trimmedCode || trimmedCode.length !== 6) {
      toast.error('O código deve conter 6 dígitos.');
      return;
    }

    if (!/^\d{6}$/.test(trimmedCode)) {
      toast.error('O código deve conter apenas números.');
      return;
    }

    setIsLoading(true);

    try {
      // Em desenvolvimento, usar o proxy do Vite (/api)
      // Em produção, usar a variável de ambiente ou fallback
      const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
      const url = `${API_BASE_URL}/auth/verify-code`;
      
      console.log('🔐 Verificando código para:', email.trim().toLowerCase());

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(), 
          code: trimmedCode 
        }),
      });

      console.log('🔐 Status da resposta:', response.status);
      console.log('🔐 Status OK:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro na resposta:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || 'Erro ao verificar código' };
        }
        toast.error(errorData.error || errorData.message || 'Código inválido ou expirado.');
        return;
      }

      const data = await response.json();
      
      console.log('🔐 Resposta da verificação:', data);

      if (data.success === true && data.token) {
        // Salva token e dados do usuário
        localStorage.setItem('token', data.token);
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user || { email }));
        localStorage.setItem('rememberEmail', email.trim().toLowerCase());
        
        toast.success('Login realizado com sucesso!');
        
        // Redireciona
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 500);
      } else {
        toast.error(data.error || data.message || 'Código inválido ou expirado.');
      }
    } catch (error: any) {
      console.error('❌ Erro ao verificar código:', error);
      console.error('❌ Tipo do erro:', error?.constructor?.name);
      console.error('❌ Mensagem:', error?.message);
      
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        toast.error('Erro de conexão. Verifique se o servidor está rodando.');
      } else {
        toast.error('Erro ao verificar código. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Função para voltar ao passo de email
  const handleBackToEmail = () => {
    setStep('email');
    setCode('');
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen flex">
      {/* Coluna Esquerda - Imagem de Fundo Dinâmica com Conteúdo */}
      <div className="hidden lg:flex lg:w-2/3 relative overflow-hidden">
        {loginPage?.background_image_url ? (
          <>
            <div className="absolute inset-0">
              <img 
                src={loginPage.background_image_url} 
                alt="Background"
                className="w-full h-full object-cover"
                style={{ filter: 'blur(8px)' }}
              />
            </div>
            <div 
              className="absolute inset-0 opacity-90"
              style={{ 
                background: `linear-gradient(135deg, ${PRIMARY_COLOR}dd 0%, ${PRIMARY_COLOR_HOVER}dd 100%)` 
              }}
            ></div>
          </>
        ) : (
          <div 
            className="absolute inset-0"
            style={{ 
              background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, ${PRIMARY_COLOR_HOVER} 100%)` 
            }}
          ></div>
        )}
        
        {/* Conteúdo da área esquerda */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-12 text-white">
          {loginPage?.welcome_text && (
            <p className="text-lg md:text-xl mb-6 text-center opacity-90">
              {loginPage.welcome_text}
            </p>
          )}
          
          {(loginPage?.title_line1 || loginPage?.title_line2) && (
            <div className="text-center mb-8">
              {loginPage.title_line1 && (
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2">
                  {loginPage.title_line1}
                </h1>
              )}
              {loginPage.title_line2 && (
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold">
                  {loginPage.title_line2}
                </h2>
              )}
            </div>
          )}
          
          {loginPage?.button_text && loginPage?.button_link && (
            <a
              href={loginPage.button_link}
              className="px-8 py-4 bg-white text-[#3bb664] font-semibold rounded-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
            >
              {loginPage.button_icon && (() => {
                const IconComponent = (LucideIcons as any)[loginPage.button_icon];
                return IconComponent ? <IconComponent className="w-5 h-5" /> : null;
              })()}
              {loginPage.button_text}
            </a>
          )}
        </div>
      </div>

      {/* Coluna Direita - Formulário */}
      <div className="w-full lg:w-1/3 bg-white flex flex-col items-center justify-center px-6 sm:px-8 lg:px-12 py-12">
        <div className="w-full max-w-md">
          {/* Logo e Branding - Centralizado e Maior */}
          <div className="mb-8 text-center">
            {configuration?.logo_url ? (
              <div className="flex flex-col items-center mb-4">
                <img 
                  src={configuration.logo_url} 
                  alt={configuration.companyName || 'Logo'} 
                  className="h-20 w-auto mb-3"
                />
                {configuration.companyName && (
                  <h1 className="text-2xl font-bold" style={{ color: PRIMARY_COLOR }}>
                    {configuration.companyName}
                  </h1>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center mb-4">
                <div 
                  className="w-20 h-20 rounded-lg flex items-center justify-center text-white font-bold text-4xl mb-3"
                  style={{ backgroundColor: PRIMARY_COLOR }}
                >
                  {configuration?.companyName?.charAt(0) || 'C'}
                </div>
                <h1 className="text-2xl font-bold" style={{ color: PRIMARY_COLOR }}>
                  {configuration?.companyName || 'Central Contábil'}
                </h1>
              </div>
            )}
          </div>

          {/* Divisor */}
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-sm text-gray-500">Acesse a sua conta</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center lg:text-left">
            {step === 'code' ? 'Verificar Código' : 'Faça seu login'}
          </h2>

          {/* Formulário de Email */}
          {step === 'email' && (
            <form onSubmit={handleSendCode} className="space-y-6">
              <div className="mb-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-mail do usuário"
                    className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3bb664] focus:border-[#3bb664] outline-none transition-all text-gray-900 placeholder-gray-400"
                    required
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: PRIMARY_COLOR }}
                onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = PRIMARY_COLOR_HOVER)}
                onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = PRIMARY_COLOR)}
                disabled={isLoading}
              >
                {isLoading ? 'Enviando...' : 'Enviar Código'}
              </button>
            </form>
          )}

          {/* Formulário de Código */}
          {step === 'code' && (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div className="text-center mb-6">
                <p className="text-sm text-gray-600 mb-2">
                  Enviamos um código de 6 dígitos para:
                </p>
                <p className="font-medium text-gray-800">{email}</p>
              </div>
              
              <div className="mb-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3bb664] focus:border-[#3bb664] outline-none transition-all text-center text-xl tracking-widest font-semibold text-gray-900 placeholder-gray-400"
                    required
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: PRIMARY_COLOR }}
                onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = PRIMARY_COLOR_HOVER)}
                onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = PRIMARY_COLOR)}
                disabled={isLoading}
              >
                {isLoading ? 'Verificando...' : 'Autenticar'}
              </button>

              <button
                type="button"
                onClick={handleBackToEmail}
                className="w-full text-center text-sm text-gray-600 hover:text-gray-800 py-2 transition-colors"
                disabled={isLoading}
              >
                Voltar para email
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                O código expira em 10 minutos. Verifique sua caixa de entrada e spam.
              </p>
            </form>
          )}

          {/* Rodapé - Copyright */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              © {new Date().getFullYear()} {configuration?.companyName || 'Central Contábil'}. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
