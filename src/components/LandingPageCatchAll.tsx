import React from 'react';
import { useParams } from 'react-router-dom';
import { LandingPagePage } from '../pages/LandingPagePage';

// Componente simples que redireciona para LandingPagePage
// A LandingPagePage já faz a verificação se a página existe
export function LandingPageCatchAll() {
  const { slug } = useParams<{ slug: string }>();
  
  // Simplesmente renderiza a LandingPagePage que já faz a validação
  return <LandingPagePage />;
}

