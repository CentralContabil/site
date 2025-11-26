import React, { useState, useEffect } from 'react';
import { Menu, X, FileText, Calendar, Mail } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Configuration } from '../../types';
import { LanguageSelector } from '../LanguageSelector';
import { useTranslation } from 'react-i18next';

interface GlobalHeaderProps {
  configuration?: Configuration | null;
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({ configuration }) => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      setIsScrolled(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Detectar seção ativa durante o scroll
  useEffect(() => {
    // Só funciona na home page
    if (location.pathname !== '/') {
      setActiveSection('');
      return;
    }

    let cleanup: (() => void) | null = null;
    let timeoutId: NodeJS.Timeout | null = null;
    let loadHandler: (() => void) | null = null;

    // Aguardar um pouco para garantir que o DOM foi renderizado
    const initScrollDetection = () => {
      // Mapeamento: id da seção -> id usado no estado
      const sectionMap: { [key: string]: string } = {
        'inicio': 'inicio',
        'features': 'features', // Adicionar features ao mapeamento
        'sobre': 'sobre',
        'servicos': 'servicos',
        'beneficios-fiscais': 'beneficios-fiscais',
        'depoimentos': 'depoimentos',
        'contato': 'contato',
      };

      const sections = Object.keys(sectionMap);
      const sectionElements: { id: string; element: Element }[] = [];

      // Coletar todos os elementos das seções
      sections.forEach((sectionId) => {
        const element = document.querySelector(`#${sectionId}`);
        if (element) {
          sectionElements.push({ id: sectionMap[sectionId], element });
        }
      });

      // Se não encontrou elementos, tentar novamente após um delay
      if (sectionElements.length === 0) {
        timeoutId = setTimeout(initScrollDetection, 100);
        return;
      }

      // Função para determinar qual seção está mais visível
      const getActiveSection = () => {
        const headerHeight = 120; // Altura do header fixo
        const scrollY = window.scrollY;
        
        // Se estiver no topo, retornar 'inicio'
        if (scrollY < 200) {
          return 'inicio';
        }

        // Encontrar a seção que está mais próxima do topo da viewport
        let activeSection = '';
        let minDistance = Infinity;

        sectionElements.forEach(({ id, element }) => {
          const rect = element.getBoundingClientRect();
          
          // Verificar se a seção está visível na viewport
          const isVisible = rect.top < window.innerHeight && rect.bottom > headerHeight;
          
          if (isVisible) {
            // Calcular a distância do topo da viewport (considerando o header)
            const distanceFromTop = Math.abs(rect.top - headerHeight);
            
            // Priorizar seções que estão próximas do topo
            if (distanceFromTop < minDistance && rect.top <= headerHeight + 150) {
              minDistance = distanceFromTop;
              activeSection = id;
            }
          }
        });

        // Se nenhuma seção foi encontrada, verificar qual está mais próxima do topo
        if (!activeSection) {
          let closestSection = '';
          let closestDistance = Infinity;

          sectionElements.forEach(({ id, element }) => {
            const rect = element.getBoundingClientRect();
            const distance = Math.abs(rect.top - headerHeight);
            
            if (distance < closestDistance) {
              closestDistance = distance;
              closestSection = id;
            }
          });

          return closestSection || 'inicio';
        }

        return activeSection || 'inicio';
      };

      // Handler de scroll otimizado com throttle
      let ticking = false;
      const handleScroll = () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            const active = getActiveSection();
            setActiveSection(active);
            ticking = false;
          });
          ticking = true;
        }
      };

      // Verificar estado inicial
      const initialActive = getActiveSection();
      setActiveSection(initialActive);

      // Adicionar listener de scroll
      window.addEventListener('scroll', handleScroll, { passive: true });

      // Usar Intersection Observer como backup para melhor detecção
      const observers: IntersectionObserver[] = [];
      
      sectionElements.forEach(({ id, element }) => {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                // Usar o scroll handler para determinar a seção ativa
                handleScroll();
              }
            });
          },
          {
            threshold: [0, 0.1, 0.3, 0.5, 0.7, 1],
            rootMargin: `-${120}px 0px -40% 0px`, // Considera o header fixo
          }
        );

        observer.observe(element);
        observers.push(observer);
      });

      // Retornar função de cleanup
      cleanup = () => {
        window.removeEventListener('scroll', handleScroll);
        observers.forEach((observer) => observer.disconnect());
      };
    };

    // Inicializar após um pequeno delay para garantir que o DOM está pronto
    timeoutId = setTimeout(initScrollDetection, 100);
    
    // Também tentar quando a página carregar completamente
    if (document.readyState === 'complete') {
      if (timeoutId) clearTimeout(timeoutId);
      initScrollDetection();
    } else {
      loadHandler = () => {
        if (timeoutId) clearTimeout(timeoutId);
        initScrollDetection();
      };
      window.addEventListener('load', loadHandler);
    }

    // Cleanup
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (loadHandler) window.removeEventListener('load', loadHandler);
      if (cleanup) cleanup();
    };
  }, [location.pathname]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const scrollToSection = (sectionId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    // Normalizar o ID (remover # se presente)
    const normalizedId = sectionId.startsWith('#') ? sectionId.substring(1) : sectionId;
    
    // Se não estiver na home, navegar para home com hash
    if (location.pathname !== '/') {
      navigate(`/#${normalizedId}`);
      setIsMenuOpen(false);
    } else {
      // Se já estiver na home, fazer scroll diretamente
      const element = document.querySelector(`#${normalizedId}`);
      if (element) {
        const headerOffset = 100;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
        
        // Atualizar o hash na URL
        window.history.pushState(null, '', `#${normalizedId}`);
        
        // Atualizar a seção ativa após o scroll
        setTimeout(() => {
          setActiveSection(normalizedId);
        }, 500);
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
                activeSection === 'inicio' 
                  ? 'text-[#3bb664]' 
                  : (isScrolled ? 'text-gray-700' : 'text-white')
              }`}
            >
              {t('common.home')}
              <span className={`absolute bottom-0 left-1/2 h-0.5 bg-[#3bb664] transition-all duration-300 ease-in-out transform -translate-x-1/2 ${
                activeSection === 'inicio' ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-100'
              }`}></span>
            </a>
            <a 
              href="/#sobre"
              onClick={(e) => scrollToSection('#sobre', e)}
              className={`group relative text-sm font-medium uppercase tracking-wider transition-colors hover:text-[#3bb664] ${
                activeSection === 'sobre' 
                  ? 'text-[#3bb664]' 
                  : (isScrolled ? 'text-gray-700' : 'text-white')
              }`}
            >
              {t('common.aboutUs')}
              <span className={`absolute bottom-0 left-1/2 h-0.5 bg-[#3bb664] transition-all duration-300 ease-in-out transform -translate-x-1/2 ${
                activeSection === 'sobre' ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-100'
              }`}></span>
            </a>
            <a 
              href="/#servicos"
              onClick={(e) => scrollToSection('#servicos', e)}
              className={`group relative text-sm font-medium uppercase tracking-wider transition-colors hover:text-[#3bb664] ${
                activeSection === 'servicos' 
                  ? 'text-[#3bb664]' 
                  : (isScrolled ? 'text-gray-700' : 'text-white')
              }`}
            >
              {t('common.services')}
              <span className={`absolute bottom-0 left-1/2 h-0.5 bg-[#3bb664] transition-all duration-300 ease-in-out transform -translate-x-1/2 ${
                activeSection === 'servicos' ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-100'
              }`}></span>
            </a>
            <a 
              href="/#beneficios-fiscais"
              onClick={(e) => scrollToSection('#beneficios-fiscais', e)}
              className={`group relative text-sm font-medium uppercase tracking-wider transition-colors hover:text-[#3bb664] ${
                activeSection === 'beneficios-fiscais' 
                  ? 'text-[#3bb664]' 
                  : (isScrolled ? 'text-gray-700' : 'text-white')
              }`}
            >
              {t('common.fiscalBenefits')}
              <span className={`absolute bottom-0 left-1/2 h-0.5 bg-[#3bb664] transition-all duration-300 ease-in-out transform -translate-x-1/2 ${
                activeSection === 'beneficios-fiscais' ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-100'
              }`}></span>
            </a>
            <a 
              href="/#depoimentos"
              onClick={(e) => scrollToSection('#depoimentos', e)}
              className={`group relative text-sm font-medium uppercase tracking-wider transition-colors hover:text-[#3bb664] ${
                activeSection === 'depoimentos' 
                  ? 'text-[#3bb664]' 
                  : (isScrolled ? 'text-gray-700' : 'text-white')
              }`}
            >
              {t('common.testimonials')}
              <span className={`absolute bottom-0 left-1/2 h-0.5 bg-[#3bb664] transition-all duration-300 ease-in-out transform -translate-x-1/2 ${
                activeSection === 'depoimentos' ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-100'
              }`}></span>
            </a>
            <Link 
              to="/blog"
              className={`group relative text-sm font-medium uppercase tracking-wider transition-colors hover:text-[#3bb664] ${
                isScrolled ? 'text-gray-700' : 'text-white'
              } ${isBlogPage ? 'text-[#3bb664]' : ''}`}
            >
              {t('common.blog')}
              <span className={`absolute bottom-0 left-1/2 h-0.5 bg-[#3bb664] transition-all duration-300 ease-in-out transform -translate-x-1/2 ${
                isBlogPage ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-100'
              }`}></span>
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSelector isScrolled={isScrolled} />
            <Button 
              size="sm" 
              className="bg-[#3bb664] hover:bg-[#2d9a4f] text-white flex items-center gap-2"
              onClick={() => {
                if (location.pathname !== '/') {
                  navigate('/');
                  setTimeout(() => scrollToSection('#contato'), 200);
                } else {
                  scrollToSection('#contato');
                }
              }}
            >
              <Mail className="w-4 h-4" />
              {t('common.contact')}
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
            <div className="px-4 pb-3 border-b border-gray-200 mb-2">
              <LanguageSelector isScrolled={true} />
            </div>
            <div className="flex flex-col space-y-2">
              <a 
                href="/"
                onClick={handleHomeClick}
                className={`px-6 py-3 text-left transition-colors ${
                  activeSection === 'inicio' 
                    ? 'text-[#3bb664] bg-gray-50 font-medium' 
                    : 'text-gray-700 hover:text-[#3bb664] hover:bg-gray-50'
                }`}
              >
                {t('common.home')}
              </a>
              <a 
                href="/#sobre"
                onClick={(e) => scrollToSection('#sobre', e)}
                className={`px-6 py-3 text-left transition-colors ${
                  activeSection === 'sobre' 
                    ? 'text-[#3bb664] bg-gray-50 font-medium' 
                    : 'text-gray-700 hover:text-[#3bb664] hover:bg-gray-50'
                }`}
              >
                {t('common.aboutUs')}
              </a>
              <a 
                href="/#servicos"
                onClick={(e) => scrollToSection('#servicos', e)}
                className={`px-6 py-3 text-left transition-colors ${
                  activeSection === 'servicos' 
                    ? 'text-[#3bb664] bg-gray-50 font-medium' 
                    : 'text-gray-700 hover:text-[#3bb664] hover:bg-gray-50'
                }`}
              >
                {t('common.services')}
              </a>
              <a 
                href="/#beneficios-fiscais"
                onClick={(e) => scrollToSection('#beneficios-fiscais', e)}
                className={`px-6 py-3 text-left transition-colors ${
                  activeSection === 'beneficios-fiscais' 
                    ? 'text-[#3bb664] bg-gray-50 font-medium' 
                    : 'text-gray-700 hover:text-[#3bb664] hover:bg-gray-50'
                }`}
              >
                {t('common.fiscalBenefits')}
              </a>
              <a 
                href="/#depoimentos"
                onClick={(e) => scrollToSection('#depoimentos', e)}
                className={`px-6 py-3 text-left transition-colors ${
                  activeSection === 'depoimentos' 
                    ? 'text-[#3bb664] bg-gray-50 font-medium' 
                    : 'text-gray-700 hover:text-[#3bb664] hover:bg-gray-50'
                }`}
              >
                {t('common.testimonials')}
              </a>
              <Link 
                to="/blog"
                className="px-6 py-3 text-left text-gray-700 hover:text-[#3bb664] hover:bg-gray-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('common.blog')}
              </Link>
              <div className="px-6 py-3">
                <Button 
                  size="sm" 
                  className="w-full bg-[#3bb664] hover:bg-[#2d9a4f] text-white flex items-center justify-center gap-2"
                  onClick={() => {
                    if (location.pathname !== '/') {
                      navigate('/');
                      setTimeout(() => scrollToSection('#contato'), 200);
                    } else {
                      scrollToSection('#contato');
                    }
                  }}
                >
                  <Mail className="w-4 h-4" />
                  {t('common.contact')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};