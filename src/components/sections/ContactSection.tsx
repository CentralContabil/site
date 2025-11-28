import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { ContactRequest } from '../../types';
import { apiService } from '../../services/api';
import { toast } from 'sonner';
import { Mail, Phone, MapPin, Clock, MessageCircle } from 'lucide-react';
import { ReCaptcha } from '../ReCaptcha';

interface ContactSectionProps {
  configuration: any;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ configuration }) => {
  const [formData, setFormData] = useState<ContactRequest>({
    name: '',
    email: '',
    phone: '',
    serviceType: '',
    message: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [honeypot, setHoneypot] = useState(''); // Campo honeypot para detectar bots
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState<string>('');

  // Em desenvolvimento, simular token válido automaticamente
  useEffect(() => {
    const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isDevelopment && !captchaToken) {
      setCaptchaToken('dev-token-localhost');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Formatação de telefone
  const formatPhone = (value: string): string => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara (27) 99999-9999
    if (numbers.length <= 2) {
      return numbers ? `(${numbers}` : '';
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  // Validação e formatação de email
  const formatEmail = (value: string): string => {
    // Remove espaços e converte para minúsculas
    return value.trim().toLowerCase();
  };

  const handleInputChange = (field: keyof ContactRequest, value: string) => {
    let formattedValue = value;
    
    // Aplicar formatação específica por campo
    if (field === 'phone') {
      formattedValue = formatPhone(value);
    } else if (field === 'email') {
      formattedValue = formatEmail(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Mensagem é obrigatória';
    } else if (formData.message.length < 10) {
      newErrors.message = 'Mensagem deve ter no mínimo 10 caracteres';
    }

    // Validação honeypot - se este campo estiver preenchido, é um bot
    if (honeypot.trim() !== '') {
      // Silenciosamente rejeitar (não mostrar erro para não alertar o bot)
      return false;
    }

    // Validação do captcha (desabilitada em desenvolvimento/localhost)
    const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isDevelopment && !captchaToken) {
      setCaptchaError('Por favor, confirme que você não é um robô');
      return false;
    }

    setErrors(newErrors);
    setCaptchaError('');
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await apiService.sendContactMessage({
        ...formData,
        captchaToken: captchaToken || undefined,
        honeypot: honeypot, // Enviar honeypot para validação no backend
      } as any);
      toast.success('Mensagem enviada com sucesso! Entraremos em contato em breve.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        serviceType: '',
        message: '',
      });
      setHoneypot('');
      setCaptchaToken(null);
      // Reset hCaptcha
      if (window.hcaptcha && (window as any).captchaWidgetId) {
        window.hcaptcha.reset((window as any).captchaWidgetId);
      }
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Erro ao enviar mensagem. Tente novamente.';
      toast.error(errorMessage);
      setCaptchaToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const serviceTypes = [
    'Serviços Contábeis',
    'Fiscal e Tributária',
    'Departamento Trabalhista',
    'Legalização de Empresas',
    'Benefícios Fiscais',
    'Abertura de Empresa',
    'Outros',
  ];

  return (
    <section id="contato" className="py-16 sm:py-20 lg:py-24 bg-gray-50">
      {/* Top Divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gray-300"></div>
      
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#3bb664] text-white text-xs font-semibold mb-6 uppercase tracking-wider">
            Contato
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Entre em Contato
          </h2>
          <div className="w-20 h-1 bg-[#3bb664] mx-auto mb-6"></div>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Nossa equipe está pronta para atender você. Entre em contato e descubra como podemos 
            ajudar sua empresa a alcançar melhores resultados.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-7xl mx-auto">
          {/* Contact Form */}
          <div className="bg-white border border-gray-200 shadow-sm">
            <div className="p-6 sm:p-8 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900">Envie sua Mensagem</h3>
              <p className="text-gray-600 mt-2">Preencha o formulário abaixo e retornaremos em breve</p>
            </div>
            <div className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-5 relative">
                <div>
                  <Input
                    label="Nome completo"
                    placeholder="Seu nome completo"
                    value={formData.name}
                    onChange={(value) => handleInputChange('name', value)}
                    error={errors.name}
                    required
                  />
                </div>
                
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <Input
                      label="Email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={(value) => handleInputChange('email', value)}
                      error={errors.email}
                      required
                    />
                  </div>
                  
                  <div>
                    <Input
                      label="Telefone"
                      type="tel"
                      placeholder="(27) 99999-9999"
                      value={formData.phone}
                      onChange={(value) => handleInputChange('phone', value)}
                      error={errors.phone}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Tipo de serviço
                  </label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) => handleInputChange('serviceType', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3bb664] focus:border-[#3bb664] transition-colors appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 1rem center',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="" style={{ color: '#111827', backgroundColor: 'white' }}>Selecione um serviço</option>
                    {serviceTypes.map((type) => (
                      <option key={type} value={type} style={{ color: '#111827', backgroundColor: 'white' }}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Input
                    label="Mensagem"
                    type="textarea"
                    placeholder="Descreva como podemos ajudar você..."
                    value={formData.message}
                    onChange={(value) => handleInputChange('message', value)}
                    error={errors.message}
                    required
                  />
                </div>
                  
                  {/* Honeypot field - invisível para usuários, visível para bots */}
                  <div style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}>
                    <label htmlFor="website">Website (não preencha este campo)</label>
                    <input
                      type="text"
                      id="website"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </div>

                  {/* hCaptcha - Modo desenvolvimento/localhost */}
                  {(() => {
                    const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                    
                    if (isDevelopment) {
                      return (
                        <div className="p-3 bg-yellow-50 border border-yellow-200">
                          <p className="text-yellow-800 text-sm">
                            <strong>Modo Desenvolvimento:</strong> Validação de segurança desabilitada para testes em localhost.
                          </p>
                        </div>
                      );
                    }
                    
                    return (
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                          Verificação de Segurança
                        </label>
                        <ReCaptcha
                          siteKey={import.meta.env.VITE_HCAPTCHA_SITE_KEY || '7752cf8c-cc60-4c64-9210-8020448030a4'}
                          onVerify={(token) => {
                            setCaptchaToken(token);
                            setCaptchaError('');
                          }}
                          onExpire={() => {
                            setCaptchaToken(null);
                            setCaptchaError('Verificação expirada. Por favor, confirme novamente.');
                          }}
                          theme="light"
                          size="normal"
                        />
                        {captchaError && (
                          <p className="text-red-600 text-sm mt-2">{captchaError}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          Este site é protegido pelo hCaptcha e aplicam-se a{' '}
                          <a 
                            href="https://www.hcaptcha.com/privacy" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#3bb664] hover:underline"
                          >
                            Política de Privacidade
                          </a>
                          {' '}e os{' '}
                          <a 
                            href="https://www.hcaptcha.com/terms" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#3bb664] hover:underline"
                          >
                            Termos de Serviço
                          </a>
                          {' '}do hCaptcha.
                        </p>
                      </div>
                    );
                  })()}
                  
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-[#3bb664] hover:bg-[#2d9a4f] text-white font-semibold py-3 transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Enviando...' : 'Enviar Mensagem'}
                  </Button>
              </form>
            </div>
          </div>

          {/* Contact Information & Map */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white border border-gray-200 shadow-sm">
              <div className="p-6 sm:p-8 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900">Informações de Contato</h3>
              </div>
              <div className="p-6 sm:p-8">
                <div className="space-y-6">
                  {configuration?.phone && (
                    <div className="flex items-start gap-4 pb-6 border-b border-gray-100">
                      <div className="flex-shrink-0 w-12 h-12 bg-[#3bb664] flex items-center justify-center">
                        <Phone className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">Telefone</p>
                        <a 
                          href={`tel:${configuration.phone.replace(/\s/g, '')}`}
                          className="text-gray-700 hover:text-[#3bb664] transition-colors"
                        >
                          {configuration.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {/* WhatsApp */}
                  <div className="flex items-start gap-4 pb-6 border-b border-gray-100">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#3bb664] flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">WhatsApp</p>
                      <a 
                        href="https://wa.me/5527981922299" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-700 hover:text-[#3bb664] transition-colors"
                      >
                        (27) 98192-2299
                      </a>
                    </div>
                  </div>
                  
                  {configuration?.email && (
                    <div className="flex items-start gap-4 pb-6 border-b border-gray-100">
                      <div className="flex-shrink-0 w-12 h-12 bg-[#3bb664] flex items-center justify-center">
                        <Mail className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">Email</p>
                        <a 
                          href={`mailto:${configuration.email}`}
                          className="text-gray-700 hover:text-[#3bb664] transition-colors"
                        >
                          {configuration.email}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {configuration?.address && (
                    <div className="flex items-start gap-4 pb-6 border-b border-gray-100">
                      <div className="flex-shrink-0 w-12 h-12 bg-[#3bb664] flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">Endereço</p>
                        <p className="text-gray-700 leading-relaxed">{configuration.address}</p>
                      </div>
                    </div>
                  )}
                  
                  {configuration?.businessHours && (
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-[#3bb664] flex items-center justify-center">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">Horário de Atendimento</p>
                        <p className="text-gray-700">{configuration.businessHours}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="bg-white border border-gray-200 shadow-sm">
              <div className="p-6 sm:p-8 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Nossa Localização</h3>
              </div>
              <div className="p-6 sm:p-8">
                {configuration?.address ? (
                  <div>
                    <div className="aspect-video overflow-hidden border border-gray-200">
                      {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? (
                        <iframe
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          loading="lazy"
                          allowFullScreen
                          referrerPolicy="no-referrer-when-downgrade"
                          src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(configuration.address)}`}
                          title="Localização da Central Contábil"
                        />
                      ) : (
                        <iframe
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          loading="lazy"
                          allowFullScreen
                          referrerPolicy="no-referrer-when-downgrade"
                          src={`https://maps.google.com/maps?q=${encodeURIComponent(configuration.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                          title="Localização da Central Contábil"
                        />
                      )}
                    </div>
                    <div className="mt-4 text-center">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(configuration.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[#3bb664] hover:text-[#2d9a4f] font-medium text-sm transition-colors"
                      >
                        <MapPin className="w-4 h-4" />
                        Abrir no Google Maps
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-100 flex items-center justify-center border border-gray-200">
                    <p className="text-gray-500 text-center px-4">
                      Configure o endereço nas configurações para exibir o mapa
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Divider */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-300"></div>
    </section>
  );
};