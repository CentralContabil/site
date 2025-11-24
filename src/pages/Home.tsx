import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { HeroSection } from '../components/sections/HeroSection';
import { AboutSection } from '../components/sections/AboutSection';
import { AboutSectionWithParallax } from '../components/sections/AboutSectionWithParallax';
import { ServicesSection } from '../components/sections/ServicesSection';
import { TestimonialsSection } from '../components/sections/TestimonialsSection';
import { ContactSection } from '../components/sections/ContactSection';
import { ParallaxBlock, ModernParallaxBlock } from '../components/ParallaxBlock';
import { Button } from '../components/ui/Button';
import { apiService } from '../services/api';
import { Slide, Service, Testimonial, Configuration } from '../types';
import { Toaster } from 'sonner';

export default function Home() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [configuration, setConfiguration] = useState<Configuration | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [slidesData, servicesData, testimonialsData, configData] = await Promise.all([
          apiService.getSlides(),
          apiService.getServices(),
          apiService.getTestimonials(),
          apiService.getConfiguration(),
        ]);

        setSlides(slidesData.slides);
        setServices(servicesData.services);
        setTestimonials(testimonialsData.testimonials);
        setConfiguration(configData.configuration);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Use default data if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-right" />
      <Header configuration={configuration} />
      
      <main>
        <section id="inicio">
          <HeroSection slides={slides} />
        </section>
        
        <AboutSection />
        
        {/* Parallax Feature Section */}
        <ModernParallaxBlock
          title="Excelência em Serviços Contábeis"
          subtitle="Mais de 34 anos de experiência"
          description="Oferecemos soluções personalizadas para cada cliente, garantindo conformidade fiscal, otimização tributária e suporte contábil completo para o crescimento do seu negócio."
          imageUrl="https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20accounting%20team%20professional%20meeting%20office%20environment%20corporate%20strategy%20discussion%20natural%20lighting%20high%20quality%20photography&image_size=landscape_16_9"
          height="60vh"
          overlayOpacity={0.4}
        />
        
        <section id="servicos">
          <ServicesSection services={services} />
        </section>
        
        {/* Parallax CTA Section */}
        <ParallaxBlock
          title="Pronto para Otimizar sua Gestão Contábil?"
          subtitle="Entre em Contato Conosco"
          description="Agende uma consultoria gratuita e descubra como podemos ajudar seu negócio a crescer de forma sustentável."
          imageUrl="https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20business%20contact%20office%20reception%20professional%20environment%20welcome%20area%20clean%20design%20natural%20lighting&image_size=landscape_16_9"
          height="50vh"
          overlayOpacity={0.5}
        >
          <div className="text-center">
            <Button 
              size="lg" 
              className="px-8 py-4 text-lg bg-green-700 hover:bg-green-800 text-white transition-all duration-300 transform hover:scale-105 mr-4"
              onClick={() => document.querySelector('#contato')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Agende uma Consultoria
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="px-8 py-4 text-lg border-white text-white hover:bg-white hover:text-green-700 transition-all duration-300"
              onClick={() => window.open('/parallax', '_blank')}
            >
              Ver Versão com Parallax
            </Button>
          </div>
        </ParallaxBlock>
        
        <TestimonialsSection testimonials={testimonials} />
        
        <section id="contato">
          <ContactSection configuration={configuration} />
        </section>
      </main>
      
      <Footer configuration={configuration} />
    </div>
  );
}