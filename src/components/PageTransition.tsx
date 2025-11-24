import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState<'fadeIn' | 'fadeOut'>('fadeIn');

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setTransitionStage('fadeOut');
    }
  }, [location.pathname, displayLocation.pathname]);

  const onTransitionEnd = () => {
    if (transitionStage === 'fadeOut') {
      setDisplayLocation(location);
      setTransitionStage('fadeIn');
      // Scroll to top on page change (only if not a hash navigation)
      if (!location.hash) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <div
      className={`page-transition page-transition-${transitionStage}`}
      onAnimationEnd={onTransitionEnd}
      key={displayLocation.pathname}
      style={{ width: '100%', display: 'block' }}
    >
      {children}
    </div>
  );
};

