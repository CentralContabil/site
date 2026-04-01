import React, { useState, useEffect } from 'react';
import { FormShortcodeRenderer } from './FormShortcodeRenderer';

interface ContentWithShortcodesProps {
  content: string;
  landingPageId?: string;
}

export const ContentWithShortcodes: React.FC<ContentWithShortcodesProps> = ({ 
  content, 
  landingPageId 
}) => {
  const [processedContent, setProcessedContent] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    processContent();
  }, [content, landingPageId]);

  const processContent = () => {
    if (!content) {
      setProcessedContent([]);
      return;
    }

    // Regex para encontrar shortcodes [form id="xxx"] ou [form slug="xxx"]
    const shortcodeRegex = /\[form\s+(?:id|slug)="([^"]+)"\]/gi;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = shortcodeRegex.exec(content)) !== null) {
      // Adicionar conteúdo antes do shortcode
      if (match.index > lastIndex) {
        const htmlContent = content.substring(lastIndex, match.index);
        parts.push(
          <div
            key={`content-${lastIndex}`}
            className="text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        );
      }

      // Extrair atributo (id ou slug)
      const attribute = match[0].includes('id=') ? 'id' : 'slug';
      const value = match[1];

      // Adicionar componente do formulário
      parts.push(
        <FormShortcodeRenderer
          key={`form-${match.index}`}
          formId={attribute === 'id' ? value : undefined}
          formSlug={attribute === 'slug' ? value : undefined}
          landingPageId={landingPageId}
        />
      );

      lastIndex = match.index + match[0].length;
    }

    // Adicionar conteúdo restante após o último shortcode
    if (lastIndex < content.length) {
      const htmlContent = content.substring(lastIndex);
      parts.push(
        <div
          key={`content-${lastIndex}`}
          className="text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      );
    }

    // Se não houver shortcodes, renderizar o conteúdo normalmente
    if (parts.length === 0) {
      parts.push(
        <div
          key="content-full"
          className="text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }

    setProcessedContent(parts);
  };

  return <div className="prose prose-lg max-w-none">{processedContent}</div>;
};


