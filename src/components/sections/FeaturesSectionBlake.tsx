import React from 'react';
import { Shield, Zap, Settings, TrendingUp, Users, Award } from 'lucide-react';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const FeaturesSectionBlake: React.FC = () => {
  const features: Feature[] = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Conformidade Garantida",
      description: "Garantimos total conformidade fiscal e tributária para seu negócio com processos auditados e atualizados"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Agilidade nos Processos",
      description: "Entregas rápidas e eficientes sem comprometer a qualidade, utilizando tecnologia de ponta"
    },
    {
      icon: <Settings className="w-6 h-6" />,
      title: "Soluções Personalizadas",
      description: "Consultoria adaptada às necessidades específicas do seu negócio, com atendimento dedicado"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Otimização Tributária",
      description: "Redução legal da carga tributária com estratégias inteligentes e planejamento fiscal avançado"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Equipe Qualificada",
      description: "Profissionais certificados e atualizados com as últimas normas e legislações vigentes"
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Excelência Comprovada",
      description: "Mais de 34 anos de tradição e milhares de clientes satisfeitos em todo o Brasil"
    }
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#3bb664]/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#3bb664]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#3bb664]/3 rounded-full blur-3xl"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: 'linear-gradient(rgba(59, 182, 100, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 182, 100, 0.1) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }}></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#3bb664] text-white text-xs font-bold mb-6 uppercase tracking-widest shadow-lg">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            Nossos Diferenciais
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-4 leading-tight">
            Por Que Escolher a
            <span className="block text-[#3bb664] mt-2">
              Central Contábil
            </span>
          </h2>
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-12 h-1 bg-gradient-to-r from-transparent to-[#3bb664]"></div>
            <div className="w-3 h-3 bg-[#3bb664]"></div>
            <div className="w-12 h-1 bg-gradient-to-l from-transparent to-[#3bb664]"></div>
          </div>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Oferecemos soluções completas e personalizadas para empresas de todos os portes, 
            garantindo <span className="font-semibold text-gray-900">segurança</span>, <span className="font-semibold text-gray-900">conformidade</span> e <span className="font-semibold text-gray-900">crescimento sustentável</span>.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group relative bg-white p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 overflow-hidden"
            >
              {/* Green Background on Hover */}
              <div className="absolute inset-0 bg-[#3bb664] opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
              
              {/* Animated Border */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#3bb664]/20 transition-all duration-500"></div>
              
              {/* Icon Container */}
              <div className="relative mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#3bb664] shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <div className="text-white transform group-hover:scale-110 transition-transform duration-500">
                    {feature.icon}
                  </div>
                </div>
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-[#3bb664] opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>
              </div>
              
              {/* Content */}
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#3bb664] transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed text-base group-hover:text-gray-700 transition-colors duration-300">
                {feature.description}
              </p>

              {/* Decorative Element */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#3bb664] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16 sm:mt-20 lg:mt-24">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-white px-8 py-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <span className="text-gray-800 text-lg font-semibold">Pronto para otimizar sua gestão?</span>
            <button 
              className="bg-[#3bb664] text-white px-8 py-3 font-bold hover:bg-[#2d9a4f] hover:shadow-lg transition-all duration-300 uppercase tracking-wider text-sm"
              onClick={() => document.querySelector('#contato')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Entre em Contato
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};