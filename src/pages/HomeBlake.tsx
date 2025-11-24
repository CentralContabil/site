import React, { useState, useEffect } from 'react';
import { FooterBlake } from '../components/layout/FooterBlake';
import { HeroSectionBlake } from '../components/sections/HeroSectionBlake';
import { FeaturesSectionBlake } from '../components/sections/FeaturesSectionBlake';
import { PortfolioSectionBlake } from '../components/sections/PortfolioSectionBlake';
import { FunFactsSectionBlake } from '../components/sections/FunFactsSectionBlake';
import { TestimonialsSectionBlake } from '../components/sections/TestimonialsSectionBlake';
import { NewsletterSectionBlake } from '../components/sections/NewsletterSectionBlake';
import { AboutSection } from '../components/sections/AboutSection';
import { ServicesSection } from '../components/sections/ServicesSection';
import { ContactSection } from '../components/sections/ContactSection';
import { CertificationsSection } from '../components/sections/CertificationsSection';
import { SpecialtiesSection } from '../components/sections/SpecialtiesSection';
import { FiscalBenefitsSection } from '../components/sections/FiscalBenefitsSection';
import { ClientsSection } from '../components/sections/ClientsSection';
import { apiService } from '../services/api';
import { useConfiguration } from '../hooks/useConfiguration';
import { Slide, Service, Testimonial } from '../types';

export default function HomeBlake() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const { configuration, loading: configLoading } = useConfiguration();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [slidesData, servicesData, testimonialsData] = await Promise.all([
          apiService.getSlides(),
          apiService.getServices(),
          apiService.getTestimonials(),
        ]);

        console.log('📊 Slides recebidos:', slidesData);
        console.log('📊 Services recebidos:', servicesData);
        console.log('📊 Testimonials recebidos:', testimonialsData);

        setSlides(slidesData.slides || []);
        setServices(servicesData.services || []);
        setTestimonials(testimonialsData.testimonials || []);
      } catch (error) {
        console.error('❌ Error fetching data:', error);
        // Use empty arrays if API fails - components will use default data
        setSlides([]);
        setServices([]);
        setTestimonials([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3bb664] mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main>
        {/* Hero Section */}
        <section id="inicio">
          <HeroSectionBlake slides={slides} />
        </section>
        
        {/* Visual Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        
        {/* Features Section */}
        <section id="features">
          <FeaturesSectionBlake />
        </section>
        
        {/* Visual Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        
        {/* About Section */}
        <section id="sobre">
          <AboutSection />
        </section>
        
        {/* Visual Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        
        {/* Services Section */}
        <section id="servicos">
          <ServicesSection services={services} />
        </section>
        
        {/* Visual Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        
        {/* Specialties Section */}
        <section id="especialidades">
          <SpecialtiesSection />
        </section>
        
        {/* Visual Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        
        {/* Fiscal Benefits Section */}
        <section id="beneficios-fiscais">
          <FiscalBenefitsSection />
        </section>
        
        {/* Visual Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        
        {/* Fun Facts Section */}
        <section id="numeros">
          <FunFactsSectionBlake />
        </section>
        
        {/* Visual Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        
        {/* Testimonials Section */}
        <section id="depoimentos">
          <TestimonialsSectionBlake testimonials={testimonials} />
        </section>
        
        {/* Visual Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        
        {/* Clients Section */}
        <section id="clientes">
          <ClientsSection />
        </section>
        
        {/* Visual Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        
        {/* Certifications Section */}
        <section id="certificacoes">
          <CertificationsSection />
        </section>
        
        {/* Visual Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        
        {/* Newsletter Section */}
        <section id="newsletter">
          <NewsletterSectionBlake />
        </section>
        
        {/* Visual Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        
        {/* Contact Section */}
        <section id="contato">
          <ContactSection configuration={configuration} />
        </section>
      </main>
      
      <FooterBlake configuration={configuration} />
    </div>
  );
}
