import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingDown } from 'lucide-react';
import { Button } from '../ui/Button';
import * as LucideIcons from 'lucide-react';

interface Benefit {
  id: string;
  icon: string;
  name: string;
  description: string;
  slug?: string;
  order: number;
  is_active: boolean;
}

export const FiscalBenefitsSection: React.FC = () => {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBenefits();
  }, []);

  const fetchBenefits = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'http://localhost:3006/api');
      const response = await fetch(`${API_BASE_URL}/sections/fiscal-benefits`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.benefits) {
          setBenefits(data.benefits);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar benefícios fiscais:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="beneficios" className="py-12 sm:py-16 lg:py-20 bg-white relative overflow-hidden">
      {/* Top Divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gray-300 z-20"></div>
      
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&h=1080&fit=crop&q=80" 
          alt="Background"
          className="w-full h-full object-cover opacity-[0.08]"
        />
        <div className="absolute inset-0 bg-white/95"></div>
      </div>
      
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02] z-10">
        <div className="absolute top-0 right-0 w-48 h-48 sm:w-96 sm:h-96 bg-[#3bb664] filter blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-10 sm:mb-14 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 bg-[#3bb664] text-white text-xs font-semibold mb-4 sm:mb-6 uppercase tracking-wider">
            Benefícios Fiscais do ES
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight px-4">
            Já pensou em pagar somente
            <span className="block text-[#3bb664]">1% de ICMS?</span>
          </h2>
          <div className="w-16 sm:w-20 h-1 bg-[#3bb664] mx-auto mb-4 sm:mb-6"></div>
          <p className="text-base sm:text-lg text-gray-700 max-w-3xl mx-auto mb-4 sm:mb-6 px-4">
            Conheça os principais Incentivos Fiscais do Espírito Santo e como eles podem 
            beneficiar a sua empresa com economia tributária!
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-gray-100 border-2 border-[#3bb664] mx-4">
            <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-[#3bb664]" />
            <span className="text-sm sm:text-base font-bold text-[#3bb664] uppercase tracking-wider">
              Reduza sua alíquota de ICMS para até 1%
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3bb664]"></div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto mb-10 sm:mb-14 lg:mb-16">
            {benefits.map((benefit) => {
              const IconComponent = (LucideIcons as any)[benefit.icon] || LucideIcons.Award;
              
              const cardContent = (
                <div className="group relative bg-gray-50 p-6 border-l-4 border-gray-300 hover:border-[#3bb664] transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer h-full flex flex-col">
                  {/* Icon */}
                  <div className="mb-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-[#3bb664] group-hover:bg-[#2d9a4f] transition-colors duration-300">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-[#3bb664] transition-colors duration-300">
                    {benefit.name}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed flex-grow">
                    {benefit.description}
                  </p>
                  
                  {/* Indicador de clique */}
                  <div className="mt-4 flex items-center text-[#3bb664] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-xs font-semibold uppercase tracking-wider">Saiba mais</span>
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              );

              // Se tiver slug, torna clicável
              if (benefit.slug) {
                return (
                  <Link 
                    key={benefit.id} 
                    to={`/beneficios-fiscais/${benefit.slug}`}
                    className="block h-full"
                  >
                    {cardContent}
                  </Link>
                );
              }

              // Se não tiver slug, ainda mostra o card mas não é clicável
              return (
                <div key={benefit.id} className="h-full">
                  {cardContent}
                </div>
              );
            })}
          </div>
        )}

        {/* CTA Section */}
        <div className="text-center bg-gray-100 border-2 border-gray-300 p-6 sm:p-8 lg:p-10 max-w-4xl mx-auto shadow-md mx-4">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Equipe Especializada em Incentivos Fiscais
            </h3>
            <p className="text-base sm:text-lg text-gray-700 mb-6 sm:mb-8 leading-relaxed">
              Nossa equipe especializada está pronta para auxiliar a sua empresa a 
              aproveitar todos os benefícios fiscais disponíveis no Espírito Santo.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button 
                size="xl" 
                variant="primary"
                onClick={() => document.querySelector('#contato')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-[#3bb664] hover:bg-[#2d9a4f] text-white px-6 sm:px-8 py-2.5 sm:py-3 font-semibold uppercase tracking-wider text-xs sm:text-sm transition-colors duration-300 w-full sm:w-auto"
              >
                Saiba Mais
              </Button>
              <Button 
                size="xl" 
                variant="ghost"
                onClick={() => document.querySelector('#contato')?.scrollIntoView({ behavior: 'smooth' })}
                className="border-2 border-gray-300 hover:border-[#3bb664] text-gray-700 hover:text-[#3bb664] px-6 sm:px-8 py-2.5 sm:py-3 font-semibold uppercase tracking-wider text-xs sm:text-sm transition-all duration-300 w-full sm:w-auto"
              >
                Fale com a Equipe
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Divider */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-300"></div>
    </section>
  );
};

