import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link } from 'react-router-dom';
import { FooterBlake } from '../components/layout/FooterBlake';
import { Button } from '../components/ui/Button';
import { useConfiguration } from '../hooks/useConfiguration';
import { GlobalHeader } from '../components/layout/GlobalHeader';
import { ArrowLeft, Calculator, TrendingDown, X } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface FiscalBenefit {
  id: string;
  icon: string;
  name: string;
  description: string;
  slug: string;
  content?: string;
  excerpt?: string;
  featured_image_url?: string;
  order: number;
  is_active: boolean;
}

export const FiscalBenefitPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [benefit, setBenefit] = useState<FiscalBenefit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { configuration } = useConfiguration();
  const [calculatorConfig, setCalculatorConfig] = useState<{
    calculator_url: string;
    calculator_open_type: 'modal' | 'new_tab' | 'same_page';
  } | null>(null);
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [isModalOpening, setIsModalOpening] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchBenefit();
    }
    fetchCalculatorConfig();
  }, [slug]);

  const fetchCalculatorConfig = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${API_BASE_URL}/sections/fiscal-benefits/config`);
      if (response.ok) {
        const data = await response.json();
        console.log('Configuração da calculadora carregada:', data);
        if (data.success && data.config) {
          setCalculatorConfig({
            calculator_url: data.config.calculator_url || 'https://www.usehigh.land/competecentral',
            calculator_open_type: data.config.calculator_open_type || 'modal',
          });
        } else {
          // Se não retornou config, usar valores padrão
          setCalculatorConfig({
            calculator_url: 'https://www.usehigh.land/competecentral',
            calculator_open_type: 'modal',
          });
        }
      } else {
        console.warn('Resposta da API não foi OK:', response.status);
        // Usar valores padrão se a resposta não foi OK
        setCalculatorConfig({
          calculator_url: 'https://www.usehigh.land/competecentral',
          calculator_open_type: 'modal',
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configuração da calculadora:', error);
      // Usar valores padrão em caso de erro
      setCalculatorConfig({
        calculator_url: 'https://www.usehigh.land/competecentral',
        calculator_open_type: 'modal',
      });
    }
  };

  const handleCalculatorClick = () => {
    console.log('🔘 Botão clicado!');
    console.log('📋 Config atual:', calculatorConfig);
    
    // Se não tiver config ainda, usar valores padrão
    const config = calculatorConfig || {
      calculator_url: 'https://www.usehigh.land/competecentral',
      calculator_open_type: 'modal' as const,
    };

    console.log('🔧 Usando config:', config);
    console.log('📌 Tipo de abertura:', config.calculator_open_type);
    console.log('🔗 URL:', config.calculator_url);

    switch (config.calculator_open_type) {
      case 'modal':
        console.log('✅ Abrindo modal...');
        setIsModalClosing(false);
        setIsModalOpening(true);
        setIframeLoading(true);
        setShowCalculatorModal(true);
        // Forçar animação de entrada após renderização inicial
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setIsModalOpening(false);
          });
        });
        console.log('📊 Estado showCalculatorModal definido como true');
        break;
      case 'new_tab':
        console.log('✅ Abrindo nova aba:', config.calculator_url);
        window.open(config.calculator_url, '_blank', 'noopener,noreferrer');
        break;
      case 'same_page':
        console.log('✅ Redirecionando para:', config.calculator_url);
        window.location.href = config.calculator_url;
        break;
      default:
        console.log('⚠️ Tipo desconhecido, usando modal como padrão');
        setShowCalculatorModal(true);
    }
  };

  const fetchBenefit = async () => {
    try {
      setLoading(true);
      setError(null);
      const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${API_BASE_URL}/sections/fiscal-benefits/slug/${slug}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.benefit) {
          setBenefit(data.benefit);
        } else {
          setError('Benefício não encontrado');
        }
      } else {
        setError('Benefício não encontrado');
      }
    } catch (error) {
      console.error('Erro ao carregar benefício:', error);
      setError('Erro ao carregar o benefício');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const API_BASE_URL = import.meta.env.VITE_API_URL || '';
    return `${API_BASE_URL}${url}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <GlobalHeader configuration={configuration} />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3bb664]"></div>
        </div>
        <FooterBlake configuration={configuration} />
      </div>
    );
  }

  if (error || !benefit) {
    return (
      <div className="min-h-screen bg-gray-50">
        <GlobalHeader configuration={configuration} />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Benefício não encontrado</h1>
          <p className="text-gray-600 mb-8">{error || 'O benefício fiscal solicitado não foi encontrado.'}</p>
          <Link to="/#beneficios">
            <Button className="bg-[#3bb664] hover:bg-[#2d9a4f] text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Benefícios Fiscais
            </Button>
          </Link>
        </div>
        <FooterBlake configuration={configuration} />
      </div>
    );
  }

  const IconComponent = (LucideIcons as any)[benefit.icon] || LucideIcons.Award;
  const imageUrl = getImageUrl(benefit.featured_image_url);

  return (
    <div className="min-h-screen bg-white">
      <GlobalHeader configuration={configuration} />
      
      <main>
        {/* Hero Section com Imagem de Fundo */}
        <section className="relative text-white pt-32 sm:pt-36 lg:pt-40 pb-20 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            {imageUrl ? (
              <img 
                src={imageUrl}
                alt={benefit.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&h=600&fit=crop&q=80" 
                alt="Background"
                className="w-full h-full object-cover"
              />
            )}
            {/* Overlay com transparência */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-800/75 to-gray-900/80"></div>
          </div>
          
          {/* Content */}
          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <Link 
                to="/#beneficios" 
                className="inline-flex items-center text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Benefícios Fiscais
              </Link>
            </div>
            
            <div className="max-w-4xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-[#3bb664] flex items-center justify-center rounded-lg">
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#3bb664] text-white text-xs font-semibold uppercase tracking-wider">
                  Benefício Fiscal
                </div>
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                {benefit.name}
              </h1>
              
              {benefit.excerpt && (
                <p className="text-lg text-gray-200 leading-relaxed">
                  {benefit.excerpt}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Content */}
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="max-w-4xl mx-auto">
            {benefit.content ? (
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: benefit.content }}
              />
            ) : (
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed text-lg mb-6">
                  {benefit.description}
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Este benefício fiscal oferece oportunidades significativas de economia tributária para empresas no Espírito Santo. 
                  Entre em contato conosco para entender melhor como sua empresa pode se beneficiar deste programa.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* CTA Section */}
        <div className="relative py-16 sm:py-20 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&h=600&fit=crop&q=80" 
              alt="Background"
              className="w-full h-full object-cover"
            />
            {/* Overlay verde com gradiente */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#3bb664]/95 via-[#3bb664]/90 to-[#2d9a4f]/95"></div>
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
                <Calculator className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Calcule o Benefício para sua Empresa
              </h2>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                Use nossa calculadora de benefícios fiscais para descobrir quanto sua empresa pode economizar com este programa.
              </p>
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCalculatorClick();
                }}
                className="inline-flex items-center justify-center bg-white text-[#3bb664] hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 rounded-lg border-2 border-white cursor-pointer"
              >
                <Calculator className="mr-2 h-5 w-5" />
                Acessar Calculadora
              </button>
              <p className="text-white/80 text-sm mt-4">
                Ferramenta gratuita e sem compromisso
              </p>
            </div>
          </div>
        </div>

        {/* Secondary CTA */}
        <div className="bg-gray-50 py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Precisa de Ajuda Especializada?
              </h3>
              <p className="text-lg text-gray-700 mb-8">
                Nossa equipe está pronta para auxiliar sua empresa a aproveitar todos os benefícios fiscais disponíveis no Espírito Santo.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="xl" 
                  className="bg-[#3bb664] hover:bg-[#2d9a4f] text-white px-8 py-3"
                  onClick={() => document.querySelector('#contato')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Fale com um Especialista
                </Button>
                <Link to="/#beneficios">
                  <Button 
                    size="xl" 
                    variant="ghost"
                    className="border-2 border-gray-300 hover:border-[#3bb664] text-gray-700 hover:text-[#3bb664] px-8 py-3"
                  >
                    Ver Outros Benefícios
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Modal da Calculadora - Renderizado via Portal no body */}
      {showCalculatorModal && typeof document !== 'undefined' && createPortal(
        <div 
          className={`fixed inset-0 bg-black flex items-center justify-center p-4 transition-all duration-500 ease-out ${
            isModalClosing || isModalOpening ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ 
            zIndex: 999999,
            backgroundColor: isModalClosing || isModalOpening ? 'rgba(0, 0, 0, 0)' : 'rgba(0, 0, 0, 0.5)'
          }}
          onClick={() => {
            console.log('🔄 Fechando modal (clique no backdrop)');
            setIsModalClosing(true);
            setTimeout(() => {
              setShowCalculatorModal(false);
              setIsModalClosing(false);
            }, 500);
          }}
        >
          <div 
            className={`bg-white rounded-lg shadow-2xl w-full max-w-7xl h-[95vh] flex flex-col transition-all duration-500 ease-out ${
              isModalClosing 
                ? 'scale-95 opacity-0 translate-y-4' 
                : isModalOpening
                ? 'scale-95 opacity-0 translate-y-4'
                : 'scale-100 opacity-100 translate-y-0'
            }`}
            style={{ zIndex: 1000000 }}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="p-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0 bg-gray-50">
              <h3 className="text-xl font-semibold text-gray-900">Calculadora de Benefícios Fiscais</h3>
              <button
                type="button"
                onClick={() => {
                  console.log('❌ Fechando modal (botão X)');
                  setIsModalClosing(true);
                  setTimeout(() => {
                    setShowCalculatorModal(false);
                    setIsModalClosing(false);
                  }, 500);
                }}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors cursor-pointer text-gray-600 hover:text-red-600 flex items-center justify-center"
                title="Fechar"
              >
                <X className="w-6 h-6 stroke-2" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden relative bg-gray-100">
              {iframeLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3bb664] mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Carregando...</p>
                  </div>
                </div>
              )}
              <iframe
                key={calculatorConfig?.calculator_url || 'https://www.usehigh.land/competecentral'}
                src={calculatorConfig?.calculator_url || 'https://www.usehigh.land/competecentral'}
                className="w-full h-full border-0"
                title="Calculadora de Benefícios Fiscais"
                allow="fullscreen"
                allowFullScreen
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation"
                onLoad={() => {
                  console.log('✅ Iframe carregado');
                  setTimeout(() => {
                    setIframeLoading(false);
                  }, 500);
                }}
                onError={() => {
                  console.error('❌ Erro ao carregar iframe');
                  setIframeLoading(false);
                }}
              />
            </div>
          </div>
        </div>,
        document.body
      )}
      
      <FooterBlake configuration={configuration} />
    </div>
  );
};

