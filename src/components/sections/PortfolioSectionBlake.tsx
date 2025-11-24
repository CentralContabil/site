import React from 'react';
import { ExternalLink, Eye } from 'lucide-react';

interface PortfolioItem {
  id: number;
  title: string;
  category: string;
  image: string;
  description: string;
}

export const PortfolioSectionBlake: React.FC = () => {
  const portfolioItems: PortfolioItem[] = [
    {
      id: 1,
      title: "Consultoria Fiscal",
      category: "FISCAL",
      image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20accounting%20consulting%20office%20professional%20meeting%20tax%20planning%20documents%20clean%20minimalist%20design&image_size=landscape_16_9",
      description: "Planejamento tributário estratégico para empresas de diversos setores"
    },
    {
      id: 2,
      title: "Auditoria Contábil",
      category: "AUDITORIA",
      image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20accounting%20audit%20team%20examining%20financial%20statements%20modern%20office%20environment&image_size=landscape_16_9",
      description: "Auditorias independentes com foco em conformidade e transparência"
    },
    {
      id: 3,
      title: "Gestão Contábil",
      category: "GESTÃO",
      image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20accounting%20software%20dashboard%20financial%20charts%20reports%20professional%20interface&image_size=landscape_16_9",
      description: "Soluções completas de gestão contábil com tecnologia de ponta"
    },
    {
      id: 4,
      title: "Assessoria Jurídica",
      category: "JURÍDICO",
      image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20legal%20consulting%20team%20business%20law%20documents%20modern%20corporate%20environment&image_size=landscape_16_9",
      description: "Suporte jurídico especializado em direito empresarial e tributário"
    },
    {
      id: 5,
      title: "Abertura de Empresas",
      category: "EMPRESARIAL",
      image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=business%20company%20formation%20registration%20documents%20professional%20consulting%20modern%20office&image_size=landscape_16_9",
      description: "Assessoria completa para abertura e regularização de empresas"
    },
    {
      id: 6,
      title: "Treinamentos Corporativos",
      category: "EDUCAÇÃO",
      image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20corporate%20training%20session%20accounting%20education%20modern%20classroom%20environment&image_size=landscape_16_9",
      description: "Capacitação profissional em contabilidade, fiscal e gestão"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 uppercase tracking-wider">
            Nossos Serviços
          </h2>
          <div className="w-24 h-1 bg-[#3bb664] mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Conheça nossas principais áreas de atuação e descubra como podemos 
            ajudar seu negócio a crescer de forma sustentável.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {portfolioItems.map((item) => (
            <div 
              key={item.id}
              className="group bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex space-x-2">
                      <button className="bg-white text-gray-900 p-2 rounded-full hover:bg-[#3bb664] hover:text-white transition-colors">
                        <Eye size={16} />
                      </button>
                      <button className="bg-[#3bb664] text-white p-2 rounded-full hover:bg-[#2d9a4f] transition-colors">
                        <ExternalLink size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="absolute top-4 left-4">
                  <span className="bg-[#3bb664] text-white px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider">
                    {item.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-[#3bb664] transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {item.description}
                </p>
                <button className="text-[#3bb664] font-medium text-sm hover:text-[#2d9a4f] transition-colors flex items-center">
                  Saiba mais
                  <ExternalLink size={14} className="ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <button 
            className="bg-[#3bb664] text-white px-8 py-4 rounded-lg font-medium hover:bg-[#2d9a4f] transition-colors uppercase tracking-wider"
            onClick={() => document.querySelector('#contato')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Ver Todos os Serviços
          </button>
        </div>
      </div>
    </section>
  );
};