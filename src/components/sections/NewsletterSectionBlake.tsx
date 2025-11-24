import React, { useState } from 'react';
import { Mail, Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '@/services/api';

export const NewsletterSectionBlake: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const backgroundImage = 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1600&h=900&auto=format&fit=crop&q=80&sat=-30';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Informe um email válido');
      return;
    }

    setIsLoading(true);
    try {
      await apiService.subscribeNewsletter({
        email: email.trim().toLowerCase(),
      });

      setIsSubscribed(true);
      setFeedbackMessage('Obrigado! Agora você receberá nossas novidades diretamente no seu inbox.');
      setEmail('');
      toast.success('Inscrição confirmada!');
      
      setTimeout(() => {
        setIsSubscribed(false);
        setFeedbackMessage('');
      }, 5000);
    } catch (error: any) {
      if (error?.response?.data?.error === 'Email já cadastrado' || error?.status === 409) {
        toast.error('Esse email já está na lista');
      } else {
        toast.error(error?.message || 'Erro ao enviar o formulário');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section
      className="relative overflow-hidden py-24 text-white"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(32,201,151,0.9), rgba(13,90,57,0.85)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-4 uppercase tracking-wider">
              Fique por Dentro
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Receba nossas novidades, dicas contábeis e atualizações sobre o mercado 
              diretamente em seu e-mail.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            {isSubscribed ? (
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 border border-white/30">
                <div className="flex items-center justify-center mb-4">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Obrigado por se Inscrever!
                </h3>
                <p className="text-white/90">
                  Você receberá nossas novidades em breve.
                </p>
            {feedbackMessage && (
              <p className="text-white/80 text-sm mt-2">
                {feedbackMessage}
              </p>
            )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Seu melhor e-mail"
                    className="w-full px-6 py-4 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="absolute right-2 top-2 bg-white text-[#20c997] px-6 py-2 rounded-full font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-[#20c997] border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Send size={16} className="mr-2" />
                        Inscrever
                      </>
                    )}
                  </button>
                </div>
                
                <p className="text-white/80 text-sm">
                  Prometemos não enviar spam. Você pode se desinscrever a qualquer momento.
                </p>
              </form>
            )}
          </div>

          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="text-center">
              <div className="text-white/90 text-sm">
                ✓ Dicas de gestão financeira
              </div>
            </div>
            <div className="text-center">
              <div className="text-white/90 text-sm">
                ✓ Atualizações fiscais e tributárias
              </div>
            </div>
            <div className="text-center">
              <div className="text-white/90 text-sm">
                ✓ Estratégias de otimização
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};