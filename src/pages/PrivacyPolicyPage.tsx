import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FooterBlake } from '../components/layout/FooterBlake';
import { Button } from '../components/ui/Button';
import { SEO } from '../components/SEO';
import { useConfiguration } from '../hooks/useConfiguration';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { apiService } from '../services/api';

interface PrivacyPolicy {
  id: string;
  title: string;
  content: string;
  background_image_url?: string | null;
}

export const PrivacyPolicyPage: React.FC = () => {
  const [policy, setPolicy] = useState<PrivacyPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [consentGiven, setConsentGiven] = useState<boolean | null>(null);
  const { configuration } = useConfiguration();

  useEffect(() => {
    fetchPolicy();
    checkConsent();
  }, []);

  const fetchPolicy = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPrivacyPolicy();
      if (response.success && response.policy) {
        setPolicy(response.policy);
      }
    } catch (error: any) {
      console.error('Erro ao carregar política:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkConsent = () => {
    const consent = localStorage.getItem('lgpd_consent');
    if (consent === 'true') {
      setConsentGiven(true);
    } else if (consent === 'false') {
      setConsentGiven(false);
    } else {
      setConsentGiven(null);
    }
  };

  const handleConsent = (accepted: boolean) => {
    localStorage.setItem('lgpd_consent', accepted.toString());
    localStorage.setItem('lgpd_consent_date', new Date().toISOString());
    setConsentGiven(accepted);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3bb664]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Política de Privacidade"
        description="Política de privacidade e conformidade com a LGPD - Lei Geral de Proteção de Dados"
        keywords="política de privacidade, LGPD, proteção de dados, privacidade"
        configuration={configuration}
      />
      {/* Hero Section */}
      <section className="relative text-white pt-32 sm:pt-36 lg:pt-40 pb-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          {policy?.background_image_url ? (
            <img 
              src={policy.background_image_url}
              alt="Background"
              className="w-full h-full object-cover"
            />
          ) : (
            <img 
              src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&h=600&fit=crop&q=80" 
              alt="Background"
              className="w-full h-full object-cover"
            />
          )}
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-800/75 to-gray-900/80"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {policy?.title || 'Política de Privacidade'}
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Conformidade com a LGPD - Lei Geral de Proteção de Dados
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Home
            </Link>
          </div>

          {/* Consent Banner */}
          {consentGiven === null && (
            <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                Consentimento para Tratamento de Dados
              </h3>
              <p className="text-blue-800 mb-4">
                Para continuar utilizando nossos serviços, precisamos do seu consentimento para o tratamento de seus dados pessoais, 
                conforme estabelecido na Lei Geral de Proteção de Dados (LGPD).
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => handleConsent(true)}
                  style={{ backgroundColor: '#3bb664' }}
                  className="flex items-center"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Aceitar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleConsent(false)}
                  className="flex items-center"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Recusar
                </Button>
              </div>
            </div>
          )}

          {/* Consent Status */}
          {consentGiven !== null && (
            <div className={`mb-8 rounded-lg p-4 ${
              consentGiven 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center">
                {consentGiven ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <p className="text-green-800 font-medium">
                      Você aceitou o tratamento de seus dados pessoais.
                    </p>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-600 mr-2" />
                    <p className="text-red-800 font-medium">
                      Você recusou o tratamento de seus dados pessoais.
                    </p>
                  </>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    localStorage.removeItem('lgpd_consent');
                    localStorage.removeItem('lgpd_consent_date');
                    setConsentGiven(null);
                  }}
                  className="ml-auto"
                >
                  Alterar Consentimento
                </Button>
              </div>
            </div>
          )}

          {/* Policy Content */}
          <div className="bg-white rounded-lg shadow-md p-8 prose prose-lg max-w-none prose-gray">
            {policy?.content ? (
              <div 
                className="text-gray-900 prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-a:text-[#3bb664] prose-a:hover:text-[#2d9a4f] prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:text-gray-700"
                dangerouslySetInnerHTML={{ __html: policy.content }} 
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  A política de privacidade ainda não foi configurada.
                </p>
              </div>
            )}
          </div>

          {/* Last Updated */}
          {policy && (
            <div className="mt-8 text-center text-sm text-gray-500">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </div>
          )}
        </div>
      </section>

      <FooterBlake configuration={configuration} />
    </div>
  );
};

