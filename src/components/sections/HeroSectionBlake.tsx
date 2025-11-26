import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { Button } from '../ui/Button';
import { ChevronDown, Mouse, Play, ArrowRight, ArrowLeft } from 'lucide-react';
import { Slide, Hero } from '../../types';
import { apiService } from '../../services/api';
import { useTranslation } from 'react-i18next';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface HeroSectionBlakeProps {
  slides?: Slide[];
}

export const HeroSectionBlake: React.FC<HeroSectionBlakeProps> = ({ slides = [] }) => {
  const { t } = useTranslation();
  const [hero, setHero] = useState<Hero | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHero();
  }, []);

  const loadHero = async () => {
    try {
      const response = await apiService.getHero();
      setHero(response.hero);
    } catch (error) {
      console.error('Erro ao carregar Hero:', error);
      // Usa valores padrão quando a API falha
      setHero(null);
    } finally {
      setLoading(false);
    }
  };

  const scrollToNext = () => {
    document.querySelector('#sobre')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Valores padrão caso não tenha dados - usando traduções
  const badgeText = hero?.badgeText || t('hero.badge');
  const welcomeText = hero?.welcomeText || null;
  const titleLine1 = hero?.titleLine1 || t('hero.titleLine1');
  const titleLine2 = hero?.titleLine2 || t('hero.titleLine2');
  const description = hero?.description || t('hero.description');
  const backgroundImageUrl = hero?.backgroundImageUrl || 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1920&h=1080&fit=crop&q=80';
  // Só usa imagem se realmente existir no hero, sem valor padrão
  const heroImageUrl = hero?.heroImageUrl || null;
  const button1Text = hero?.button1Text || t('hero.button1');
  const button1Link = hero?.button1Link || '#contato';
  const button1Icon = hero?.button1Icon || null;
  const button2Text = hero?.button2Text || t('hero.button2');
  const button2Link = hero?.button2Link || '#servicos';
  const button2Icon = hero?.button2Icon || null;
  // Usar novos indicadores dinâmicos, com fallback para os antigos
  const indicator1Title = hero?.indicator1Title || hero?.statYears || t('hero.years');
  const indicator1Value = hero?.indicator1Value || hero?.statYears || '36+';
  const indicator2Title = hero?.indicator2Title || hero?.statClients || t('hero.clients');
  const indicator2Value = hero?.indicator2Value || hero?.statClients || '500+';
  const indicator3Title = hero?.indicator3Title || hero?.statNetwork || t('hero.associated');
  const indicator3Value = hero?.indicator3Value || hero?.statNetwork || 'RNC';

  if (loading) {
    return (
      <section id="inicio" className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden pt-16 sm:pt-20 lg:pt-24 flex items-center justify-center">
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
          <div className="w-full mx-auto max-w-6xl flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3bb664]"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="inicio" className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden pt-24 sm:pt-28 lg:pt-32 w-full">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src={backgroundImageUrl}
          alt="Profissionais contábeis em reunião"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-gray-800/80 to-black/90"></div>
      </div>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 sm:top-20 sm:left-20 w-48 h-48 sm:w-96 sm:h-96 bg-[#3bb664] rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-10 right-10 sm:bottom-20 sm:right-20 w-40 h-40 sm:w-80 sm:h-80 bg-#3bb664 rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full px-6 sm:px-8 lg:px-12 xl:px-16 py-12 sm:py-16 lg:py-20 min-h-[calc(100vh-8rem)] flex items-center">
        <div className={`w-full mx-auto ${heroImageUrl ? 'max-w-[95%] xl:max-w-[1400px] grid lg:grid-cols-2 gap-10 lg:gap-16 items-center' : 'max-w-6xl'}`}>
          {/* Content */}
          <div className={`text-white space-y-6 sm:space-y-8 w-full ${heroImageUrl ? 'text-center lg:text-left' : 'text-center'}`}>
            <div className="space-y-4 sm:space-y-6">
              {badgeText && (
                <div className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 bg-[#3bb664]/20 border border-[#3bb664]/30 rounded-full">
                  <span className="text-[#3bb664] text-xs sm:text-sm font-medium uppercase tracking-wider">
                    {badgeText}
                  </span>
                </div>
              )}
              
              {welcomeText && (
                <p className="text-base sm:text-lg lg:text-xl text-gray-300 italic">
                  {welcomeText}
                </p>
              )}
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold leading-tight">
                {titleLine1}
                <span className="block text-[#3bb664]">{titleLine2}</span>
              </h1>
              
              {description && (
                <p className="text-base sm:text-lg lg:text-xl text-gray-300 leading-relaxed max-w-lg mx-auto lg:mx-0">
                  {description}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              {button1Text && (
                <Button 
                  size="lg" 
                  className="px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg bg-[#3bb664] hover:bg-[#2d9a4f] text-white transition-all duration-300 transform hover:scale-105 shadow-2xl w-full sm:w-auto flex items-center justify-center gap-2"
                  onClick={() => {
                    const target = button1Link?.startsWith('#') 
                      ? document.querySelector(button1Link) 
                      : null;
                    if (target) {
                      target.scrollIntoView({ behavior: 'smooth' });
                    } else if (button1Link) {
                      window.location.href = button1Link;
                    }
                  }}
                >
                  {button1Icon === 'play' && <Play className="w-5 h-5 fill-current" />}
                  {button1Icon === 'arrow-right' && <ArrowRight className="w-5 h-5" />}
                  {button1Icon === 'arrow-left' && <ArrowLeft className="w-5 h-5" />}
                  {button1Text}
                </Button>
              )}
              {button2Text && (
                <button 
                  className="px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg border-2 border-white text-white hover:bg-white hover:text-[#3bb664] transition-all duration-300 w-full sm:w-auto font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900 flex items-center justify-center gap-2"
                  onClick={() => {
                    const target = button2Link?.startsWith('#') 
                      ? document.querySelector(button2Link) 
                      : null;
                    if (target) {
                      target.scrollIntoView({ behavior: 'smooth' });
                    } else if (button2Link) {
                      window.location.href = button2Link;
                    }
                  }}
                >
                  {button2Icon === 'play' && <Play className="w-5 h-5 fill-current" />}
                  {button2Icon === 'arrow-right' && <ArrowRight className="w-5 h-5" />}
                  {button2Icon === 'arrow-left' && <ArrowLeft className="w-5 h-5" />}
                  {button2Text}
                </button>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 lg:gap-8 pt-6 sm:pt-8 border-t border-gray-700">
              {indicator1Value && (
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-[#3bb664] mb-1">{indicator1Value}</div>
                  <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">{indicator1Title}</div>
                </div>
              )}
              {indicator2Value && (
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-[#3bb664] mb-1">{indicator2Value}</div>
                  <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">{indicator2Title}</div>
                </div>
              )}
              {indicator3Value && (
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-[#3bb664] mb-1">{indicator3Value}</div>
                  <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">{indicator3Title}</div>
                </div>
              )}
            </div>
          </div>

          {/* Professional Image - Mockup Empresário */}
          {heroImageUrl && (
            <div className="relative hidden lg:flex items-center justify-center">
              <div className="relative mx-auto w-full max-w-3xl">
                <div className="relative transform hover:scale-105 transition-transform duration-500">
                  <img 
                    src={heroImageUrl}
                    alt="Empresário profissional apontando - Consultoria contábil e benefícios fiscais"
                    className="w-full h-auto object-contain drop-shadow-2xl"
                    style={{ 
                      background: 'transparent',
                      mixBlendMode: 'normal'
                    }}
                    onError={(e) => {
                      // Se a imagem falhar ao carregar, usa uma imagem padrão do Unsplash
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1000&fit=crop&q=80';
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <button 
          onClick={scrollToNext}
          className="flex flex-col items-center text-white/70 hover:text-white transition-colors group"
        >
          <Mouse className="w-6 h-6 mb-2 group-hover:animate-bounce" />
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </button>
      </div>
    </section>
  );
};
