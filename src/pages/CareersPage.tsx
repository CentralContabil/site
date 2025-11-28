import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ArrowRight, Mail, Upload } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ReCaptcha } from '../components/ReCaptcha';
import { toast } from 'sonner';
import { apiService } from '../services/api';
import { useConfiguration } from '../hooks/useConfiguration';
import { FooterBlake } from '../components/layout/FooterBlake';
import { SEO } from '../components/SEO';

export const CareersPage: React.FC = () => {
  const { configuration } = useConfiguration();
  const [careersContent, setCareersContent] = useState<{
    background_image_url?: string | null;
    hero_title?: string | null;
    hero_subtitle?: string | null;
    culture_title?: string | null;
    culture_text?: string | null;
    vacancies_title?: string | null;
    vacancies_text?: string | null;
    benefits_title?: string | null;
    benefits_text?: string | null;
    profile_title?: string | null;
    profile_text?: string | null;
  } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    linkedinUrl: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [honeypot, setHoneypot] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState<string>('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadCareersContent = async () => {
      try {
        const response = await apiService.getCareersPage();
        setCareersContent(response.careersPage || null);
      } catch (error) {
        console.error('Erro ao carregar conteúdo da página Trabalhe Conosco:', error);
      }
    };

    loadCareersContent();

    const isDevelopment =
      import.meta.env.DEV ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';
    if (isDevelopment && !captchaToken) {
      setCaptchaToken('dev-token-localhost');
    }
  }, [captchaToken]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (honeypot.trim() !== '') {
      return false;
    }

    const isDevelopment =
      import.meta.env.DEV ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';
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
    if (!validate()) return;

    setSubmitting(true);
    try {
      let cvUrl: string | undefined;

      if (cvFile) {
        setUploadingCv(true);
        const upload = await apiService.uploadJobApplicationCv(cvFile);
        cvUrl = upload.data.url;
      }

      await apiService.sendJobApplication({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || undefined,
        position: formData.position.trim() || undefined,
        linkedinUrl: formData.linkedinUrl.trim() || undefined,
        message: formData.message.trim() || undefined,
        cvUrl,
        captchaToken: captchaToken || undefined,
        honeypot,
      });

      toast.success('Candidatura enviada com sucesso!');
      setFormData({
        name: '',
        email: '',
        phone: '',
        position: '',
        linkedinUrl: '',
        message: '',
      });
      setCvFile(null);
      setHoneypot('');
      setCaptchaToken(null);
      if (window.hcaptcha && (window as any).captchaWidgetId) {
        window.hcaptcha.reset((window as any).captchaWidgetId);
      }
    } catch (error: any) {
      console.error('Erro ao enviar candidatura:', error);
      toast.error(error?.message || 'Erro ao enviar candidatura. Tente novamente.');
    } finally {
      setUploadingCv(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SEO
        title={careersContent?.hero_title || 'Trabalhe com a gente'}
        description={
          careersContent?.hero_subtitle ||
          'Estamos sempre em busca de profissionais que queiram crescer junto com a Central Contábil e com os nossos clientes.'
        }
        keywords="carreiras, trabalhe conosco, vagas, central contábil"
        configuration={configuration}
      />

      {/* Hero no mesmo estilo visual da página de Blog */}
      <section className="relative text-white pt-32 sm:pt-36 lg:pt-40 pb-20 overflow-hidden">
        {/* Imagem de fundo dinâmica da página de carreiras */}
        <div className="absolute inset-0">
          {careersContent?.background_image_url ? (
            <img
              src={careersContent.background_image_url}
              alt={careersContent.hero_title || 'Trabalhe com a gente'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-900/75 to-gray-900/80" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-[0.16em]">
                <Briefcase className="w-3 h-3 mr-1" />
                Carreiras
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {careersContent?.hero_title || 'Trabalhe com a gente'}
            </h1>
            <p className="text-lg text-gray-200 max-w-2xl mx-auto">
              {careersContent?.hero_subtitle ||
                'Estamos sempre em busca de profissionais que queiram crescer junto com a Central Contábil e com os nossos clientes.'}
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              {careersContent?.culture_title || 'Cultura e propósito'}
            </h2>
            <p className="text-gray-700 leading-relaxed text-base md:text-lg">
              {careersContent?.culture_text ||
                'A Central Contábil tem mais de três décadas de história construídas com transparência, confiança e foco em resultados. Valorizamos um ambiente colaborativo, com desenvolvimento contínuo e visão de longo prazo para nossa equipe e nossos clientes.'}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {careersContent?.vacancies_title || 'Vagas em aberto'}
            </h3>
            <p className="text-gray-700 mb-4">
              {careersContent?.vacancies_text ||
                'Neste momento não há vagas publicadas, mas estamos sempre avaliando novos talentos. Preencha o formulário abaixo e envie seu currículo para nossa equipe.'}
            </p>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Nome completo"
                  value={formData.name}
                  onChange={(value) => setFormData((prev) => ({ ...prev, name: value }))}
                  error={errors.name}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(value) => setFormData((prev) => ({ ...prev, email: value }))}
                  error={errors.email}
                  required
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Telefone"
                  value={formData.phone}
                  onChange={(value) => setFormData((prev) => ({ ...prev, phone: value }))}
                />
                <Input
                  label="Área de interesse / Posição"
                  value={formData.position}
                  onChange={(value) => setFormData((prev) => ({ ...prev, position: value }))}
                />
              </div>
              <Input
                label="LinkedIn (opcional)"
                value={formData.linkedinUrl}
                onChange={(value) => setFormData((prev) => ({ ...prev, linkedinUrl: value }))}
              />
              <Input
                label="Mensagem / Apresentação (opcional)"
                type="textarea"
                value={formData.message}
                onChange={(value) => setFormData((prev) => ({ ...prev, message: value }))}
              />

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Currículo (PDF, DOC ou DOCX)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="cv-file"
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setCvFile(file);
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('cv-file')?.click()}
                    disabled={uploadingCv || submitting}
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {cvFile ? cvFile.name : 'Selecionar arquivo'}
                  </Button>
                  <span className="text-xs text-gray-500">
                    Máx. 10MB
                  </span>
                </div>
              </div>

              {/* Honeypot */}
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

              {/* hCaptcha */}
              {(() => {
                const isDevelopment =
                  import.meta.env.DEV ||
                  window.location.hostname === 'localhost' ||
                  window.location.hostname === '127.0.0.1';

                if (isDevelopment) {
                  return (
                    <div className="p-3 bg-yellow-50 border border-yellow-200">
                      <p className="text-yellow-800 text-sm">
                        <strong>Modo Desenvolvimento:</strong> Validação de segurança desabilitada para
                        testes em localhost.
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
                  </div>
                );
              })()}

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      Enviar candidatura
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {careersContent?.benefits_title || 'Benefícios'}
              </h3>
              <ul className="text-gray-700 text-sm space-y-1 list-disc list-inside">
                {careersContent?.benefits_text
                  ? careersContent.benefits_text.split('\n').map((item, index) => (
                      <li key={index}>{item}</li>
                    ))
                  : (
                    <>
                      <li>Ambiente estruturado e colaborativo</li>
                      <li>Exposição a diferentes segmentos de clientes</li>
                      <li>Desenvolvimento contínuo em contabilidade, fiscal e tributário</li>
                    </>
                  )}
              </ul>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {careersContent?.profile_title || 'Perfil que buscamos'}
              </h3>
              <ul className="text-gray-700 text-sm space-y-1 list-disc list-inside">
                {careersContent?.profile_text
                  ? careersContent.profile_text.split('\n').map((item, index) => (
                      <li key={index}>{item}</li>
                    ))
                  : (
                    <>
                      <li>Compromisso com qualidade e prazos</li>
                      <li>Vontade de aprender e crescer</li>
                      <li>Boa comunicação e trabalho em equipe</li>
                    </>
                  )}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <FooterBlake configuration={configuration} />
    </div>
  );
};


