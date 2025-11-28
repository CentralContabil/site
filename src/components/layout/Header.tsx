import React, { useState, useEffect } from 'react';
import { Menu, X, Search, FileText, Mail } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Configuration } from '../../types';

interface HeaderProps {
  configuration?: Configuration | null;
}

export const Header: React.FC<HeaderProps> = ({ configuration }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('inicio');
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      setIsScrolled(scrolled);

       // Destaque do item de menu conforme a seção visível
       const sections = ['inicio', 'sobre', 'servicos', 'beneficios', 'depoimentos', 'contato'];
       let current = 'inicio';
       let minDistance = Infinity;

       sections.forEach((id) => {
         const element = document.getElementById(id);
         if (!element) return;
         const rect = element.getBoundingClientRect();
         const distance = Math.abs(rect.top - 140); // ajusta ponto de referência próximo ao topo
         if (distance < minDistance) {
           minDistance = distance;
           current = id;
         }
       });

       setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // calcular estado inicial
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const isBlogPage = location.pathname.startsWith('/blog');

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-lg' : 'bg-transparent'
    }`} style={{ zIndex: 999 }}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <div className="flex items-center py-2">
            {/* Logo padrão (escura) para header transparente */}
            {!isScrolled && configuration?.logo_dark_url ? (
              <img 
                src={configuration.logo_dark_url} 
                alt={configuration.companyName || 'CENTRAL CONTÁBIL'}
                className="h-20 object-contain max-w-[200px]"
              />
            ) : isScrolled && configuration?.logo_url ? (
              /* Logo principal para header branco (quando rolado) */
              <img 
                src={configuration.logo_url} 
                alt={configuration.companyName || 'CENTRAL CONTÁBIL'}
                className="h-20 object-contain max-w-[200px]"
              />
            ) : !isScrolled && configuration?.logo_url ? (
              /* Fallback para logo principal se logo escura não existir */
              <img 
                src={configuration.logo_url} 
                alt={configuration.companyName || 'CENTRAL CONTÁBIL'}
                className="h-20 object-contain max-w-[200px]"
              />
            ) : (
              /* Texto fallback se nenhuma logo estiver disponível */
              <>
                <div className="text-2xl font-bold text-[#20c997] tracking-wider">
                  CENTRAL
                </div>
                <div className="ml-1 text-sm text-gray-600 font-light">
                  CONTÁBIL
                </div>
              </>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {!isBlogPage && (
              <>
                <button 
                  onClick={() => scrollToSection('#inicio')}
                  className={`text-sm font-medium uppercase tracking-wider transition-colors border-b-2 ${
                    isScrolled ? 'text-gray-700 hover:text-[#20c997]' : 'text-white hover:text-gray-200'
                  } ${activeSection === 'inicio' ? 'border-[#20c997] text-[#20c997]' : 'border-transparent'}`}
                >
                  Início
                </button>
                <button 
                  onClick={() => scrollToSection('#sobre')}
                  className={`text-sm font-medium uppercase tracking-wider transition-colors border-b-2 ${
                    isScrolled ? 'text-gray-700 hover:text-[#20c997]' : 'text-white hover:text-gray-200'
                  } ${activeSection === 'sobre' ? 'border-[#20c997] text-[#20c997]' : 'border-transparent'}`}
                >
                  Sobre
                </button>
                <button 
                  onClick={() => scrollToSection('#servicos')}
                  className={`text-sm font-medium uppercase tracking-wider transition-colors border-b-2 ${
                    isScrolled ? 'text-gray-700 hover:text-[#20c997]' : 'text-white hover:text-gray-200'
                  } ${activeSection === 'servicos' ? 'border-[#20c997] text-[#20c997]' : 'border-transparent'}`}
                >
                  Serviços
                </button>
                <button 
                  onClick={() => scrollToSection('#beneficios')}
                  className={`text-sm font-medium uppercase tracking-wider transition-colors border-b-2 ${
                    isScrolled ? 'text-gray-700 hover:text-[#20c997]' : 'text-white hover:text-gray-200'
                  } ${activeSection === 'beneficios' ? 'border-[#20c997] text-[#20c997]' : 'border-transparent'}`}
                >
                  Benefícios Fiscais
                </button>
                <button 
                  onClick={() => scrollToSection('#depoimentos')}
                  className={`text-sm font-medium uppercase tracking-wider transition-colors border-b-2 ${
                    isScrolled ? 'text-gray-700 hover:text-[#20c997]' : 'text-white hover:text-gray-200'
                  } ${activeSection === 'depoimentos' ? 'border-[#20c997] text-[#20c997]' : 'border-transparent'}`}
                >
                  Depoimentos
                </button>
              </>
            )}
            <Link 
              to="/blog"
              className={`text-sm font-medium uppercase tracking-wider transition-colors flex items-center ${
                isScrolled ? 'text-gray-700 hover:text-[#20c997]' : 'text-white hover:text-gray-200'
              } ${isBlogPage ? 'text-[#20c997] !text-[#20c997]' : ''}`}
            >
              <FileText className="w-4 h-4 mr-1" />
              Blog
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button className={`p-2 transition-colors ${
              isScrolled ? 'text-gray-600 hover:text-[#20c997]' : 'text-white hover:text-gray-200'
            }`}>
              <Search size={18} />
            </button>
            <Button 
              size="sm" 
              className="bg-[#20c997] hover:bg-[#1aa37e] text-white"
              onClick={() => scrollToSection('#contato')}
            >
              <Mail className="w-4 h-4 mr-2" />
              Contato
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMenu}
            className={`md:hidden p-2 transition-colors ${
              isScrolled ? 'text-gray-700 hover:text-[#20c997]' : 'text-white hover:text-gray-200'
            }`}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white shadow-lg rounded-lg mt-2 py-4">
            <div className="flex flex-col space-y-2">
              {!isBlogPage && (
                <>
                  <button 
                    onClick={() => scrollToSection('#inicio')}
                    className="px-6 py-3 text-left text-gray-700 hover:text-[#20c997] hover:bg-gray-50 transition-colors"
                  >
                    Início
                  </button>
                  <button 
                    onClick={() => scrollToSection('#sobre')}
                    className="px-6 py-3 text-left text-gray-700 hover:text-[#20c997] hover:bg-gray-50 transition-colors"
                  >
                    Sobre
                  </button>
                  <button 
                    onClick={() => scrollToSection('#servicos')}
                    className="px-6 py-3 text-left text-gray-700 hover:text-[#20c997] hover:bg-gray-50 transition-colors"
                  >
                    Serviços
                  </button>
                  <button 
                    onClick={() => scrollToSection('#beneficios')}
                    className="px-6 py-3 text-left text-gray-700 hover:text-[#20c997] hover:bg-gray-50 transition-colors"
                  >
                    Benefícios Fiscais
                  </button>
                  <button 
                    onClick={() => scrollToSection('#depoimentos')}
                    className="px-6 py-3 text-left text-gray-700 hover:text-[#20c997] hover:bg-gray-50 transition-colors"
                  >
                    Depoimentos
                  </button>
                </>
              )}
              <Link 
                to="/blog"
                className="px-6 py-3 text-left text-gray-700 hover:text-[#20c997] hover:bg-gray-50 transition-colors flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <FileText className="w-4 h-4 mr-2" />
                Blog
              </Link>
              <div className="px-6 py-3">
                <Button 
                  size="sm" 
                  className="w-full bg-[#20c997] hover:bg-[#1aa37e] text-white"
                  onClick={() => scrollToSection('#contato')}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contato
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};