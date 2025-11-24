import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Service } from '../types';
import { FooterBlake } from '../components/layout/FooterBlake';
import { Button } from '../components/ui/Button';
import { useConfiguration } from '../hooks/useConfiguration';
import { ArrowLeft, CheckCircle } from 'lucide-react';

export const ServicePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { configuration } = useConfiguration();

  useEffect(() => {
    if (slug) {
      fetchService();
    }
  }, [slug]);

  const normalizeService = (service: any): Service => {
    return {
      id: service.id,
      name: service.name,
      slug: service.slug,
      description: service.description,
      content: service.content,
      icon: service.icon,
      imageUrl: service.image_url || service.imageUrl,
      image_url: service.image_url || service.imageUrl,
      order: service.order,
      isActive: service.is_active !== undefined ? service.is_active : service.isActive,
      is_active: service.is_active !== undefined ? service.is_active : service.isActive,
      createdAt: service.created_at ? new Date(service.created_at) : new Date(service.createdAt || Date.now()),
      created_at: service.created_at || service.createdAt,
      updatedAt: service.updated_at ? new Date(service.updated_at) : new Date(service.updatedAt || Date.now()),
      updated_at: service.updated_at || service.updatedAt,
    };
  };

  const fetchService = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/services/slug/${slug}`);
      if (response.ok) {
        const data = await response.json();
        console.log('📋 Serviço recebido da API:', data);
        const normalizedService = normalizeService(data);
        console.log('📋 Serviço normalizado:', normalizedService);
        setService(normalizedService);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erro ao carregar serviço:', response.status, errorData);
        setError('Serviço não encontrado');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar serviço:', error);
      setError('Erro ao carregar o serviço');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Serviço não encontrado'}
          </h1>
          <Link to="/#servicos">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Serviços
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative text-white pt-32 sm:pt-36 lg:pt-40 pb-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          {service.imageUrl ? (
            <img 
              src={service.imageUrl}
              alt={service.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <img 
              src="https://images.unsplash.com/photo-1554224155-6726b468ff31?w=1920&h=600&fit=crop&q=80" 
              alt="Background"
              className="w-full h-full object-cover"
            />
          )}
          {/* Overlay com transparência */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-800/75 to-gray-900/80"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link to="/#servicos" className="inline-flex items-center text-gray-300 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Serviços
            </Link>
          </div>
          
          <div className="max-w-4xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              {service.name}
            </h1>
            
            <p className="text-xl text-gray-200 max-w-2xl">
              {service.description}
            </p>
          </div>
        </div>
      </section>

      {/* Service Content */}
      <article className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {service.content ? (
            <div className="prose prose-lg max-w-none mb-12">
              <div 
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: service.content }}
              />
            </div>
          ) : (
            <div className="mb-12">
              <p className="text-lg text-gray-700 leading-relaxed">
                {service.description}
              </p>
            </div>
          )}

          {/* CTA Section */}
          <div className="bg-gray-100 border-2 border-gray-300 p-8 rounded-lg shadow-md">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Entre em Contato
              </h3>
              <p className="text-gray-700 mb-6">
                Está interessado em nossos serviços? Entre em contato conosco e solicite um orçamento personalizado.
              </p>
              <Link to="/#contato">
                <Button className="bg-[#3bb664] hover:bg-[#2d9a4f] text-white">
                  Solicitar Orçamento
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </article>

      <FooterBlake configuration={configuration} />
    </div>
  );
};



