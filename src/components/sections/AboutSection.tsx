import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import * as LucideIcons from 'lucide-react';
import 'swiper/css';
import 'swiper/css/pagination';

interface AboutImage {
  id: string;
  image_url: string;
  description?: string;
}

interface AboutData {
  badge_text?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  stat_years?: string;
  stat_clients?: string;
  stat_network?: string;
  images?: AboutImage[];
}

interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
  order: number;
  is_active: boolean;
}

export const AboutSection: React.FC = () => {
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'http://localhost:3006/api');
        const response = await fetch(`${API_BASE_URL}/sections/about`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.about) {
            setAboutData(data.about);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar seção Sobre:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchFeatures = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'http://localhost:3006/api');
        const response = await fetch(`${API_BASE_URL}/sections/features`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.features) {
            // Ordenar por order e limitar a 3 primeiros
            const sortedFeatures = data.features
              .filter((f: Feature) => f.is_active)
              .sort((a: Feature, b: Feature) => a.order - b.order)
              .slice(0, 3);
            setFeatures(sortedFeatures);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar features:', error);
      }
    };

    fetchAbout();
    fetchFeatures();
  }, []);

  const getImageUrl = (url?: string) => {
    if (!url) return 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=1000&fit=crop&q=80';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Se a URL começa com /uploads/, usar a URL base do backend
    if (url.startsWith('/uploads/')) {
      const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'http://localhost:3006');
      return `${API_BASE_URL}${url}`;
    }
    // Fallback para URLs relativas
    const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'http://localhost:3006');
    return `${API_BASE_URL}${url}`;
  };

  const badgeText = aboutData?.badge_text || 'Sobre Nós';
  const title = aboutData?.title || 'Quem Somos';
  const description = aboutData?.description || 'Com mais de 34 anos de atuação, a Central Contábil – Soluções Empresariais é uma das maiores e mais experientes empresas de Contabilidade do Estado do Espírito Santo.';
  const statYears = aboutData?.stat_years || '34+';
  const statClients = aboutData?.stat_clients || '500+';
  const statNetwork = aboutData?.stat_network || 'RNC';
  const images = aboutData?.images || [];
  const backgroundImageUrl = aboutData?.background_image_url;
  
  // Usar os novos campos de indicadores se disponíveis, caso contrário usar os antigos
  const indicator1Title = aboutData?.indicator1_title || 'Anos';
  const indicator1Value = aboutData?.indicator1_value || statYears || '34+';
  const indicator2Title = aboutData?.indicator2_title || 'Clientes';
  const indicator2Value = aboutData?.indicator2_value || statClients || '500+';
  const indicator3Title = aboutData?.indicator3_title || 'Rede';
  const indicator3Value = aboutData?.indicator3_value || statNetwork || 'RNC';

  if (loading) {
    return (
      <section id="sobre" className="py-12 sm:py-16 lg:py-20 bg-gray-50 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3bb664]"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="sobre" className="py-12 sm:py-16 lg:py-20 bg-gray-50 relative overflow-hidden">
      {/* Top Divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gray-300 z-20"></div>
      
      {/* Background Image */}
      {backgroundImageUrl && (
        <div className="absolute inset-0">
          <img 
            src={getImageUrl(backgroundImageUrl)} 
            alt="Background"
            className="w-full h-full object-cover opacity-[0.08]"
          />
          <div className="absolute inset-0 bg-gray-50/97"></div>
        </div>
      )}
      {!backgroundImageUrl && (
        <div className="absolute inset-0 bg-gray-50"></div>
      )}
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-10 sm:mb-14 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 bg-[#3bb664] text-white text-xs font-semibold mb-4 sm:mb-6 uppercase tracking-wider">
            {badgeText}
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            {title}
          </h2>
          <div className="w-16 sm:w-20 h-1 bg-[#3bb664] mx-auto mb-4 sm:mb-6"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          <div className="order-2 md:order-1">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
              Sua Empresa de Contabilidade de Confiança
            </h3>
            <div className="text-gray-700 mb-4 leading-relaxed text-sm sm:text-base whitespace-pre-line">
              {description}
            </div>
            
            <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-6 sm:pt-8 border-t-2 border-gray-300">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-[#3bb664] mb-1 sm:mb-2">{indicator1Value}</div>
                <div className="text-xs text-gray-600 uppercase tracking-wider">{indicator1Title}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-[#3bb664] mb-1 sm:mb-2">{indicator2Value}</div>
                <div className="text-xs text-gray-600 uppercase tracking-wider">{indicator2Title}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-[#3bb664] mb-1 sm:mb-2">{indicator3Value}</div>
                <div className="text-xs text-gray-600 uppercase tracking-wider">{indicator3Title}</div>
              </div>
            </div>
          </div>

          <div className="relative order-1 md:order-2">
            {images.length > 0 ? (
              <div className="relative overflow-hidden rounded-lg shadow-lg">
                <Swiper
                  modules={[Pagination, Autoplay]}
                  spaceBetween={0}
                  slidesPerView={1}
                  pagination={{ 
                    clickable: true,
                    bulletClass: 'swiper-pagination-bullet',
                    bulletActiveClass: 'swiper-pagination-bullet-active'
                  }}
                  autoplay={{
                    delay: 5000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                  }}
                  loop={images.length > 1}
                  grabCursor={true}
                  className="about-carousel"
                  style={{ cursor: 'grab' }}
                >
                  {images.map((image, index) => {
                    const slideNumber = String(index + 1).padStart(2, '0');
                    return (
                      <SwiperSlide key={image.id}>
                        <div className="relative w-full">
                          <img 
                            src={getImageUrl(image.image_url)}
                            alt={image.description || 'Imagem da Central Contábil'}
                            className="w-full h-auto object-cover"
                            draggable={false}
                          />
                          
                          {/* Number and Description Container - Bottom Left */}
                          <div className="absolute bottom-0 left-0 z-10 p-4 sm:p-6 md:p-8">
                            {/* Number Overlay */}
                            <div className="relative mb-3 sm:mb-4">
                              {/* Background escuro para o número */}
                              <div className="absolute -inset-3 sm:-inset-4 bg-black/60 backdrop-blur-sm" style={{ 
                                width: '120px', 
                                height: '120px',
                                borderRadius: '2px'
                              }}></div>
                              <div className="relative text-white text-7xl sm:text-8xl md:text-9xl font-bold leading-none" style={{ 
                                textShadow: '2px 2px 4px rgba(0,0,0,0.9)',
                                lineHeight: '0.85',
                                fontFamily: 'system-ui, -apple-system, sans-serif'
                              }}>
                                {slideNumber}
                              </div>
                            </div>
                            
                            {/* Description Overlay - Below number */}
                            {image.description && (
                              <div className="relative">
                                <div className="bg-white/95 backdrop-blur-sm rounded px-3 py-2 sm:px-4 sm:py-2.5 shadow-lg border border-gray-200">
                                  <h4 className="text-gray-900 text-sm sm:text-base md:text-lg font-bold">
                                    {image.description}
                                  </h4>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </SwiperSlide>
                    );
                  })}
                </Swiper>
                <style>{`
                  .about-carousel {
                    cursor: grab;
                  }
                  .about-carousel:active {
                    cursor: grabbing;
                  }
                  .about-carousel .swiper-pagination {
                    bottom: 16px !important;
                    left: 50% !important;
                    transform: translateX(-50%);
                    width: auto !important;
                    z-index: 20;
                  }
                  .about-carousel .swiper-pagination-bullet {
                    background-color: rgba(255, 255, 255, 0.5);
                    opacity: 1;
                    width: 10px;
                    height: 10px;
                    margin: 0 4px;
                    transition: all 0.3s ease;
                  }
                  .about-carousel .swiper-pagination-bullet-active {
                    background-color: #3bb664;
                    width: 24px;
                    border-radius: 5px;
                  }
                  .about-carousel img {
                    user-select: none;
                    -webkit-user-drag: none;
                    pointer-events: none;
                  }
                `}</style>
              </div>
            ) : (
              <div className="relative overflow-hidden border-2 sm:border-4 border-gray-300">
                <img 
                  src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=1000&fit=crop&q=80" 
                  alt="Equipe profissional da Central Contábil"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-transparent to-transparent"></div>
                
                {/* Overlay Badge */}
                <div className="absolute bottom-0 left-0 right-0 bg-gray-50 p-4 sm:p-6 border-t-2 sm:border-t-4 border-[#3bb664]">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#3bb664] flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                        Equipe Qualificada
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Profissionais certificados e atualizados
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {features.length > 0 && (
          <div className="mt-12 sm:mt-16 lg:mt-20 pt-10 sm:pt-14 lg:pt-16 border-t-2 border-gray-300 grid sm:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            {features.map((feature) => {
              const IconComponent = (LucideIcons as any)[feature.icon] || LucideIcons.Circle;
              return (
                <div key={feature.id} className="text-center bg-gray-100 p-4 sm:p-6 border-l-4 border-[#3bb664]">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#3bb664] flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">{feature.title}</h4>
                  <p className="text-gray-700 text-xs sm:text-sm">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Bottom Divider */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-300"></div>
    </section>
  );
};