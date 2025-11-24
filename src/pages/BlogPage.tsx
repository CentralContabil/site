import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BlogPost } from '../types';
import { FooterBlake } from '../components/layout/FooterBlake';
import { Button } from '../components/ui/Button';
import { useConfiguration } from '../hooks/useConfiguration';
import { Calendar, Clock, User, ArrowLeft } from 'lucide-react';

export const BlogPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { configuration } = useConfiguration();

  useEffect(() => {
    fetchPosts();
  }, []);

  const normalizePost = (post: any): BlogPost => {
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || undefined,
      content: post.content,
      featuredImageUrl: post.featured_image_url || post.featuredImageUrl || undefined,
      featured_image_url: post.featured_image_url || post.featuredImageUrl || undefined,
      author: post.author,
      isPublished: post.is_published !== undefined ? post.is_published : post.isPublished,
      is_published: post.is_published !== undefined ? post.is_published : post.isPublished,
      publishedAt: post.published_at ? new Date(post.published_at) : post.publishedAt,
      published_at: post.published_at || post.publishedAt,
      createdAt: post.created_at ? new Date(post.created_at) : new Date(post.createdAt || Date.now()),
      created_at: post.created_at || post.createdAt,
      updatedAt: post.updated_at ? new Date(post.updated_at) : new Date(post.updatedAt || Date.now()),
      updated_at: post.updated_at || post.updatedAt,
    };
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/blog/posts?published=true');
      if (response.ok) {
        const data = await response.json();
        console.log('📝 Posts recebidos da API (público):', data);
        // Normalizar os dados recebidos da API
        const normalizedPosts = Array.isArray(data) ? data.map(normalizePost) : [];
        console.log('📝 Posts normalizados (público):', normalizedPosts);
        setPosts(normalizedPosts);
        setError(null);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erro ao carregar posts:', response.status, errorData);
        setError(`Erro ${response.status}: ${errorData.error || 'Erro ao carregar posts'}`);
      }
    } catch (error: any) {
      console.error('❌ Erro ao carregar posts:', error);
      setError(error?.message || 'Erro de conexão ao carregar posts');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return 'Data não disponível';
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      if (isNaN(dateObj.getTime())) return 'Data inválida';
      return format(dateObj, 'dd \'de\' MMMM \'de\' yyyy', { locale: ptBR });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative text-white pt-32 sm:pt-36 lg:pt-40 pb-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1920&h=600&fit=crop&q=80" 
            alt="Background"
            className="w-full h-full object-cover"
          />
          {/* Overlay com transparência */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-800/75 to-gray-900/80"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Blog
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Fique por dentro das últimas novidades, dicas e informações sobre contabilidade e gestão empresarial
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Home
            </Link>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">
                <strong>Erro:</strong> {error}
              </p>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3bb664]"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">
                Nenhum post publicado ainda.
              </div>
              <p className="text-gray-400">
                Em breve traremos conteúdos incríveis para você!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  {(post.featuredImageUrl || post.featured_image_url) && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={post.featuredImageUrl || post.featured_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <div className="flex items-center mr-4">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(post.publishedAt || post.published_at || post.createdAt || post.created_at)}
                      </div>
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {post.author || 'Autor'}
                      </div>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      <Link to={`/blog/${post.slug}`} className="hover:text-[#3bb664] transition-colors">
                        {post.title}
                      </Link>
                    </h2>

                    {post.excerpt && (
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}

                    <Link to={`/blog/${post.slug}`}>
                      <Button 
                        variant="outline" 
                        className="w-full hover:bg-[#3bb664] hover:text-white hover:border-[#3bb664] transition-colors"
                      >
                        Ler mais
                      </Button>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <FooterBlake configuration={configuration} />
    </div>
  );
};