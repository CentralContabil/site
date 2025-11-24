import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import { Testimonial as TestimonialType } from '../../types';

interface TestimonialsSectionBlakeProps {
  testimonials?: TestimonialType[];
}

export const TestimonialsSectionBlake: React.FC<TestimonialsSectionBlakeProps> = ({ testimonials: propsTestimonials = [] }) => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Fallback testimonials se não houver dados da API
  const defaultTestimonials: TestimonialType[] = [
    {
      id: '1',
      clientName: "Carlos Eduardo Silva",
      company: "Silva & Associados",
      testimonialText: "A Central Contábil transformou completamente nossa gestão financeira. Com a consultoria deles, reduzimos custos tributários em 30% e ganhamos muito mais segurança nas nossas operações. Equipe extremamente profissional e competente.",
      clientImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&q=80",
      order: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      clientName: "Mariana Costa",
      company: "Costa Comércio",
      testimonialText: "Trabalhamos com a Central há mais de 10 anos. A confiança e segurança que eles nos passam são fundamentais para nosso crescimento. São verdadeiros parceiros estratégicos do nosso negócio.",
      clientImageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&q=80",
      order: 2,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      clientName: "Roberto Oliveira",
      company: "TechInova Ltda",
      testimonialText: "A expertise da Central Contábil em planejamento tributário nos ajudou a economizar milhares de reais anualmente. Além disso, a agilidade no atendimento é impressionante. Recomendo fortemente!",
      clientImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&q=80",
      order: 3,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ];

  const testimonials = propsTestimonials.length > 0 ? propsTestimonials.filter(t => t.isActive) : defaultTestimonials;

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  if (testimonials.length === 0) return null;

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gray-50 relative overflow-hidden">
      {/* Top Divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gray-300 z-20"></div>
      
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1920&h=1080&fit=crop&q=80" 
          alt="Background"
          className="w-full h-full object-cover opacity-[0.08]"
        />
        <div className="absolute inset-0 bg-gray-50/97"></div>
      </div>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] z-10">
        <div className="absolute top-0 right-0 w-48 h-48 sm:w-96 sm:h-96 bg-[#3bb664] filter blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 sm:w-80 sm:h-80 bg-[#3bb664] filter blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-10 sm:mb-14 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 bg-[#3bb664] text-white text-xs font-semibold mb-4 sm:mb-6 uppercase tracking-wider">
            Depoimentos
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
            O Que Nossos Clientes Dizem
          </h2>
          <div className="w-16 sm:w-24 h-1 bg-[#3bb664] mx-auto mb-4 sm:mb-6"></div>
          <p className="text-base sm:text-lg text-gray-700 max-w-3xl mx-auto px-4">
            A satisfação dos nossos clientes é a prova do nosso compromisso com a excelência
            em serviços contábeis e consultoria empresarial.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Main Testimonial */}
          <div className="bg-white border-2 border-gray-300 p-6 sm:p-8 lg:p-12 relative shadow-md">
            <div className="absolute top-0 left-0 w-20 h-1 bg-[#3bb664]"></div>
            
            <div className="text-center relative z-10">
              {/* Avatar */}
              <div className="w-20 h-20 mx-auto mb-6 overflow-hidden border-4 border-gray-300">
                <img 
                  src={testimonials[currentTestimonial].clientImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonials[currentTestimonial].clientName)}&background=3bb664&color=fff&size=200`} 
                  alt={testimonials[currentTestimonial].clientName}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Stars Rating */}
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-[#3bb664] text-[#3bb664]" />
                ))}
              </div>
              
              {/* Content */}
              <div className="mb-8">
                <p className="text-lg text-gray-700 leading-relaxed mb-6 italic max-w-3xl mx-auto">
                  "{testimonials[currentTestimonial].testimonialText}"
                </p>
                <div className="border-t-2 border-gray-300 pt-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {testimonials[currentTestimonial].clientName}
                  </h4>
                  <p className="text-[#3bb664] font-semibold text-base">
                    {testimonials[currentTestimonial].company}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-6 border-t-2 border-gray-300">
              <button 
                onClick={prevTestimonial}
                className="p-2 bg-gray-200 hover:bg-[#3bb664] hover:text-white transition-colors duration-300"
              >
                <ChevronLeft size={20} />
              </button>
              
              {/* Dots Indicator */}
              <div className="flex space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-2 h-2 transition-colors ${
                      index === currentTestimonial ? 'bg-[#3bb664]' : 'bg-gray-400 hover:bg-gray-500'
                    }`}
                  />
                ))}
              </div>
              
              <button 
                onClick={nextTestimonial}
                className="p-2 bg-gray-200 hover:bg-[#3bb664] hover:text-white transition-colors duration-300"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};