import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { HeroSection } from '../components/sections/HeroSection';
import { AboutSection } from '../components/sections/AboutSection';
import { ServicesSection } from '../components/sections/ServicesSection';
import { TestimonialsSection } from '../components/sections/TestimonialsSection';
import { ContactSection } from '../components/sections/ContactSection';
import { ParallaxBlock, ParallaxFeature, ModernParallaxBlock } from '../components/ParallaxBlock';
import { Button } from '../components/ui/Button';
import { apiService } from '../services/api';
import { Slide, Service, Testimonial, Configuration } from '../types';
import { Toaster } from 'sonner';

export default function HomeWithParallax() {
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
        {/* Hero Section with Parallax */}
        <section id="inicio">
          {slides.length > 0 ? (
            <HeroSection slides={slides} />
          ) : (
            <ParallaxBlock
              title="Soluções que Vão Além da Contabilidade"
              subtitle="Com mais de 34 anos de atuação"
              description="Atuamos de forma integrada e estratégica para que o seu negócio tenha a melhor performance contábil, fiscal e tributária."
              imageUrl="https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20accounting%20office%20interior%20professional%20corporate%20environment%20clean%20minimalist%20design%20natural%20lighting%20high%20quality%20photography&image_size=landscape_16_9"
              height="100vh"
              overlayOpacity={0.6}
            >
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
                  className="px-8 py-4 text-lg border-white text-white hover:bg-white hover:text-green-700 transition-all duration-300"
                  onClick={() => document.querySelector('#servicos')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Conheça Nossos Serviços
                </Button>
              </div>
            </ParallaxBlock>
          )}
        </section>
        
        {/* About Section with Parallax */}
        <ModernParallaxBlock
          title="Quem Somos"
          subtitle="Tradição e Excelência em Contabilidade"
          description="Com mais de três décadas de mercado, a Central Contábil se consolidou como uma das empresas de assessoria contábil mais respeitadas da região. Nossa equipe é formada por profissionais altamente qualificados e atualizados com as últimas tendências do mercado."
          imageUrl="https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20accounting%20team%20meeting%20modern%20office%20boardroom%20diverse%20team%20business%20attire%20serious%20expressions%20natural%20lighting%20corporate%20environment&image_size=landscape_16_9"
          height="80vh"
          overlayOpacity={0.5}
        />
        
        {/* Services Section */}
        <section id="servicos">
          <ServicesSection services={services} />
        </section>
        
        {/* Parallax Feature Section */}
        <ParallaxFeature
          title="Por Que Escolher a Central Contábil?"
          subtitle="Excelência e Confiança"
          description="Oferecemos soluções personalizadas para cada cliente, garantindo conformidade fiscal, otimização tributária e suporte contábil completo para o crescimento do seu negócio."
          imageUrl="https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20business%20handshake%20professional%20partnership%20agreement%20corporate%20setting%20trust%20collaboration%20natural%20lighting%20high%20quality%20photography&image_size=landscape_16_9"
          overlayOpacity={0.4}
        />
        
        {/* Testimonials Section with Parallax */}
        <ParallaxBlock
          title="O Que Nossos Clientes Dizem"
          subtitle="Confiança e Satisfação"
          description="A satisfação dos nossos clientes é a prova do nosso compromisso com a excelência em serviços contábeis."
          imageUrl="https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=happy%20business%20clients%20professional%20testimonials%20diverse%20group%20of%20people%20smiling%20confident%20expressions%20corporate%20environment%20natural%20lighting&image_size=landscape_16_9"
          height="auto"
          overlayOpacity={0.3}
        >
          <TestimonialsSection testimonials={testimonials} />
        </ParallaxBlock>
        
        {/* CTA Section with Parallax */}
        <section id="contato">
          <ParallaxBlock
            title="Pronto para Otimizar sua Gestão Contábil?"
            subtitle="Entre em Contato Conosco"
            description="Agende uma consultoria gratuita e descubra como podemos ajudar seu negócio a crescer de forma sustentável e conforme as normas fiscais."
            imageUrl="https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20business%20contact%20office%20reception%20professional%20environment%20welcome%20area%20clean%20design%20natural%20lighting%20corporate%20atmosphere&image_size=landscape_16_9"
            height="60vh"
            overlayOpacity={0.6}
          >
            <ContactSection configuration={configuration} />
          </ParallaxBlock>
        </section>
      </main>
      
      <Footer configuration={configuration} />
    </div>
  );
}