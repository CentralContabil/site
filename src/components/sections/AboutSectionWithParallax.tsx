import React from 'react';
import { Card } from '../ui/Card';
import { SmoothParallaxSection } from '../ui/ParallaxSection';

export const AboutSectionWithParallax: React.FC = () => {
  return (
    <SmoothParallaxSection
      backgroundImage="https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20accounting%20office%20interior%20professional%20corporate%20environment%20clean%20minimalist%20design%20natural%20lighting%20high%20quality%20photography&image_size=landscape_16_9"
      minHeight="auto"
      overlayOpacity={0.1}
      overlayColor="bg-white"
      className="py-20"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Quem Somos
          </h2>
          <div className="w-24 h-1 bg-green-600 mx-auto"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">
              Sua Empresa de Contabilidade de Confiança
            </h3>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Com mais de 34 anos de atuação, a Central Contábil – Soluções Empresariais 
              é uma das maiores e mais experientes empresas de Contabilidade do Estado do Espírito Santo. 
              Nossas soluções vão além da contabilidade tradicional: atuamos de forma integrada e estratégica 
              para que o seu negócio tenha a melhor performance contábil, fiscal e tributária.
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Em busca da maior e melhor entrega do mercado, seguimos padrões internacionais de Qualidade; 
              somos associados à Rede Nacional de Contabilidade (RNC); e integramos o Grupo Master de 
              Contabilidade Consultiva.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">34+</div>
                <div className="text-gray-600">Anos de Experiência</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">RNC</div>
                <div className="text-gray-600">Rede Nacional</div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Card className="max-w-md bg-white/90 backdrop-blur-sm">
              <div className="text-center">
                <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-gray-800 mb-4">
                  Nossa Equipe
                </h4>
                <p className="text-gray-600">
                  Profissionais qualificados e atualizados com padrões internacionais 
                  de Qualidade, integrantes da Rede Nacional de Contabilidade (RNC).
                </p>
              </div>
            </Card>
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-md">
            <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Confiança</h4>
            <p className="text-gray-600">
              Transparência e ética em todos os nossos serviços.
            </p>
          </div>

          <div className="text-center bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-md">
            <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Agilidade</h4>
            <p className="text-gray-600">
              Entregas rápidas e eficientes sem comprometer a qualidade.
            </p>
          </div>

          <div className="text-center bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-md">
            <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Excelência</h4>
            <p className="text-gray-600">
              Compromisso com a alta qualidade em cada detalhe.
            </p>
          </div>
        </div>
      </div>
    </SmoothParallaxSection>
  );
};