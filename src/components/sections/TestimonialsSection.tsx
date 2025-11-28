import React, { useState, useEffect } from 'react';
import { Testimonial } from '../../types';
import { ChevronLeft, ChevronRight, User, Quote } from 'lucide-react';

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

const defaultTestimonials: Testimonial[] = [
  {
    id: '1',
    clientName: 'João Silva',
    company: 'Silva & Associados',
    testimonialText: 'Excelente serviço! A equipe é muito profissional e atenciosa. Nos ajudou a organizar toda a contabilidade da empresa com muita eficiência e dedicação. Recomendo fortemente!',
    order: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    clientName: 'Maria Santos',
    company: 'Comércio Varejista Ltda',
    testimonialText: 'Estou muito satisfeita com os serviços prestados. A assessoria tributária fez toda a diferença para o crescimento do meu negócio. Profissionais extremamente competentes.',
    order: 2,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    clientName: 'Pedro Oliveira',
    company: 'Tecnologia Inovadora',
    testimonialText: 'Profissionais extremamente competentes. Sempre disponíveis para tirar dúvidas e oferecer as melhores soluções contábeis. Transformaram completamente nossa gestão financeira.',
    order: 3,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ testimonials = defaultTestimonials }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const nextTestimonial = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => 
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
    setTimeout(() => setIsAnimating(false), 600);
  };

  const prevTestimonial = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
    setTimeout(() => setIsAnimating(false), 600);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextTestimonial();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-32 bg-gradient-to-br from-green-900 via-green-800 to-green-700 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-green-300 rounded-full filter blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-20 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm font-medium mb-6">
            <Quote className="w-4 h-4" />
            Depoimentos de Clientes
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            O que nossos clientes
            <span className="block text-green-200">dizem sobre nós</span>
          </h2>
          <p className="text-xl text-green-100 leading-relaxed max-w-2xl mx-auto">
            A confiança e satisfação de nossos clientes são a prova do nosso compromisso com a excelência contábil
          </p>
        </div>

        {/* Testimonial Carousel */}
        <div className="max-w-5xl mx-auto relative">
          <div className="relative overflow-hidden">
            <div 
              className="flex transition-transform duration-600 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                  <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-white/20">
                    <div className="text-center max-w-3xl mx-auto">
                      {/* Quote Icon */}
                      <div className="flex justify-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center">
                          <Quote className="w-8 h-8 text-white" />
                        </div>
                      </div>

                      {/* Testimonial Text */}
                      <p className="text-2xl md:text-3xl text-gray-800 leading-relaxed mb-8 font-light italic">
                        "{testimonial.testimonialText}"
                      </p>

                      {/* Client Info */}
                      <div className="flex items-center justify-center">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
                            {testimonial.clientImageUrl ? (
                              <img 
                                src={testimonial.clientImageUrl} 
                                alt={testimonial.clientName}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <User className="w-8 h-8 text-green-700" />
                            )}
                          </div>
                          <div className="text-left">
                            <h4 className="text-xl font-bold text-gray-900">
                              {testimonial.clientName}
                            </h4>
                            {testimonial.company && (
                              <p className="text-green-700 font-medium">{testimonial.company}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          {testimonials.length > 1 && (
            <>
              <button
                onClick={prevTestimonial}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-16 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 border border-white/30"
                aria-label="Depoimento anterior"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={nextTestimonial}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-16 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 border border-white/30"
                aria-label="Próximo depoimento"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </>
          )}

          {/* Dots Indicator */}
          {testimonials.length > 1 && (
            <div className="flex justify-center mt-12 space-x-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'bg-white scale-125' 
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                  onClick={() => {
                    if (!isAnimating) {
                      setIsAnimating(true);
                      setCurrentIndex(index);
                      setTimeout(() => setIsAnimating(false), 600);
                    }
                  }}
                  aria-label={`Ir para depoimento ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="text-center mt-20">
          <p className="text-xl text-green-100 mb-8">
            Junte-se a empresas que já transformaram sua gestão contábil conosco
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => document.querySelector('#contato')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white text-green-800 rounded-full font-semibold hover:bg-green-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Comece Agora Mesmo
            </button>
            <button 
              onClick={() => document.querySelector('#servicos')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-green-800 transition-all duration-300"
            >
              Conheça Nossos Serviços
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};