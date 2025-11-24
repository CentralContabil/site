import React from 'react';
import { SmoothParallaxSection } from './ui/ParallaxSection';

interface ParallaxBlockProps {
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  children?: React.ReactNode;
  height?: string;
  overlayOpacity?: number;
  textColor?: 'light' | 'dark';
  alignment?: 'left' | 'center' | 'right';
}

export const ParallaxBlock: React.FC<ParallaxBlockProps> = ({
  title,
  subtitle,
  description,
  imageUrl,
  children,
  height = '70vh',
  overlayOpacity = 0.5,
  textColor = 'light',
  alignment = 'center'
}) => {
  const textAlignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }[alignment];

  const textColorClass = textColor === 'light' ? 'text-white' : 'text-gray-900';
  const headingColorClass = textColor === 'light' ? 'text-white' : 'text-gray-900';
  const subheadingColorClass = textColor === 'light' ? 'text-gray-200' : 'text-gray-700';
  const descriptionColorClass = textColor === 'light' ? 'text-gray-300' : 'text-gray-600';

  return (
    <SmoothParallaxSection
      backgroundImage={imageUrl}
      minHeight={height}
      overlayOpacity={overlayOpacity}
      overlayColor="bg-black"
      className="flex items-center justify-center"
    >
      <div className={`container mx-auto px-4 max-w-6xl ${textAlignmentClass}`}>
        <div className="animate-fade-in-up">
          <h2 className={`text-4xl md:text-6xl font-bold ${headingColorClass} mb-6 leading-tight`}>
            {title}
          </h2>
          
          {subtitle && (
            <h3 className={`text-xl md:text-2xl ${subheadingColorClass} mb-8 font-light`}>
              {subtitle}
            </h3>
          )}
          
          {description && (
            <p className={`text-lg md:text-xl ${descriptionColorClass} mb-12 max-w-3xl ${alignment === 'center' ? 'mx-auto' : ''} leading-relaxed`}>
              {description}
            </p>
          )}
          
          {children}
        </div>
      </div>
    </SmoothParallaxSection>
  );
};

// Specialized parallax blocks for different content types
export const ParallaxHero: React.FC<Omit<ParallaxBlockProps, 'height'>> = (props) => (
  <ParallaxBlock {...props} height="100vh" overlayOpacity={0.6} />
);

export const ParallaxFeature: React.FC<Omit<ParallaxBlockProps, 'height'>> = (props) => (
  <ParallaxBlock {...props} height="80vh" overlayOpacity={0.4} />
);

export const ParallaxCTA: React.FC<Omit<ParallaxBlockProps, 'height'>> = (props) => (
  <ParallaxBlock {...props} height="50vh" overlayOpacity={0.7} />
);

// Modern parallax with gradient overlay and animated elements
export const ModernParallaxBlock: React.FC<ParallaxBlockProps> = ({
  title,
  subtitle,
  description,
  imageUrl,
  children,
  height = '70vh',
  overlayOpacity = 0.4,
  textColor = 'light',
  alignment = 'center'
}) => {
  const textAlignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }[alignment];

  return (
    <SmoothParallaxSection
      backgroundImage={imageUrl}
      minHeight={height}
      overlayOpacity={overlayOpacity}
      overlayColor="bg-gradient-to-br from-black/60 via-black/40 to-transparent"
      className="flex items-center justify-center"
    >
      <div className={`container mx-auto px-4 max-w-6xl ${textAlignmentClass}`}>
        <div className="transform hover:scale-105 transition-transform duration-700 ease-out">
          <div className="backdrop-blur-sm bg-white/10 rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl">
            <h2 className={`text-4xl md:text-6xl font-bold text-white mb-6 leading-tight bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent`}>
              {title}
            </h2>
            
            {subtitle && (
              <h3 className="text-xl md:text-2xl text-gray-200 mb-8 font-light">
                {subtitle}
              </h3>
            )}
            
            {description && (
              <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-3xl leading-relaxed">
                {description}
              </p>
            )}
            
            {children}
          </div>
        </div>
      </div>
    </SmoothParallaxSection>
  );
};