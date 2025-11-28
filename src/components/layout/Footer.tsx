import React from 'react';
import { Link } from 'react-router-dom';
import { Configuration } from '../../types';
import { Mail, Phone, MapPin, Clock, Facebook, Instagram, Linkedin, Calculator, Building2, ArrowRight } from 'lucide-react';
import { Logo } from '../ui/Logo';

interface FooterProps {
  configuration: Configuration | null;
}

export const Footer: React.FC<FooterProps> = ({ configuration }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-green-900 via-green-800 to-green-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-96 h-96 bg-green-400 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-green-600 rounded-full filter blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 py-20">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <Logo size="large" className="drop-shadow-lg" />
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-white">
                    {configuration?.companyName || 'Central Contábil'}
                  </h3>
                  <p className="text-green-200 text-sm">
                    Soluções Empresariais • Rede Nacional de Contabilidade
                  </p>
                </div>
              </div>
            </div>
            
            <p className="text-green-100 mb-8 leading-relaxed max-w-lg">
              Com mais de 34 anos de atuação, somos uma das maiores e mais experientes 
              empresas de Contabilidade do Espírito Santo. Nossas soluções vão além da 
              contabilidade tradicional: atuamos de forma integrada e estratégica para que 
              o seu negócio tenha a melhor performance contábil, fiscal e tributária.
            </p>
            
            <div className="flex space-x-4">
              {configuration?.facebookUrl && (
                <a href={configuration.facebookUrl} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center text-green-200 hover:text-white hover:bg-white/20 transition-all duration-300">
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {configuration?.instagramUrl && (
                <a href={configuration.instagramUrl} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center text-green-200 hover:text-white hover:bg-white/20 transition-all duration-300">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {configuration?.linkedinUrl && (
                <a href={configuration.linkedinUrl} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center text-green-200 hover:text-white hover:bg-white/20 transition-all duration-300">
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Nossos Serviços</h4>
            <div className="space-y-3">
              <Link
                to="/#servicos"
                className="flex items-center text-green-100 hover:text-white transition-colors duration-200"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                <span>Abertura de Empresa</span>
              </Link>
              <Link
                to="/#servicos"
                className="flex items-center text-green-100 hover:text-white transition-colors duration-200"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                <span>Contabilidade Consultiva</span>
              </Link>
              <Link
                to="/#servicos"
                className="flex items-center text-green-100 hover:text-white transition-colors duration-200"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                <span>Departamento Pessoal</span>
              </Link>
              <Link
                to="/#servicos"
                className="flex items-center text-green-100 hover:text-white transition-colors duration-200"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                <span>Planejamento Tributário</span>
              </Link>
              <Link
                to="/#servicos"
                className="flex items-center text-green-100 hover:text-white transition-colors duration-200"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                <span>Assessoria Financeira</span>
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Entre em Contato</h4>
            <div className="space-y-4">
              {configuration?.phone && (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-300" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Telefone</p>
                    <p className="text-green-200 text-sm">{configuration.phone}</p>
                  </div>
                </div>
              )}
              {configuration?.email && (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-green-300" />
                  </div>
                  <div>
                    <p className="text-white font-medium">E-mail</p>
                    <p className="text-green-200 text-sm">{configuration.email}</p>
                  </div>
                </div>
              )}
              {configuration?.address && (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-green-300" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Endereço</p>
                    <p className="text-green-200 text-sm">{configuration.address}</p>
                  </div>
                </div>
              )}
              {configuration?.businessHours && (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-green-300" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Horário</p>
                    <p className="text-green-200 text-sm">{configuration.businessHours}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Newsletter CTA */}
        <div className="border-t border-white/20 pt-12 pb-8">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl font-bold text-white mb-4">
              Fique por dentro das novidades contábeis
            </h3>
            <p className="text-green-100 mb-8 max-w-2xl mx-auto">
              Receba dicas, atualizações fiscais e novidades diretamente no seu e-mail
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Seu melhor e-mail"
                className="flex-1 px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
              />
              <button className="px-8 py-4 bg-gradient-to-r from-green-400 to-green-500 text-green-900 rounded-xl font-semibold hover:from-green-500 hover:to-green-600 transition-all duration-300 transform hover:scale-105 shadow-lg">
                Assinar
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/20 pt-8 pb-12 text-center">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-green-200">
              © {currentYear} {configuration?.companyName || 'Contábil Premium'}. 
              Todos os direitos reservados.
            </p>
            <div className="flex gap-6 text-sm text-green-300">
              <Link to="/politica-de-privacidade" className="hover:text-white transition-colors duration-200">Política de Privacidade</Link>
              <Link to="/termos-de-uso" className="hover:text-white transition-colors duration-200">Termos de Uso</Link>
              <a href="/admin" className="hover:text-white transition-colors duration-200">Área Administrativa</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};