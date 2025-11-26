import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';

// Componentes SVG das bandeiras
const FlagBR: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 20 14" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Campo verde */}
    <rect width="20" height="14" fill="#009739"/>
    {/* Losango amarelo */}
    <path d="M10 0 L20 7 L10 14 L0 7 Z" fill="#FEDD00"/>
    {/* Círculo azul */}
    <circle cx="10" cy="7" r="3.2" fill="#002776"/>
    {/* Faixa branca curvada */}
    <path d="M6.8 6.3 Q10 5.8 13.2 6.3" stroke="#FFFFFF" strokeWidth="0.35" fill="none" strokeLinecap="round"/>
    {/* Estrelas do Cruzeiro do Sul (representação simplificada) */}
    <g fill="#FFFFFF">
      {/* Estrela maior acima da faixa */}
      <path d="M10 5.5 L10.2 6 L10.7 6 L10.35 6.35 L10.5 6.85 L10 6.6 L9.5 6.85 L9.65 6.35 L9.3 6 L9.8 6 Z"/>
      {/* Estrelas menores abaixo da faixa */}
      <path d="M11.2 7.8 L11.3 8.1 L11.6 8.1 L11.4 8.3 L11.5 8.6 L11.2 8.4 L10.9 8.6 L11 8.3 L10.8 8.1 L11.1 8.1 Z"/>
      <path d="M9.2 8.5 L9.3 8.8 L9.6 8.8 L9.4 9 L9.5 9.3 L9.2 9.1 L8.9 9.3 L9 9 L8.8 8.8 L9.1 8.8 Z"/>
      <path d="M8.2 7.5 L8.3 7.8 L8.6 7.8 L8.4 8 L8.5 8.3 L8.2 8.1 L7.9 8.3 L8 8 L7.8 7.8 L8.1 7.8 Z"/>
    </g>
  </svg>
);

const FlagUS: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 20 14" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect width="20" height="14" fill="#b22234"/>
    <path d="M0 0h20v1.1H0z" fill="#fff"/>
    <path d="M0 2.2h20v1.1H0z" fill="#fff"/>
    <path d="M0 4.4h20v1.1H0z" fill="#fff"/>
    <path d="M0 6.6h20v1.1H0z" fill="#fff"/>
    <path d="M0 8.8h20v1.1H0z" fill="#fff"/>
    <path d="M0 11h20v1.1H0z" fill="#fff"/>
    <rect width="8" height="7.7" fill="#3c3b6e"/>
    <path d="M0 0h8v1.1H0z" fill="#fff"/>
    <path d="M0 2.2h8v1.1H0z" fill="#fff"/>
    <path d="M0 4.4h8v1.1H0z" fill="#fff"/>
  </svg>
);

const FlagES: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 20 14" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect width="20" height="4.67" fill="#AA151B"/>
    <rect y="4.67" width="20" height="4.67" fill="#F1BF00"/>
    <rect y="9.33" width="20" height="4.67" fill="#AA151B"/>
  </svg>
);

const languages = [
  { code: 'pt-BR', name: 'Português', flag: '🇧🇷', FlagComponent: FlagBR },
  { code: 'en', name: 'English', flag: '🇺🇸', FlagComponent: FlagUS },
  { code: 'es', name: 'Español', flag: '🇪🇸', FlagComponent: FlagES },
];

interface LanguageSelectorProps {
  isScrolled?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ isScrolled = false }) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(languages[0]);

  // Normalizar o código do idioma (pode vir como 'pt-BR', 'pt', 'en', 'es', etc.)
  const normalizeLanguageCode = (code: string): string => {
    if (code.startsWith('pt')) return 'pt-BR';
    if (code.startsWith('en')) return 'en';
    if (code.startsWith('es')) return 'es';
    return code;
  };

  // Atualizar o idioma atual quando i18n.language mudar
  useEffect(() => {
    const currentLangCode = normalizeLanguageCode(i18n.language || 'pt-BR');
    const foundLang = languages.find(lang => lang.code === currentLangCode) || languages[0];
    setCurrentLang(foundLang);
  }, [i18n.language]);

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg transition-colors ${
          isScrolled 
            ? 'hover:bg-gray-100 text-gray-700' 
            : 'hover:bg-white/10 text-white'
        }`}
        aria-label={`Selecionar idioma - ${currentLang.name}`}
      >
        {currentLang.FlagComponent ? (
          <currentLang.FlagComponent className="w-6 h-6 flex-shrink-0" />
        ) : (
          <span 
            className="text-2xl leading-none select-none" 
            role="img" 
            aria-label={currentLang.name}
            style={{ 
              display: 'inline-block',
              lineHeight: '1',
              fontSize: '1.5rem',
              minWidth: '1.5rem',
              textAlign: 'center'
            }}
          >
            {currentLang.flag}
          </span>
        )}
        <ChevronDown className={`w-3 h-3 transition-all ${isOpen ? 'rotate-180' : ''} ${
          isScrolled ? 'text-gray-700' : 'text-white'
        }`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            {languages.map((lang) => {
              const isActive = normalizeLanguageCode(i18n.language || 'pt-BR') === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                    isActive ? 'bg-green-50 text-green-700' : 'text-gray-700'
                  }`}
                >
                  {lang.FlagComponent ? (
                    <lang.FlagComponent className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <span 
                      className="text-lg select-none" 
                      role="img" 
                      aria-label={lang.name}
                      style={{ 
                        display: 'inline-block',
                        lineHeight: '1'
                      }}
                    >
                      {lang.flag}
                    </span>
                  )}
                  <span className="text-sm font-medium">{lang.name}</span>
                  {isActive && (
                    <span className="ml-auto text-green-600">✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};



