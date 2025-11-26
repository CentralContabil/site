import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Configuration } from '../types';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  configuration?: Configuration | null;
  schema?: object;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  configuration,
  schema,
}) => {
  const location = useLocation();
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const currentUrl = url || `${baseUrl}${location.pathname}`;
  const companyName = configuration?.companyName || 'Central Contábil';
  const companyDescription = configuration?.email 
    ? `${companyName} - Soluções contábeis estratégicas para empresas que buscam crescimento sustentável.`
    : 'Soluções contábeis estratégicas para empresas que buscam crescimento sustentável.';
  
  const finalTitle = title 
    ? `${title} — ${companyName}`
    : `${companyName} - Contabilidade Consultiva`;
  
  const finalDescription = description || companyDescription;
  const finalImage = image || configuration?.logo_url || `${baseUrl}/favicon.svg`;
  const finalKeywords = keywords || `contabilidade, consultoria contábil, ${companyName}, serviços contábeis, assessoria contábil`;

  useEffect(() => {
    // Title
    document.title = finalTitle;

    // Meta tags básicas
    updateMetaTag('description', finalDescription);
    updateMetaTag('keywords', finalKeywords);
    updateMetaTag('author', author || companyName);
    updateMetaTag('robots', 'index, follow');

    // Open Graph (Facebook, LinkedIn)
    updateMetaTag('og:title', finalTitle, 'property');
    updateMetaTag('og:description', finalDescription, 'property');
    updateMetaTag('og:image', finalImage, 'property');
    updateMetaTag('og:url', currentUrl, 'property');
    updateMetaTag('og:type', type, 'property');
    updateMetaTag('og:site_name', companyName, 'property');
    if (configuration?.facebook_url) {
      updateMetaTag('og:see_also', configuration.facebook_url, 'property');
    }

    // Twitter Cards
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', finalTitle);
    updateMetaTag('twitter:description', finalDescription);
    updateMetaTag('twitter:image', finalImage);
    if (configuration?.twitter_url) {
      const twitterHandle = configuration.twitter_url.replace(/^https?:\/\/(www\.)?twitter\.com\//, '').replace(/^@/, '');
      if (twitterHandle) {
        updateMetaTag('twitter:site', `@${twitterHandle}`);
        updateMetaTag('twitter:creator', `@${twitterHandle}`);
      }
    }

    // Canonical URL
    updateLinkTag('canonical', currentUrl);

    // Schema.org JSON-LD
    if (schema) {
      updateSchemaScript(schema);
    } else {
      // Schema padrão (LocalBusiness)
      const defaultSchema = {
        '@context': 'https://schema.org',
        '@type': 'AccountingService',
        name: companyName,
        description: finalDescription,
        url: baseUrl,
        logo: finalImage,
        image: finalImage,
        telephone: configuration?.phone,
        email: configuration?.email || configuration?.contact_email,
        address: configuration?.address ? {
          '@type': 'PostalAddress',
          streetAddress: configuration.address,
        } : undefined,
        sameAs: [
          configuration?.facebook_url,
          configuration?.instagram_url,
          configuration?.linkedin_url,
        ].filter(Boolean),
      };
      updateSchemaScript(defaultSchema);
    }

    // Language
    const html = document.documentElement;
    html.setAttribute('lang', 'pt-BR');

    return () => {
      // Cleanup não é necessário pois as meta tags são atualizadas
    };
  }, [
    finalTitle,
    finalDescription,
    finalImage,
    finalKeywords,
    currentUrl,
    type,
    author,
    companyName,
    configuration,
    schema,
    baseUrl,
  ]);

  return null;
};

function updateMetaTag(name: string, content: string, attribute: 'name' | 'property' = 'name') {
  if (!content) return;

  let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
  
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  
  element.setAttribute('content', content);
}

function updateLinkTag(rel: string, href: string) {
  if (!href) return;

  let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
  
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  
  element.setAttribute('href', href);
}

function updateSchemaScript(schema: object) {
  // Remove schema antigo
  const existingScript = document.querySelector('script[type="application/ld+json"]');
  if (existingScript) {
    existingScript.remove();
  }

  // Adiciona novo schema
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema, null, 2);
  document.head.appendChild(script);
}




