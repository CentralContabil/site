import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { LandingPage, FormField } from '../types';
import { toast } from 'sonner';
import { FooterBlake } from '../components/layout/FooterBlake';
import { SEO } from '../components/SEO';
import { useConfiguration } from '../hooks/useConfiguration';
import { ArrowLeft } from 'lucide-react';
import { ReCaptcha } from '../components/ReCaptcha';
import { ContentWithShortcodes } from '../components/ContentWithShortcodes';

export function LandingPagePage() {
  const { slug } = useParams<{ slug: string }>();
  const [landingPage, setLandingPage] = useState<LandingPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState<string>('');
  const [honeypot, setHoneypot] = useState('');
  const { configuration } = useConfiguration();

  // Em desenvolvimento, simular token válido automaticamente
  useEffect(() => {
    const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isDevelopment && !captchaToken) {
      setCaptchaToken('dev-token-localhost');
    }
  }, []);

  useEffect(() => {
    if (slug) {
      loadLandingPage();
    }
  }, [slug]);

  const loadLandingPage = async () => {
    try {
      setLoading(true);
      const response = await apiService.getLandingPageBySlug(slug!);
      setLandingPage(response.landingPage);
      
      // Inicializar formData com valores vazios
      const initialData: Record<string, any> = {};
      response.landingPage.form_fields?.forEach((field) => {
        initialData[field.field_name] = '';
      });
      setFormData(initialData);
    } catch (error: any) {
      console.error('Error loading landing page:', error);
      // Se não encontrar, tenta buscar sem o prefixo /landing/
      if (error?.message?.includes('404') || error?.message?.includes('não encontrada')) {
        // Se já tentou sem prefixo, mostra erro
        if (!slug?.startsWith('landing/')) {
          toast.error('Landing page não encontrada');
        }
      } else {
        toast.error('Erro ao carregar landing page');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!landingPage) return;

    // Validar captcha (em produção)
    const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isDevelopment && !captchaToken) {
      setCaptchaError('Por favor, confirme que você não é um robô');
      toast.error('Por favor, confirme que você não é um robô');
      return;
    }

    setSubmitting(true);
    setCaptchaError('');
    try {
      await apiService.submitForm(landingPage.id, {
        ...formData,
        captchaToken: captchaToken || undefined,
        honeypot: honeypot,
      });
      toast.success('Formulário enviado com sucesso!');
      // Limpar formulário
      const resetData: Record<string, any> = {};
      landingPage.form_fields?.forEach((field) => {
        resetData[field.field_name] = '';
      });
      setFormData(resetData);
      setHoneypot('');
      setCaptchaToken(null);
      // Reset hCaptcha
      if (window.hcaptcha && (window as any).captchaWidgetId) {
        window.hcaptcha.reset((window as any).captchaWidgetId);
      }
    } catch (error: any) {
      console.error('Error submitting form:', error);
      toast.error(error?.message || 'Erro ao enviar formulário');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3bb664]"></div>
      </div>
    );
  }

  if (!landingPage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Landing page não encontrada
          </h1>
          <Link to="/">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center mx-auto">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para o Início
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const pageUrl = `${baseUrl}/${slug}`;
  const pageImage = (landingPage as any).featured_image_url || `${baseUrl}/favicon.svg`;

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title={landingPage.meta_title || landingPage.title}
        description={landingPage.meta_description || landingPage.description || landingPage.title}
        keywords={landingPage.meta_keywords || 'landing page'}
        image={pageImage}
        url={pageUrl}
        configuration={configuration}
      />

      {/* Hero Section - Similar ao Blog */}
      <section className="relative text-white pt-32 sm:pt-36 lg:pt-40 pb-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          {(landingPage as any).featured_image_url ? (
            <img 
              src={(landingPage as any).featured_image_url}
              alt={landingPage.title}
              className="w-full h-full object-cover"
            />
          ) : landingPage.hero_image_url ? (
            <img 
              src={landingPage.hero_image_url}
              alt={landingPage.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div 
              className="w-full h-full"
              style={{
                backgroundColor: landingPage.hero_background_color || '#1f2937',
              }}
            />
          )}
          {/* Overlay com transparência */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-800/75 to-gray-900/80"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link to="/" className="inline-flex items-center text-gray-300 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para o Início
            </Link>
          </div>
          
          <div className="max-w-4xl">
            {landingPage.hero_title && (
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                {landingPage.hero_title}
              </h1>
            )}
            
            {landingPage.hero_subtitle && (
              <p className="text-xl text-gray-200 mb-6">
                {landingPage.hero_subtitle}
              </p>
            )}

            {landingPage.description && (
              <p className="text-lg text-gray-300">
                {landingPage.description}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Content Section */}
      <article className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {landingPage.content && (
            <div className="mb-12">
              <ContentWithShortcodes 
                content={landingPage.content} 
                landingPageId={landingPage.id}
              />
            </div>
          )}

          {/* Form Section */}
          {landingPage.form_fields && landingPage.form_fields.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Preencha o formulário</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {landingPage.form_fields.map((field) => (
                  <FormFieldRenderer
                    key={field.id}
                    field={field}
                    value={formData[field.field_name] || ''}
                    onChange={(value) =>
                      setFormData({ ...formData, [field.field_name]: value })
                    }
                  />
                ))}

                {/* Honeypot field (hidden) */}
                <input
                  type="text"
                  name="website"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  style={{ display: 'none' }}
                  tabIndex={-1}
                  autoComplete="off"
                />

                {/* Captcha */}
                <div className="flex justify-center">
                  <ReCaptcha
                    siteKey={import.meta.env.VITE_HCAPTCHA_SITE_KEY || '10000000-ffff-ffff-ffff-000000000001'}
                    onVerify={(token) => {
                      setCaptchaToken(token);
                      setCaptchaError('');
                    }}
                    onExpire={() => {
                      setCaptchaToken(null);
                    }}
                    theme="light"
                    size="normal"
                  />
                </div>
                {captchaError && (
                  <p className="text-red-600 text-sm text-center">{captchaError}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-6 py-3 bg-[#3bb664] text-white rounded-lg hover:bg-[#2d9550] disabled:opacity-50 font-semibold transition-colors"
                >
                  {submitting ? 'Enviando...' : 'Enviar'}
                </button>
              </form>
            </div>
          )}
        </div>
      </article>

      <FooterBlake configuration={configuration} />
    </div>
  );
}

// Componente para renderizar campos do formulário
export function FormFieldRenderer({
  field,
  value,
  onChange,
}: {
  field: FormField;
  value: any;
  onChange: (value: any) => void;
}) {
  const renderField = () => {
    switch (field.field_type) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ''}
            required={field.is_required}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3bb664] focus:border-transparent"
          />
        );

      case 'select':
        const options = field.options ? JSON.parse(field.options) : [];
        return (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={field.is_required}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3bb664] focus:border-transparent"
          >
            <option value="">Selecione...</option>
            {options.map((opt: string, idx: number) => (
              <option key={idx} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => onChange(e.target.checked)}
              required={field.is_required}
              className="mr-2"
            />
            <span>{field.help_text}</span>
          </label>
        );

      case 'radio':
        const radioOptions = field.options ? JSON.parse(field.options) : [];
        return (
          <div className="space-y-2">
            {radioOptions.map((opt: string, idx: number) => (
              <label key={idx} className="flex items-center">
                <input
                  type="radio"
                  name={field.field_name}
                  value={opt}
                  checked={value === opt}
                  onChange={(e) => onChange(e.target.value)}
                  required={field.is_required}
                  className="mr-2"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        );

      case 'file':
        return (
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onChange(file);
              }
            }}
            required={field.is_required}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3bb664] focus:border-transparent"
          />
        );

      default:
        return (
          <input
            type={field.field_type === 'email' ? 'email' : field.field_type === 'tel' ? 'tel' : field.field_type === 'number' ? 'number' : field.field_type === 'date' ? 'date' : 'text'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ''}
            required={field.is_required}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3bb664] focus:border-transparent"
          />
        );
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {field.field_label}
        {field.is_required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderField()}
      {field.help_text && (
        <p className="mt-1 text-sm text-gray-500">{field.help_text}</p>
      )}
    </div>
  );
}

