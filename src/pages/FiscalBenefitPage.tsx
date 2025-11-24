import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FooterBlake } from '../components/layout/FooterBlake';
import { Button } from '../components/ui/Button';
import { useConfiguration } from '../hooks/useConfiguration';
import { GlobalHeader } from '../components/layout/GlobalHeader';
import { ArrowLeft, Calculator, TrendingDown } from 'lucide-react';
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

  useEffect(() => {
    if (slug) {
      fetchBenefit();
    }
  }, [slug]);

  const fetchBenefit = async () => {
    try {
      setLoading(true);
      setError(null);
      const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'http://localhost:3006/api');
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
    const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'http://localhost:3006');
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
              <a 
                href="https://www.central-rnc.com.br/competecentral" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block"
              >
                <button 
                  className="inline-flex items-center justify-center bg-white text-[#3bb664] hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 rounded-lg border-2 border-white"
                >
                  <Calculator className="mr-2 h-5 w-5" />
                  Acessar Calculadora
                </button>
              </a>
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
      
      <FooterBlake configuration={configuration} />
    </div>
  );
};

