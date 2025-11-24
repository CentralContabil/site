import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Service } from '../../types';
import { 
  Building2, 
  Calculator, 
  Users, 
  FileText, 
  Shield, 
  TrendingUp,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

interface ServicesSectionProps {
  services: Service[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'building': Building2,
  'calculator': Calculator,
  'users': Users,
  'file-text': FileText,
  'shield': Shield,
  'trending-up': TrendingUp,
};

const defaultServices: Service[] = [
  {
    id: '1',
    name: 'Contábeis',
    description: 'Cuidamos de demonstrações, relatórios e demais aspectos contábeis para manter seus números impecáveis com padrões internacionais de qualidade.',
    icon: 'calculator',
    order: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Fiscal e Tributário',
    description: 'Mantenha a sua empresa em conformidade com as legislações fiscais e descubra oportunidades para pagar menos impostos com planejamento estratégico.',
    icon: 'file-text',
    order: 2,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'Trabalhista',
    description: 'Tenha mais segurança no cumprimento das suas obrigações trabalhistas e mantenha distância de processos trabalhistas com nossa assessoria especializada.',
    icon: 'users',
    order: 3,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    name: 'Legalização',
    description: 'Tenha todo o suporte contábil necessário para garantir a legalização e regularidade da sua empresa com agilidade e segurança.',
    icon: 'shield',
    order: 4,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    name: 'Benefícios Fiscais',
    description: 'Quer reduzir a sua carga tributária? Através dos Incentivos Fiscais disponíveis no Espírito Santo é possível reduzir sua alíquota de ICMS para 1%!',
    icon: 'trending-up',
    order: 5,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const ServicesSection: React.FC<ServicesSectionProps> = ({ services = defaultServices }) => {
  return (
    <section id="servicos" className="py-12 sm:py-16 lg:py-20 bg-white relative overflow-hidden">
      {/* Top Divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gray-300 z-20"></div>
      
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1554224155-6726b468ff31?w=1920&h=1080&fit=crop&q=80" 
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
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14 lg:mb-16 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 bg-[#3bb664] text-white text-xs font-semibold mb-4 sm:mb-6 uppercase tracking-wider">
            Nossos Serviços
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight px-4">
            Nossas Soluções Vão
            <span className="block text-[#3bb664]">Além da Contabilidade</span>
          </h2>
          <div className="w-16 sm:w-20 h-1 bg-[#3bb664] mx-auto mb-4 sm:mb-6"></div>
          <p className="text-base sm:text-lg text-gray-700 max-w-2xl mx-auto px-4">
            Atuamos de forma integrada e estratégica para que o seu negócio tenha a 
            <span className="font-semibold text-gray-900">melhor performance contábil, fiscal e tributária</span> com 34 anos de experiência.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-14 lg:mb-16">
          {services.map((service, index) => {
            // Imagens diferentes para cada serviço
            const serviceImages = [
              'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop&q=80', // Contábeis
              'https://images.unsplash.com/photo-1554224155-6726b468ff31?w=600&h=400&fit=crop&q=80', // Fiscal
              'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&h=400&fit=crop&q=80', // Trabalhista
              'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop&q=80', // Legalização
              'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&h=400&fit=crop&q=80', // Benefícios
            ];
            
            return (
              <div 
                key={service.id} 
                className="group relative bg-gray-50 border-l-4 border-gray-300 hover:border-[#3bb664] transition-all duration-300 shadow-md hover:shadow-lg overflow-hidden"
              >
                {/* Service Image */}
                <div className="relative h-32 sm:h-40 overflow-hidden">
                  <img 
                    src={serviceImages[index % serviceImages.length]} 
                    alt={service.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-transparent to-transparent"></div>
                  
                  {/* Icon Overlay */}
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#3bb664] flex items-center justify-center group-hover:bg-[#2d9a4f] transition-colors duration-300">
                      {service.icon && iconMap[service.icon] ? (
                        React.createElement(iconMap[service.icon], { className: "w-5 h-5 sm:w-6 sm:h-6 text-white" })
                      ) : (
                        <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-[#3bb664] transition-colors duration-300">
                    {service.name}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-3 sm:mb-4 text-xs sm:text-sm">
                    {service.description}
                  </p>

                  {/* Learn More Link */}
                  <Link 
                    to={`/servicos/${service.slug || service.id}`}
                    className="flex items-center text-[#3bb664] font-semibold text-xs sm:text-sm uppercase tracking-wider group-hover:text-[#2d9a4f] transition-colors duration-300"
                  >
                    <span className="mr-2">Saiba mais</span>
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gray-100 border-2 border-gray-300 p-6 sm:p-8 lg:p-10 max-w-4xl mx-auto shadow-md mx-4">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Pronto para Otimizar Seus Processos Contábeis?
            </h3>
            <p className="text-base sm:text-lg text-gray-700 mb-6 sm:mb-8 leading-relaxed">
              Entre em contato com nossa equipe de especialistas e descubra como podemos 
              transformar a gestão financeira do seu negócio.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button 
                size="xl" 
                variant="primary"
                onClick={() => document.querySelector('#contato')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-[#3bb664] hover:bg-[#2d9a4f] text-white px-6 sm:px-8 py-2.5 sm:py-3 font-semibold uppercase tracking-wider text-xs sm:text-sm transition-colors duration-300 w-full sm:w-auto"
              >
                Agende uma Consultoria
              </Button>
              <Button 
                size="xl" 
                variant="ghost"
                onClick={() => document.querySelector('#sobre')?.scrollIntoView({ behavior: 'smooth' })}
                className="border-2 border-gray-300 hover:border-[#3bb664] text-gray-700 hover:text-[#3bb664] px-6 sm:px-8 py-2.5 sm:py-3 font-semibold uppercase tracking-wider text-xs sm:text-sm transition-all duration-300 w-full sm:w-auto"
              >
                Conheça Nossa Equipe
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