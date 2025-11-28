import React, { useState, useEffect, useRef } from 'react';
import * as LucideIcons from 'lucide-react';

interface CounterProps {
  end: number;
  duration: number;
  suffix?: string;
}

const Counter: React.FC<CounterProps> = ({ end, duration, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let start = 0;
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [end, duration, isVisible]);

  return (
    <div ref={ref} className="text-5xl font-bold text-white">
      {count}{suffix}
    </div>
  );
};

interface FunFact {
  id: string;
  icon: string;
  label: string;
  value: string;
  suffix?: string | null;
  order: number;
  is_active: boolean;
}

export const FunFactsSectionBlake: React.FC = () => {
  const [funFacts, setFunFacts] = useState<FunFact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFunFacts = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'http://localhost:3006/api');
        const response = await fetch(`${API_BASE_URL}/sections/fun-facts`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.funFacts) {
            setFunFacts(data.funFacts.filter((f: FunFact) => f.is_active));
          }
        }
      } catch (error) {
        console.error('Erro ao carregar números:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFunFacts();
  }, []);

  const getIconComponent = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    if (IconComponent) {
      return <IconComponent className="w-12 h-12" />;
    }
    return <LucideIcons.Circle className="w-12 h-12" />;
  };

  const parseValue = (value: string): number => {
    // Remove caracteres não numéricos e converte para número
    const numericValue = value.replace(/[^0-9]/g, '');
    return parseInt(numericValue) || 0;
  };

  const extractSuffix = (value: string, suffix?: string | null): string => {
    // Se já tem sufixo no value (ex: "500+"), extrai
    if (value.includes('+') || value.includes('-') || value.includes('%')) {
      const match = value.match(/[+\-%]/);
      return match ? match[0] : (suffix || '');
    }
    // Caso contrário, usa o suffix do banco
    return suffix || '';
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3bb664]"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1920&h=1080&fit=crop&q=80" 
          alt="Escritório contábil profissional"
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-black/95"></div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2320c997' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] repeat"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-[#3bb664]/10 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-[#3bb664]/10 rounded-full filter blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-[#3bb664]/20 text-[#3bb664] rounded-full text-sm font-medium mb-6 border border-[#3bb664]/30">
            Nossos Números
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Números que Falam por Si
          </h2>
          <div className="w-24 h-1 bg-[#3bb664] mx-auto mb-6"></div>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Mais de três décadas construindo histórias de sucesso e transformando 
            a gestão contábil de empresas em todo o Espírito Santo.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {funFacts.length > 0 ? (
            funFacts.map((fact) => {
              const numericValue = parseValue(fact.value);
              const suffix = extractSuffix(fact.value, fact.suffix);
              return (
                <div 
                  key={fact.id}
                  className="text-center group relative p-8 bg-white/5 border-2 border-white/10 hover:border-[#3bb664]/50 transition-all duration-300 hover:bg-white/10"
                >
                  <div className="relative z-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#3bb664] mb-6 group-hover:bg-[#2d9a4f] transition-colors duration-300">
                      <div className="text-white">
                        {getIconComponent(fact.icon)}
                      </div>
                    </div>
                    <Counter end={numericValue} duration={2000} suffix={suffix} />
                    <div className="text-gray-300 text-xs uppercase tracking-wider mt-2 font-semibold">
                      {fact.label}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-4 text-center text-gray-400 py-8">
              Nenhum número cadastrado
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-white/10 border-2 border-white/20 px-8 py-5">
            <span className="text-white text-base font-medium">Pronto para fazer parte desses números?</span>
            <button 
              className="bg-[#3bb664] text-white px-6 py-2.5 font-semibold hover:bg-[#2d9a4f] transition-colors duration-300 uppercase tracking-wider text-sm"
              onClick={() => document.querySelector('#contato')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Comece Agora
            </button>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-[#3bb664]/20 rounded-full blur-2xl"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-[#3bb664]/20 rounded-full blur-2xl"></div>
    </section>
  );
};