import React, { useState, useEffect } from 'react';
import { Menu, X, FileText, Mail } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Configuration } from '../../types';

interface GlobalHeaderProps {
  configuration?: Configuration | null;
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({ configuration }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('inicio');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      setIsScrolled(scrolled);

      // Atualiza item ativo do menu conforme a seção visível
      if (location.pathname === '/' || location.pathname === '/original') {
        const sectionIds = ['inicio', 'sobre', 'servicos', 'beneficios', 'depoimentos', 'contato'];
        let current = 'inicio';
        let minDistance = Infinity;

        sectionIds.forEach((id) => {
          const el = document.getElementById(id);
          if (!el) return;
          const rect = el.getBoundingClientRect();
          const distance = Math.abs(rect.top - 140); // ponto de referência sob o header
          if (distance < minDistance) {
            minDistance = distance;
            current = id;
          }
        });

        setActiveSection(current);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // calcula estado inicial
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const scrollToSection = (sectionId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    // Se não estiver na home, navegar para home com hash
    if (location.pathname !== '/') {
      navigate(`/${sectionId}`);
      setIsMenuOpen(false);
    } else {
      // Se já estiver na home, fazer scroll diretamente
      const element = document.querySelector(sectionId);
      if (element) {
        const headerOffset = 100;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
      setIsMenuOpen(false);
    }
  };

  // Efeito para fazer scroll quando a rota mudar para home com hash
  useEffect(() => {
    if (location.pathname === '/' && location.hash) {
      const sectionId = location.hash;
      const checkAndScroll = () => {
        const element = document.querySelector(sectionId);
        if (element) {
          const headerOffset = 100;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        } else {
          // Tentar novamente após um pequeno delay
          setTimeout(checkAndScroll, 50);
        }
      };
      // Aguardar um pouco para garantir que o DOM foi renderizado
      setTimeout(checkAndScroll, 100);
    }
  }, [location.pathname, location.hash]);

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
    } else {
      // Se já estiver na home, fazer scroll para o topo
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
    setIsMenuOpen(false);
  };

  const isBlogPage = location.pathname.startsWith('/blog');
  const isAdminPage = location.pathname.startsWith('/admin');

  // Não mostrar header em páginas de admin
  if (isAdminPage) {
    return null;
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-lg' : 'bg-transparent'
    }`} style={{ zIndex: 999 }}>
      <div className="container mx-auto px-4 sm:px-6">
        <div className={`flex items-center justify-between transition-all duration-300 ${
          isScrolled ? 'h-20 sm:h-24' : 'h-32 sm:h-36 lg:h-40'
        }`}>
          {/* Logo */}
          <div className="flex items-center py-2">
            {configuration?.logo_dark_url || configuration?.logo_url ? (
              <img 
                src={isScrolled ? (configuration.logo_url || configuration.logo_dark_url) : (configuration.logo_dark_url || configuration.logo_url)} 
                alt={configuration.companyName || 'CENTRAL CONTÁBIL'}
                className={`object-contain transition-all duration-300 ${
                  isScrolled ? 'h-16 sm:h-20 max-w-[160px] sm:max-w-[200px]' : 'h-24 sm:h-32 lg:h-36 max-w-[240px] sm:max-w-[300px] lg:max-w-[360px]'
                }`}
                onError={(e) => {
                  // Se a imagem falhar ao carregar, mostrar fallback de texto
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent && !parent.querySelector('.logo-fallback')) {
                    const isScrolledClass = isScrolled ? 'text-xl sm:text-2xl text-[#3bb664]' : 'text-2xl sm:text-3xl lg:text-4xl text-[#3bb664]';
                    const isScrolledSubClass = isScrolled ? 'text-xs sm:text-sm text-gray-600' : 'text-sm sm:text-base lg:text-lg text-gray-300';
                    parent.innerHTML = `
                      <div class="logo-fallback font-bold tracking-wider transition-all duration-300 ${isScrolledClass}">CENTRAL</div>
                      <div class="logo-fallback ml-1 font-light transition-all duration-300 ${isScrolledSubClass}">CONTÁBIL</div>
                    `;
                  }
                }}
              />
            ) : (
              <>
                <div className={`font-bold tracking-wider transition-all duration-300 ${
                  isScrolled ? 'text-xl sm:text-2xl text-[#3bb664]' : 'text-2xl sm:text-3xl lg:text-4xl text-[#3bb664]'
                }`}>
                  CENTRAL
                </div>
                <div className={`ml-1 font-light transition-all duration-300 ${
                  isScrolled ? 'text-xs sm:text-sm text-gray-600' : 'text-sm sm:text-base lg:text-lg text-gray-300'
                }`}>
                  CONTÁBIL
                </div>
              </>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a 
              href="/"
              onClick={handleHomeClick}
              className={`group relative text-sm font-medium uppercase tracking-wider transition-colors hover:text-[#3bb664] ${
                isScrolled ? 'text-gray-700' : 'text-white'
              } ${activeSection === 'inicio' ? 'text-[#3bb664]' : ''}`}
            >
              Início
              <span className={`absolute bottom-0 left-1/2 h-0.5 bg-[#3bb664] transition-all duration-300 ease-in-out transform -translate-x-1/2 ${
                activeSection === 'inicio'
                  ? 'w-full opacity-100'
                  : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-100'
              }`}></span>
            </a>
            <a 
              href="/#sobre"
              onClick={(e) => scrollToSection('#sobre', e)}
              className={`group relative text-sm font-medium uppercase tracking-wider transition-colors hover:text-[#3bb664] ${
                isScrolled ? 'text-gray-700' : 'text-white'
              } ${activeSection === 'sobre' ? 'text-[#3bb664]' : ''}`}
            >
              Sobre
              <span className={`absolute bottom-0 left-1/2 h-0.5 bg-[#3bb664] transition-all duration-300 ease-in-out transform -translate-x-1/2 ${
                activeSection === 'sobre'
                  ? 'w-full opacity-100'
                  : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-100'
              }`}></span>
            </a>
            <a 
              href="/#servicos"
              onClick={(e) => scrollToSection('#servicos', e)}
              className={`group relative text-sm font-medium uppercase tracking-wider transition-colors hover:text-[#3bb664] ${
                isScrolled ? 'text-gray-700' : 'text-white'
              } ${activeSection === 'servicos' ? 'text-[#3bb664]' : ''}`}
            >
              Serviços
              <span className={`absolute bottom-0 left-1/2 h-0.5 bg-[#3bb664] transition-all duration-300 ease-in-out transform -translate-x-1/2 ${
                activeSection === 'servicos'
                  ? 'w-full opacity-100'
                  : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-100'
              }`}></span>
            </a>
            <a 
              href="/#beneficios"
              onClick={(e) => scrollToSection('#beneficios', e)}
              className={`group relative text-sm font-medium uppercase tracking-wider transition-colors hover:text-[#3bb664] ${
                isScrolled ? 'text-gray-700' : 'text-white'
              } ${activeSection === 'beneficios' ? 'text-[#3bb664]' : ''}`}
            >
              Benefícios Fiscais
              <span className={`absolute bottom-0 left-1/2 h-0.5 bg-[#3bb664] transition-all duration-300 ease-in-out transform -translate-x-1/2 ${
                activeSection === 'beneficios'
                  ? 'w-full opacity-100'
                  : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-100'
              }`}></span>
            </a>
            <a 
              href="/#depoimentos"
              onClick={(e) => scrollToSection('#depoimentos', e)}
              className={`group relative text-sm font-medium uppercase tracking-wider transition-colors hover:text-[#3bb664] ${
                isScrolled ? 'text-gray-700' : 'text-white'
              } ${activeSection === 'depoimentos' ? 'text-[#3bb664]' : ''}`}
            >
              Depoimentos
              <span className={`absolute bottom-0 left-1/2 h-0.5 bg-[#3bb664] transition-all duration-300 ease-in-out transform -translate-x-1/2 ${
                activeSection === 'depoimentos'
                  ? 'w-full opacity-100'
                  : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-100'
              }`}></span>
            </a>
            <Link 
              to="/blog"
              className={`group relative text-sm font-medium uppercase tracking-wider transition-colors hover:text-[#3bb664] ${
                isScrolled ? 'text-gray-700' : 'text-white'
              } ${isBlogPage ? 'text-[#3bb664]' : ''}`}
            >
              Blog
              <span className={`absolute bottom-0 left-1/2 h-0.5 bg-[#3bb664] transition-all duration-300 ease-in-out transform -translate-x-1/2 ${
                isBlogPage ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-100'
              }`}></span>
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button 
              size="sm" 
              className="bg-[#3bb664] hover:bg-[#2d9a4f] text-white"
              onClick={() => {
                if (location.pathname !== '/') {
                  navigate('/');
                  setTimeout(() => scrollToSection('#contato'), 200);
                } else {
                  scrollToSection('#contato');
                }
              }}
            >
              <Mail className="w-4 h-4 mr-2" />
              Contato
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMenu}
            className={`md:hidden p-2 transition-colors ${
              isScrolled ? 'text-gray-700 hover:text-[#3bb664]' : 'text-white hover:text-gray-200'
            }`}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white shadow-lg rounded-lg mt-2 py-4">
            <div className="flex flex-col space-y-2">
              <a 
                href="/"
                onClick={handleHomeClick}
                className="px-6 py-3 text-left text-gray-700 hover:text-[#3bb664] hover:bg-gray-50 transition-colors"
              >
                Início
              </a>
              <a 
                href="/#sobre"
                onClick={(e) => scrollToSection('#sobre', e)}
                className="px-6 py-3 text-left text-gray-700 hover:text-[#3bb664] hover:bg-gray-50 transition-colors"
              >
                Sobre
              </a>
              <a 
                href="/#servicos"
                onClick={(e) => scrollToSection('#servicos', e)}
                className="px-6 py-3 text-left text-gray-700 hover:text-[#3bb664] hover:bg-gray-50 transition-colors"
              >
                Serviços
              </a>
              <a 
                href="/#beneficios"
                onClick={(e) => scrollToSection('#beneficios', e)}
                className="px-6 py-3 text-left text-gray-700 hover:text-[#3bb664] hover:bg-gray-50 transition-colors"
              >
                Benefícios Fiscais
              </a>
              <a 
                href="/#depoimentos"
                onClick={(e) => scrollToSection('#depoimentos', e)}
                className="px-6 py-3 text-left text-gray-700 hover:text-[#3bb664] hover:bg-gray-50 transition-colors"
              >
                Depoimentos
              </a>
              <Link 
                to="/blog"
                className="px-6 py-3 text-left text-gray-700 hover:text-[#3bb664] hover:bg-gray-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Blog
              </Link>
              <div className="px-6 py-3">
                <Button 
                  size="sm" 
                  className="w-full bg-[#3bb664] hover:bg-[#2d9a4f] text-white"
                  onClick={() => {
                    if (location.pathname !== '/') {
                      navigate('/');
                      setTimeout(() => scrollToSection('#contato'), 200);
                    } else {
                      scrollToSection('#contato');
                    }
                  }}
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