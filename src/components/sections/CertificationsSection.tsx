import React from 'react';
import { Award, Shield, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const CertificationsSection: React.FC = () => {
  const { t } = useTranslation();
  const certifications = [
    {
      name: 'Rede Nacional de Contabilidade',
      acronym: 'RNC',
      description: 'Associados à maior rede de contabilidade do Brasil',
      icon: <Shield className="w-8 h-8" />,
    },
    {
      name: 'Grupo Master',
      acronym: 'GM',
      description: 'Integrantes do Grupo Master de Contabilidade Consultiva',
      icon: <Award className="w-8 h-8" />,
    },
    {
      name: 'ISO 9001',
      acronym: 'ISO',
      description: 'Padrões internacionais de qualidade em nossos processos',
      icon: <CheckCircle className="w-8 h-8" />,
    },
  ];

  return (
    <section className="py-20 bg-gray-100 relative overflow-hidden">
      {/* Top Divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gray-300 z-20"></div>
      
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1920&h=1080&fit=crop&q=80" 
          alt="Background"
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gray-100/95"></div>
      </div>
      
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02] z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#3bb664] filter blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#3bb664] text-white text-xs font-semibold mb-6 uppercase tracking-wider">
            {t('certifications.badge')}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('certifications.heading')}
          </h2>
          <div className="w-20 h-1 bg-[#3bb664] mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('certifications.description')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {certifications.map((cert, index) => (
            <div 
              key={index}
              className="group relative bg-white p-8 border-l-4 border-gray-300 hover:border-[#3bb664] transition-all duration-300 shadow-md hover:shadow-lg"
            >
              {/* Icon */}
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-[#3bb664] group-hover:bg-[#2d9a4f] transition-colors duration-300">
                  <div className="text-white">
                    {cert.icon}
                  </div>
                </div>
              </div>

              {/* Acronym Badge */}
              <div className="inline-block px-3 py-1 bg-[#3bb664] text-white text-xs font-bold mb-4 uppercase tracking-wider">
                {cert.acronym}
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-[#3bb664] transition-colors duration-300">
                {cert.name}
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                {cert.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

