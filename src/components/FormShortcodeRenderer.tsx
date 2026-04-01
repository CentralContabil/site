import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Form, FormField } from '../types';
import { FormFieldRenderer } from '../pages/LandingPagePage';
import { ReCaptcha } from './ReCaptcha';
import { toast } from 'sonner';
import { useConfiguration } from '../hooks/useConfiguration';

interface FormShortcodeRendererProps {
  formId?: string;
  formSlug?: string;
  landingPageId?: string;
}

export const FormShortcodeRenderer: React.FC<FormShortcodeRendererProps> = ({ 
  formId, 
  formSlug,
  landingPageId 
}) => {
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState<string>('');
  const { configuration } = useConfiguration();

  useEffect(() => {
    loadForm();
  }, [formId, formSlug]);

  // Simular captcha token em desenvolvimento
  useEffect(() => {
    const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isDevelopment && !captchaToken) {
      setCaptchaToken('dev-token-localhost');
    }
  }, []);

  const loadForm = async () => {
    try {
      setLoading(true);
      let response;
      
      if (formId) {
        response = await apiService.getFormById(formId);
      } else if (formSlug) {
        response = await apiService.getFormBySlug(formSlug);
      } else {
        setLoading(false);
        return;
      }

      setForm(response.form);
      
      // Inicializar formData com valores vazios
      const initialData: Record<string, any> = {};
      response.form.fields?.forEach((field) => {
        initialData[field.field_name] = '';
      });
      setFormData(initialData);
    } catch (error: any) {
      console.error('Error loading form:', error);
      toast.error('Erro ao carregar formulário');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form) return;

    // Validação básica do captcha no cliente
    const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isDevelopment && !captchaToken) {
      setCaptchaError('Por favor, confirme que você não é um robô');
      return;
    }

    setSubmitting(true);
    try {
      await apiService.submitReusableForm(form.id, formData, landingPageId);
      toast.success('Formulário enviado com sucesso! Entraremos em contato em breve.');
      
      // Limpar formulário
      const resetData: Record<string, any> = {};
      form.fields?.forEach((field) => {
        resetData[field.field_name] = '';
      });
      setFormData(resetData);
      setHoneypot('');
      setCaptchaToken(null);
      setCaptchaError('');
      
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
      <div className="text-center py-8 text-gray-500">
        Carregando formulário...
      </div>
    );
  }

  if (!form || !form.is_active) {
    return null;
  }

  if (!form.fields || form.fields.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 my-8">
      {form.title && (
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{form.title}</h2>
      )}
      {form.description && (
        <p className="text-gray-600 mb-6">{form.description}</p>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Honeypot field */}
        <input
          type="text"
          name="honeypot"
          style={{ display: 'none' }}
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />

        {form.fields.map((field) => (
          <FormFieldRenderer
            key={field.id}
            field={field}
            value={formData[field.field_name] || ''}
            onChange={(value) =>
              setFormData({ ...formData, [field.field_name]: value })
            }
          />
        ))}

        {/* hCaptcha */}
        {configuration?.hcaptcha_site_key && (
          <div className="mt-4">
            <ReCaptcha
              siteKey={configuration.hcaptcha_site_key}
              onVerify={setCaptchaToken}
              onExpire={() => setCaptchaToken(null)}
            />
            {captchaError && (
              <p className="text-red-500 text-sm mt-2">{captchaError}</p>
            )}
          </div>
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
  );
};

