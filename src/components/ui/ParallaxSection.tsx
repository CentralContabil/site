import React, { useEffect, useRef, useState } from 'react';

interface ParallaxSectionProps {
  children: React.ReactNode;
  backgroundImage?: string;
  backgroundColor?: string;
  parallaxSpeed?: number;
  minHeight?: string;
  className?: string;
  overlay?: boolean;
  overlayOpacity?: number;
  overlayColor?: string;
}

export const ParallaxSection: React.FC<ParallaxSectionProps> = ({
  children,
  backgroundImage,
  backgroundColor = 'transparent',
  parallaxSpeed = 0.5,
  minHeight = '60vh',
  className = '',
  overlay = true,
  overlayOpacity = 0.3,
  overlayColor = 'bg-black'
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Set initial value

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const getParallaxStyle = () => {
    if (!backgroundImage) return {};
    
    const sectionTop = sectionRef.current?.offsetTop || 0;
    const sectionHeight = sectionRef.current?.offsetHeight || 0;
    const windowHeight = window.innerHeight;
    
    // Calculate parallax effect
    const parallaxStart = sectionTop - windowHeight;
    const parallaxEnd = sectionTop + sectionHeight;
    
    if (scrollY >= parallaxStart && scrollY <= parallaxEnd) {
      const parallaxProgress = (scrollY - parallaxStart) / (parallaxEnd - parallaxStart);
      const translateY = parallaxProgress * parallaxSpeed * 100;
      
      return {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
        transform: `translateY(${translateY}px)`,
      };
    }
    
    return {
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      backgroundRepeat: 'no-repeat',
    };
  };

  return (
    <section 
      ref={sectionRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        minHeight,
        backgroundColor: backgroundImage ? 'transparent' : backgroundColor,
      }}
    >
      {/* Background Image with Parallax */}
      {backgroundImage && (
        <div 
          className="absolute inset-0 z-0"
          style={getParallaxStyle()}
        />
      )}
      
      {/* Overlay */}
      {overlay && backgroundImage && (
        <div 
          className={`absolute inset-0 z-10 ${overlayColor}`}
          style={{ opacity: overlayOpacity }}
        />
      )}
      
      {/* Content */}
      <div className="relative z-20 h-full">
        {children}
      </div>
    </section>
  );
};

// Enhanced Parallax Component with modern smooth scrolling effect
export const SmoothParallaxSection: React.FC<ParallaxSectionProps> = ({
  children,
  backgroundImage,
  backgroundColor = 'transparent',
  parallaxSpeed = 0.3,
  minHeight = '60vh',
  className = '',
  overlay = true,
  overlayOpacity = 0.4,
  overlayColor = 'bg-black'
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!backgroundImage || !isVisible) return;

    const handleScroll = () => {
      if (sectionRef.current && backgroundRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const scrolled = window.scrollY;
        const rate = (scrolled - rect.top + window.innerHeight) * parallaxSpeed;
        
        backgroundRef.current.style.transform = `translate3d(0, ${rate}px, 0)`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [backgroundImage, parallaxSpeed, isVisible]);

  return (
    <section 
      ref={sectionRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        minHeight,
        backgroundColor: backgroundImage ? 'transparent' : backgroundColor,
      }}
    >
      {/* Background Image Container */}
      {backgroundImage && (
        <div 
          ref={backgroundRef}
          className="absolute inset-0 z-0 will-change-transform"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            transform: 'translate3d(0, 0, 0)',
            transition: 'transform 0.1s linear',
          }}
        />
      )}
      
      {/* Overlay */}
      {overlay && backgroundImage && (
        <div 
          className={`absolute inset-0 z-10 ${overlayColor}`}
          style={{ opacity: overlayOpacity }}
        />
      )}
      
      {/* Content */}
      <div className="relative z-20 h-full">
        {children}
      </div>
    </section>
  );
};