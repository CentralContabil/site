import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { apiService } from '../../services/api';
import { Client } from '../../types';
import { ExternalLink, Facebook, Instagram, Linkedin, Twitter, MessageCircle } from 'lucide-react';
import { useConfiguration } from '../../hooks/useConfiguration';
import { useTranslation } from 'react-i18next';
import 'swiper/css';

export const ClientsSection: React.FC = () => {
  const { t } = useTranslation();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionData, setSectionData] = useState<{ title: string; background_image_url?: string | null } | null>(null);
  const { configuration } = useConfiguration();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, sectionRes] = await Promise.all([
          apiService.getClients(),
          apiService.getClientsSection(),
        ]);
        setClients(clientsRes.clients || []);
        setSectionData(sectionRes.clients);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        // Usar dados padrão em caso de erro
        setClients([]);
        setSectionData({ title: t('clients.defaultTitle') });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getLogoUrl = (client: Client) => {
    const logoUrl = client.logoUrl || client.logo_url;
    if (!logoUrl) return null;
    if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
      return logoUrl;
    }
    // Em desenvolvimento, usar o proxy do Vite, em produção usar a URL completa
    if (import.meta.env.DEV) {
      return logoUrl;
    }
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3006';
    return `${apiUrl}${logoUrl}`;
  };

  if (loading) {
    return (
      <section className="relative overflow-hidden py-24 text-white" style={{
        backgroundImage: `linear-gradient(135deg, rgba(59,182,100,0.95), rgba(45,154,79,0.9))`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  if (clients.length === 0) {
    return null;
  }

  // Usar todos os clientes ativos, mesmo sem logo
  const activeClients = clients.filter(client => client.isActive !== false);
  
  if (activeClients.length === 0) {
    return null;
  }

  const backgroundStyle = sectionData?.background_image_url
    ? {
        backgroundImage: `linear-gradient(135deg, rgba(26,95,63,0.95), rgba(13,74,46,0.9)), url(${sectionData.background_image_url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {
        backgroundColor: '#1a5f3f',
        background: 'linear-gradient(135deg, #1a5f3f 0%, #0d4a2e 100%)',
      };

  return (
    <section
      id="clientes"
      className="relative overflow-hidden py-20 text-white"
      style={backgroundStyle}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Título simples */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold text-white uppercase tracking-wide">
            {sectionData?.title || t('clients.defaultTitle')}
          </h2>
        </div>

        {/* Carrossel de Logomarcas */}
        <div className="max-w-7xl mx-auto" onMouseEnter={(e) => e.stopPropagation()} onMouseLeave={(e) => e.stopPropagation()}>
          <Swiper
            modules={[Autoplay]}
            spaceBetween={20}
            slidesPerView={activeClients.length < 2 ? activeClients.length : 2}
            centeredSlides={activeClients.length < 5}
            centeredSlidesBounds={activeClients.length < 5}
            breakpoints={{
              640: {
                slidesPerView: activeClients.length < 3 ? activeClients.length : 3,
                spaceBetween: 20,
                centeredSlides: activeClients.length < 5,
                centeredSlidesBounds: activeClients.length < 5,
              },
              768: {
                slidesPerView: activeClients.length < 4 ? activeClients.length : 4,
                spaceBetween: 20,
                centeredSlides: activeClients.length < 5,
                centeredSlidesBounds: activeClients.length < 5,
              },
              1024: {
                slidesPerView: activeClients.length < 5 ? activeClients.length : 5,
                spaceBetween: 20,
                centeredSlides: activeClients.length < 5,
                centeredSlidesBounds: activeClients.length < 5,
              },
              1280: {
                slidesPerView: activeClients.length < 5 ? activeClients.length : 5,
                spaceBetween: 30,
                centeredSlides: activeClients.length < 5,
                centeredSlidesBounds: activeClients.length < 5,
              },
            }}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            loop={activeClients.length > 5}
            speed={800}
            className={`clients-swiper ${activeClients.length < 5 ? 'centered-slides' : ''}`}
            grabCursor={false}
          >
            {activeClients.map((client) => {
              const logoUrl = getLogoUrl(client);
              const websiteUrl = client.websiteUrl || client.website_url;
              const facebookUrl = client.facebookUrl || client.facebook_url;
              const instagramUrl = client.instagramUrl || client.instagram_url;
              const linkedinUrl = client.linkedinUrl || client.linkedin_url;
              const twitterUrl = client.twitterUrl || client.twitter_url;
              // Usar o telefone do cliente, se disponível, senão usar o da configuração geral
              const clientPhone = client.phone;
              const defaultWhatsappNumber = configuration?.whatsappNumber || configuration?.whatsapp_number;
              const whatsappNumber = clientPhone || defaultWhatsappNumber;

              const hasLinks = websiteUrl || facebookUrl || instagramUrl || linkedinUrl || twitterUrl || whatsappNumber;

              return (
                <SwiperSlide key={client.id}>
                  <div className="flex flex-col items-center justify-center h-full px-2">
                    {/* Card Container */}
                    <div className="p-6 w-full h-full min-h-[200px] max-h-[200px] flex flex-col justify-between transition-all duration-300 hover:bg-white/5 hover:backdrop-blur-sm hover:rounded-lg hover:border hover:border-white/10 hover:shadow-lg">
                      {/* Logo */}
                      <div className="flex items-center justify-center flex-1 min-h-[80px] max-h-[100px]">
                        {logoUrl ? (
                          <img
                            src={logoUrl}
                            alt={client.name}
                            className="max-h-16 max-w-full object-contain filter brightness-0 invert"
                            title={client.name}
                            loading="lazy"
                          />
                        ) : (
                          <span className="text-white text-sm font-semibold uppercase tracking-wide text-center leading-tight">
                            {client.name}
                          </span>
                        )}
                      </div>

                      {/* Ícones de Links */}
                      {hasLinks && (
                        <div className="flex flex-nowrap items-center justify-center gap-1.5 pt-3 border-t border-white/10 overflow-hidden">
                          {websiteUrl && (
                            <a
                              href={websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center w-7 h-7 bg-white/10 hover:bg-[#2d9a4f] hover:text-white rounded-full transition-all duration-300 group flex-shrink-0"
                              title="Acessar Website"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-white/80 group-hover:text-white transition-colors" />
                            </a>
                          )}
                          {facebookUrl && (
                            <a
                              href={facebookUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center w-7 h-7 bg-white/10 hover:bg-blue-600 hover:text-white rounded-full transition-all duration-300 group flex-shrink-0"
                              title="Facebook"
                            >
                              <Facebook className="w-3.5 h-3.5 text-white/80 group-hover:text-white transition-colors" />
                            </a>
                          )}
                          {instagramUrl && (
                            <a
                              href={instagramUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center w-7 h-7 bg-white/10 hover:bg-pink-600 hover:text-white rounded-full transition-all duration-300 group flex-shrink-0"
                              title="Instagram"
                            >
                              <Instagram className="w-3.5 h-3.5 text-white/80 group-hover:text-white transition-colors" />
                            </a>
                          )}
                          {linkedinUrl && (
                            <a
                              href={linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center w-7 h-7 bg-white/10 hover:bg-blue-700 hover:text-white rounded-full transition-all duration-300 group flex-shrink-0"
                              title="LinkedIn"
                            >
                              <Linkedin className="w-3.5 h-3.5 text-white/80 group-hover:text-white transition-colors" />
                            </a>
                          )}
                          {twitterUrl && (
                            <a
                              href={twitterUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center w-7 h-7 bg-white/10 hover:bg-blue-400 hover:text-white rounded-full transition-all duration-300 group flex-shrink-0"
                              title="Twitter"
                            >
                              <Twitter className="w-3.5 h-3.5 text-white/80 group-hover:text-white transition-colors" />
                            </a>
                          )}
                          {whatsappNumber && (
                            <a
                              href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center w-7 h-7 bg-white/10 hover:bg-green-500 hover:text-white rounded-full transition-all duration-300 group flex-shrink-0"
                              title="Contato via WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-white/80 group-hover:text-white transition-colors" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>

      <style>{`
        .clients-swiper {
          padding: 30px 0 60px 0;
        }
        .clients-swiper .swiper-slide {
          display: flex;
          align-items: stretch;
          justify-content: center;
          height: 200px;
        }
        .clients-swiper.centered-slides .swiper-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </section>
  );
};


