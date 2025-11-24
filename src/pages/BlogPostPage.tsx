import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BlogPost } from '../types';
import { FooterBlake } from '../components/layout/FooterBlake';
import { Button } from '../components/ui/Button';
import { useConfiguration } from '../hooks/useConfiguration';
import { Calendar, User, ArrowLeft, Clock, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { configuration } = useConfiguration();

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

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

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/blog/posts/${slug}`);
      if (response.ok) {
        const data = await response.json();
        console.log('📝 Post recebido da API:', data);
        const normalizedPost = normalizePost(data);
        console.log('📝 Post normalizado:', normalizedPost);
        setPost(normalizedPost);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erro ao carregar post:', response.status, errorData);
        setError('Post não encontrado');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar post:', error);
      setError('Erro ao carregar o post');
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

  const formatReadingTime = (content: string) => {
    if (!content) return '0 min de leitura';
    const wordsPerMinute = 200;
    // Remove HTML tags e conta apenas palavras de texto
    const textContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const words = textContent.split(/\s+/).filter(word => word.length > 0).length;
    const minutes = Math.max(1, Math.ceil(words / wordsPerMinute));
    return `${minutes} min de leitura`;
  };

  const shareOnSocial = (platform: string) => {
    if (!post) return;
    
    const url = window.location.href;
    const title = post.title;
    
    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
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

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Post não encontrado'}
          </h1>
          <Link to="/blog">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para o Blog
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
          {post.featuredImageUrl ? (
            <img 
              src={post.featuredImageUrl}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <img 
              src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1920&h=600&fit=crop&q=80" 
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
            <Link to="/blog" className="inline-flex items-center text-gray-300 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para o Blog
            </Link>
          </div>
          
          <div className="max-w-4xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center text-gray-200 text-sm space-y-2 md:space-y-0">
              <div className="flex items-center mr-4">
                <Calendar className="w-4 h-4 mr-1" />
                {formatDate(post.publishedAt || post.createdAt || post.published_at || post.created_at)}
              </div>
              <div className="flex items-center mr-4">
                <User className="w-4 h-4 mr-1" />
                {post.author || 'Autor desconhecido'}
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {formatReadingTime(post.content || '')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Post Content */}
      <article className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {post.excerpt && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8 rounded-r-lg">
              <p className="text-lg text-blue-800 italic">{post.excerpt}</p>
            </div>
          )}

          <div className="prose prose-lg max-w-none mb-12">
            {post.content ? (
              <div 
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            ) : (
              <p className="text-gray-500 italic">Conteúdo não disponível</p>
            )}
          </div>

          {/* Share Section */}
          <div className="border-t pt-8">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Compartilhe este post</h3>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareOnSocial('facebook')}
                  className="flex items-center"
                >
                  <Facebook className="w-4 h-4 mr-2" />
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareOnSocial('twitter')}
                  className="flex items-center"
                >
                  <Twitter className="w-4 h-4 mr-2" />
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareOnSocial('linkedin')}
                  className="flex items-center"
                >
                  <Linkedin className="w-4 h-4 mr-2" />
                  LinkedIn
                </Button>
              </div>
            </div>
          </div>
        </div>
      </article>

      <FooterBlake configuration={configuration} />
    </div>
  );
};