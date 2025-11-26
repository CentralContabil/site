import { useState, useEffect } from 'react';
import { Configuration } from '../types';

interface ConfigurationResponse {
  id: string;
  company_name: string;
  phone?: string;
  email?: string;
  contact_email?: string;
  address?: string;
  business_hours?: string;
  facebook_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  logo_url?: string;
  logo_dark_url?: string;
  favicon_url?: string;
  whatsapp_number?: string;
  footer_years_text?: string;
  head_scripts?: string;
  body_scripts?: string;
  updated_at: string;
}

export function useConfiguration() {
  const [configuration, setConfiguration] = useState<Configuration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfiguration = async () => {
    try {
      setLoading(true);
      // Em desenvolvimento, usar o proxy do Vite (/api)
      // Em produção, usar a variável de ambiente ou fallback
      const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'http://localhost:3006/api');
      const response = await fetch(`${API_BASE_URL}/configurations`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar configurações');
      }
      
      const responseData = await response.json();
      console.log('⚙️ Configuração recebida (raw):', responseData);
      
      // A resposta pode vir como { configuration: {...} } ou diretamente como objeto
      const data: ConfigurationResponse = responseData.configuration || responseData;
      console.log('⚙️ Configuração processada:', data);
      
      // Função para converter URL relativa em absoluta
      const getAbsoluteUrl = (url?: string | null): string | undefined => {
        if (!url) return undefined;
        // Se já for uma URL absoluta (http:// ou https://), retornar como está
        if (url.startsWith('http://') || url.startsWith('https://')) {
          return url;
        }
        // Se for uma URL relativa começando com /, converter para absoluta
        if (url.startsWith('/')) {
          // Extrair a base URL do backend (remover /api se existir)
          let baseUrl = API_BASE_URL;
          if (baseUrl.endsWith('/api')) {
            baseUrl = baseUrl.slice(0, -4);
          } else if (baseUrl.includes('/api')) {
            baseUrl = baseUrl.replace('/api', '');
          }
          // Garantir que não há barra dupla
          return `${baseUrl}${url}`;
        }
        // Caso contrário, retornar como está
        return url;
      };
      
      console.log('🔗 URLs convertidas:', {
        logo_url: getAbsoluteUrl(data.logo_url),
        logo_dark_url: getAbsoluteUrl(data.logo_dark_url),
        favicon_url: getAbsoluteUrl(data.favicon_url)
      });
      
      // Transformar snake_case para camelCase
      const config: Configuration = {
        id: data.id || 'default',
        companyName: data.company_name || 'Central Contábil',
        company_name: data.company_name || 'Central Contábil',
        phone: data.phone,
        email: data.email,
        contact_email: data.contact_email,
        contactEmail: data.contact_email,
        address: data.address,
        businessHours: data.business_hours,
        business_hours: data.business_hours,
        facebookUrl: data.facebook_url,
        facebook_url: data.facebook_url,
        instagramUrl: data.instagram_url,
        instagram_url: data.instagram_url,
        linkedinUrl: data.linkedin_url,
        linkedin_url: data.linkedin_url,
        logo_url: getAbsoluteUrl(data.logo_url),
        logo_dark_url: getAbsoluteUrl(data.logo_dark_url),
        favicon_url: getAbsoluteUrl(data.favicon_url),
        whatsappNumber: data.whatsapp_number || undefined,
        whatsapp_number: data.whatsapp_number,
        footer_years_text: data.footer_years_text,
        footerYearsText: data.footer_years_text,
        head_scripts: data.head_scripts,
        headScripts: data.head_scripts,
        body_scripts: data.body_scripts,
        bodyScripts: data.body_scripts,
        updatedAt: data.updated_at ? new Date(data.updated_at) : new Date()
      };
      setConfiguration(config);
      setError(null);
    } catch (err) {
      console.error('❌ Erro ao buscar configurações:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      // Define configuração padrão quando a API falha
      setConfiguration({
        id: 'default',
        companyName: 'Central Contábil',
        updatedAt: new Date()
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfiguration().catch((err) => {
      console.error('Erro ao buscar configuração:', err);
      // Define configuração padrão em caso de erro
      setConfiguration({
        id: 'default',
        companyName: 'Central Contábil',
        updatedAt: new Date()
      });
      setLoading(false);
    });
  }, []);

  const refresh = () => {
    fetchConfiguration();
  };

  return {
    configuration,
    loading,
    error,
    refresh
  };
}