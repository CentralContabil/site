import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, CheckCircle, XCircle } from 'lucide-react';
import { Button } from './ui/Button';

export const LGPDConsentBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [consentGiven, setConsentGiven] = useState<boolean | null>(null);

  useEffect(() => {
    // Verificar se o usuário já deu consentimento
    const consent = localStorage.getItem('lgpd_consent');
    if (!consent) {
      // Se não houver consentimento, mostrar o banner após 1 segundo
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setConsentGiven(consent === 'true');
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('lgpd_consent', 'true');
    localStorage.setItem('lgpd_consent_date', new Date().toISOString());
    setConsentGiven(true);
    setShowBanner(false);
  };

  const handleReject = () => {
    localStorage.setItem('lgpd_consent', 'false');
    localStorage.setItem('lgpd_consent_date', new Date().toISOString());
    setConsentGiven(false);
    setShowBanner(false);
  };

  const handleClose = () => {
    setShowBanner(false);
    // Salvar que o usuário fechou sem escolher (opcional)
    localStorage.setItem('lgpd_banner_closed', 'true');
  };

  // Não mostrar se o usuário já fechou o banner anteriormente (opcional)
  if (!showBanner || localStorage.getItem('lgpd_banner_closed') === 'true') {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-gray-200 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Política de Privacidade e Cookies
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              Utilizamos cookies e tecnologias semelhantes para melhorar sua experiência em nosso site. 
              Ao continuar navegando, você concorda com nossa{' '}
              <Link 
                to="/politica-de-privacidade" 
                className="text-[#3bb664] hover:underline font-medium"
              >
                Política de Privacidade
              </Link>
              {' '}e com o tratamento de seus dados pessoais conforme a LGPD.
            </p>
          </div>
          
          <div className="flex items-center gap-3 flex-shrink-0">
            <Button
              variant="outline"
              onClick={handleReject}
              className="text-sm"
            >
              <XCircle className="w-4 h-4 mr-1" />
              Recusar
            </Button>
            <Button
              onClick={handleAccept}
              style={{ backgroundColor: '#3bb664' }}
              className="text-sm"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Aceitar
            </Button>
            <button
              onClick={handleClose}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

