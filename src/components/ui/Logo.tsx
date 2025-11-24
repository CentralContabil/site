import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'medium', 
  className = '', 
  onClick 
}) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  return (
    <div 
      className={`relative ${sizeClasses[size]} ${className} cursor-pointer`}
      onClick={onClick}
    >
      {/* Outer ring - green with gray segment */}
      <svg 
        viewBox="0 0 100 100" 
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background circle */}
        <circle 
          cx="50" 
          cy="50" 
          r="48" 
          fill="none" 
          stroke="#77A86F" 
          strokeWidth="4"
          strokeDasharray="220 80"
          strokeDashoffset="0"
          transform="rotate(-90 50 50)"
        />
        
        {/* Gray segment on right side */}
        <circle 
          cx="50" 
          cy="50" 
          r="48" 
          fill="none" 
          stroke="#979797" 
          strokeWidth="4"
          strokeDasharray="15 285"
          strokeDashoffset="220"
          transform="rotate(-90 50 50)"
        />
        
        {/* Middle ring - thinner green with gray wedge */}
        <circle 
          cx="50" 
          cy="50" 
          r="35" 
          fill="none" 
          stroke="#77A86F" 
          strokeWidth="2.5"
          strokeDasharray="160 60"
          strokeDashoffset="0"
          transform="rotate(-90 50 50)"
        />
        
        {/* Gray wedge for middle ring */}
        <circle 
          cx="50" 
          cy="50" 
          r="35" 
          fill="none" 
          stroke="#979797" 
          strokeWidth="2.5"
          strokeDasharray="12 208"
          strokeDashoffset="160"
          transform="rotate(-90 50 50)"
        />
        
        {/* Inner ring - small green with gray segment */}
        <circle 
          cx="50" 
          cy="50" 
          r="22" 
          fill="none" 
          stroke="#77A86F" 
          strokeWidth="2"
          strokeDasharray="100 38"
          strokeDashoffset="0"
          transform="rotate(-90 50 50)"
        />
        
        {/* Gray segment for inner ring */}
        <circle 
          cx="50" 
          cy="50" 
          r="22" 
          fill="none" 
          stroke="#979797" 
          strokeWidth="2"
          strokeDasharray="8 130"
          strokeDashoffset="100"
          transform="rotate(-90 50 50)"
        />
        
        {/* Center white circle */}
        <circle 
          cx="50" 
          cy="50" 
          r="8" 
          fill="white"
        />
      </svg>
    </div>
  );
};