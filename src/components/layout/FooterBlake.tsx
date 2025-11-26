import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin, ArrowUp } from 'lucide-react';
import { Configuration } from '../../types';

interface FooterProps {
  configuration?: Configuration | null;
}

export const FooterBlake: React.FC<FooterProps> = ({ configuration }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center">
              {configuration?.logo_dark_url || configuration?.logo_url ? (
                <img 
                  src={configuration.logo_dark_url || configuration.logo_url} 
                  alt={configuration.companyName || 'CENTRAL CONTÁBIL'}
                  className="h-24 object-contain max-w-[240px]"
                  onError={(e) => {
                    // Se a imagem falhar ao carregar, mostrar fallback de texto
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector('.logo-fallback')) {
                      parent.innerHTML = `
                        <div class="logo-fallback text-3xl font-bold text-[#3bb664] tracking-wider">CENTRAL</div>
                        <div class="logo-fallback ml-1 text-base text-gray-400 font-light">CONTÁBIL</div>
                      `;
                    }
                  }}
                />
              ) : (
                <>
                  <div className="text-3xl font-bold text-[#3bb664] tracking-wider">
                    CENTRAL
                  </div>
                  <div className="ml-1 text-base text-gray-400 font-light">
                    CONTÁBIL
                  </div>
                </>
              )}
            </div>
            <p className="text-gray-400 leading-relaxed">
              {configuration?.footer_years_text || configuration?.footerYearsText || 
               'Mais de 34 anos oferecendo soluções contábeis estratégicas para empresas que buscam crescimento sustentável.'}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-[#3bb664] transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#3bb664] transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#3bb664] transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#3bb664] transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-6 uppercase tracking-wider">
              Serviços
            </h3>
            <ul className="space-y-3 text-gray-400">
              <li>
                <a href="#servicos" className="hover:text-[#3bb664] transition-colors">
                  Consultoria Fiscal
                </a>
              </li>
              <li>
                <a href="#servicos" className="hover:text-[#3bb664] transition-colors">
                  Auditoria Contábil
                </a>
              </li>
              <li>
                <a href="#servicos" className="hover:text-[#3bb664] transition-colors">
                  Gestão Tributária
                </a>
              </li>
              <li>
                <a href="#servicos" className="hover:text-[#3bb664] transition-colors">
                  Assessoria Jurídica
                </a>
              </li>
              <li>
                <a href="#servicos" className="hover:text-[#3bb664] transition-colors">
                  Abertura de Empresas
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-6 uppercase tracking-wider">
              Empresa
            </h3>
            <ul className="space-y-3 text-gray-400">
              <li>
                <a href="#sobre" className="hover:text-[#3bb664] transition-colors">
                  Quem Somos
                </a>
              </li>
              <li>
                <a href="#depoimentos" className="hover:text-[#3bb664] transition-colors">
                  Depoimentos
                </a>
              </li>
              <li>
                <Link to="/blog" className="hover:text-[#3bb664] transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-[#3bb664] transition-colors">
                  Carreiras
                </a>
              </li>
              <li>
                <Link to="/" className="hover:text-[#3bb664] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <a href="#contato" className="hover:text-[#3bb664] transition-colors">
                  Contato
                </a>
              </li>
              <li>
                <Link to="/politica-de-privacidade" className="hover:text-[#3bb664] transition-colors">
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-6 uppercase tracking-wider">
              Contato
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Phone size={18} className="text-[#3bb664] mt-1 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium">Telefone</div>
                  <div className="text-gray-400 text-sm">
                    {configuration?.phone || '(27) 3333-3333'}
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Mail size={18} className="text-[#3bb664] mt-1 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium">Email</div>
                  <div className="text-gray-400 text-sm">
                    {configuration?.email || 'contato@central-rnc.com.br'}
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin size={18} className="text-[#3bb664] mt-1 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium">Endereço</div>
                  <div className="text-gray-400 text-sm">
                    {configuration?.address || 'Vitória, ES'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} {configuration?.companyName || configuration?.company_name || 'Central Contábil'}. Todos os direitos reservados.
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4 text-gray-400 text-sm">
                <Link to="/politica-de-privacidade" className="hover:text-[#3bb664] transition-colors">
                  Política de Privacidade
                </Link>
                <span>•</span>
                <div>
                  Desenvolvido com 💚 por Central Contábil
                </div>
              </div>
              <button 
                onClick={scrollToTop}
                className="bg-[#3bb664] text-white p-2 rounded-full hover:bg-[#2d9a4f] transition-colors"
                title="Voltar ao topo"
              >
                <ArrowUp size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};