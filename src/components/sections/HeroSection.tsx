import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { Button } from '../ui/Button';
import { Slide } from '../../types';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface HeroSectionProps {
  slides: Slide[];
}

export const HeroSection: React.FC<HeroSectionProps> = ({ slides }) => {
  const [activeSlide, setActiveSlide] = useState(0);

  if (!slides || slides.length === 0) {
    return (
      <section className="relative h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-green-600 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-green-400 rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-green-900 mb-6 leading-tight">
              Soluções que Vão
              <span className="block text-green-700">Além da Contabilidade</span>
            </h1>
          </div>
          
          <div className="animate-fade-in-up animation-delay-200">
            <p className="text-xl md:text-2xl text-green-800 mb-12 max-w-3xl mx-auto leading-relaxed">
              Com mais de 34 anos de atuação, atuamos de forma integrada e estratégica para que 
              o seu negócio tenha a <span className="font-semibold text-green-900">melhor performance contábil, fiscal e tributária</span>
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-400">
            <Button 
              size="lg" 
              className="px-8 py-4 text-lg bg-green-700 hover:bg-green-800 text-white transition-all duration-300 transform hover:scale-105"
              onClick={() => document.querySelector('#contato')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Agende uma Consultoria
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="px-8 py-4 text-lg border-green-700 text-green-700 hover:bg-green-700 hover:text-white transition-all duration-300"
              onClick={() => document.querySelector('#servicos')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Conheça Nossos Serviços
            </Button>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-green-700 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-green-700 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-screen bg-white overflow-hidden">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        navigation={{
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        }}
        pagination={{ 
          clickable: true,
          el: '.swiper-pagination',
          bulletClass: 'swiper-pagination-bullet',
          bulletActiveClass: 'swiper-pagination-bullet-active'
        }}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        onSlideChange={(swiper) => setActiveSlide(swiper.activeIndex)}
        className="h-full"
        speed={1000}
        effect="fade"
        fadeEffect={{ crossFade: true }}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={slide.id}>
            <div className="relative h-full">
              {/* Background with overlay */}
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${slide.imageUrl})`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-green-900/80 via-green-800/70 to-green-700/60"></div>
              
              {/* Content */}
              <div className="relative h-full flex items-center justify-center">
                <div className="text-center px-4 max-w-6xl mx-auto">
                  <div className={`transition-all duration-1000 ${index === activeSlide ? 'animate-fade-in-up' : 'opacity-0'}`}>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight tracking-tight">
                      {slide.title}
                    </h1>
                  </div>
                  
                  {slide.subtitle && (
                    <div className={`transition-all duration-1000 delay-200 ${index === activeSlide ? 'animate-fade-in-up' : 'opacity-0'}`}>
                      <p className="text-xl md:text-2xl text-green-100 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
                        {slide.subtitle}
                      </p>
                    </div>
                  )}
                  
                  {slide.buttonText && slide.buttonLink && (
                    <div className={`transition-all duration-1000 delay-400 ${index === activeSlide ? 'animate-fade-in-up' : 'opacity-0'}`}>
                      <Button 
                        size="lg" 
                        variant="secondary"
                        className="px-8 py-4 text-lg bg-white text-green-800 hover:bg-green-50 transition-all duration-300 transform hover:scale-105 shadow-2xl"
                        onClick={() => {
                          if (slide.buttonLink?.startsWith('#')) {
                            document.querySelector(slide.buttonLink)?.scrollIntoView({ behavior: 'smooth' });
                          } else {
                            window.open(slide.buttonLink, '_blank');
                          }
                        }}
                      >
                        {slide.buttonText}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Premium Navigation */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-20">
        <div className="swiper-pagination flex space-x-3"></div>
      </div>

      {/* Custom Navigation Arrows */}
      <div className="swiper-button-prev absolute left-8 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all duration-300">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </div>
      <div className="swiper-button-next absolute right-8 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all duration-300">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-20">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

// Add custom styles for animations
const styles = `
  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in-up {
    animation: fade-in-up 1s ease-out forwards;
  }

  .animation-delay-200 {
    animation-delay: 200ms;
  }

  .animation-delay-400 {
    animation-delay: 400ms;
  }

  .swiper-pagination-bullet {
    width: 12px;
    height: 12px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    margin: 0 6px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .swiper-pagination-bullet-active {
    background: white;
    transform: scale(1.2);
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}