import React from 'react';
import { Store, TrendingUp, ShoppingCart, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { useTranslation } from 'react-i18next';

interface Specialty {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

export const SpecialtiesSection: React.FC = () => {
  const { t } = useTranslation();
  const specialties: Specialty[] = [
    {
      id: '1',
      name: 'Contabilidade Atacadista',
      description: 'Especialização em contabilidade para empresas do setor atacadista, com conhecimento profundo das particularidades fiscais e tributárias do segmento.',
      icon: <Store className="w-8 h-8" />,
    },
    {
      id: '2',
      name: 'Planejamento Tributário',
      description: 'A sua empresa pode estar pagando mais impostos do que deveria. Por meio de um Planejamento Tributário é possível reduzir custos e aumentar o rendimento do seu negócio!',
      icon: <TrendingUp className="w-8 h-8" />,
    },
    {
      id: '3',
      name: 'Contabilidade E-Commerce',
      description: 'Especialização em contabilidade para empresas de e-commerce, com foco em compliance fiscal, tributação de vendas online e otimização tributária.',
      icon: <ShoppingCart className="w-8 h-8" />,
    },
  ];

  return (
    <section className="py-20 bg-gray-100 relative overflow-hidden">
      {/* Top Divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gray-300 z-20"></div>
      
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&h=1080&fit=crop&q=80" 
          alt="Background"
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gray-100/95"></div>
      </div>
      
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02] z-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#3bb664] filter blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#3bb664] text-white text-xs font-semibold mb-6 uppercase tracking-wider">
            {t('specialties.badge')}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {t('specialties.heading')}
            <span className="block text-[#3bb664]">{t('specialties.headingHighlight')}</span>
          </h2>
          <div className="w-20 h-1 bg-[#3bb664] mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('specialties.description')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {specialties.map((specialty, index) => (
            <div 
              key={specialty.id}
              className="group relative bg-white p-8 border-l-4 border-gray-300 hover:border-[#3bb664] transition-all duration-300 shadow-md hover:shadow-lg"
            >
              {/* Icon */}
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-[#3bb664] group-hover:bg-[#2d9a4f] transition-colors duration-300">
                  <div className="text-white">
                    {specialty.icon}
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-[#3bb664] transition-colors duration-300">
                {specialty.name}
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm mb-6">
                {specialty.description}
              </p>
              
              {/* Learn More Link */}
              <div className="flex items-center text-[#3bb664] font-semibold text-sm uppercase tracking-wider group-hover:text-[#2d9a4f] transition-colors duration-300">
                <span className="mr-2">Saiba mais</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 pt-12 border-t-2 border-gray-300">
          <p className="text-gray-700 mb-6 text-base font-medium">
            Precisa de uma especialização específica para o seu negócio?
          </p>
          <Button 
            size="xl" 
            variant="primary"
            onClick={() => document.querySelector('#contato')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-[#3bb664] hover:bg-[#2d9a4f] text-white px-8 py-3 font-semibold uppercase tracking-wider text-sm transition-colors duration-300"
          >
            Fale com Nossos Especialistas
          </Button>
        </div>
      </div>
      
      {/* Bottom Divider */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-300"></div>
    </section>
  );
};

