import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
  as?: 'button' | 'span';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  fullWidth = false,
  as = 'button',
}) => {
  const baseClasses = 'font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 tracking-wide';
  
  const variantClasses = {
    primary: 'bg-green-700 text-white hover:bg-green-800 focus:ring-green-600 shadow-lg hover:shadow-xl',
    secondary: 'bg-green-100 text-green-800 hover:bg-green-200 focus:ring-green-500',
    outline: 'border-2 border-green-700 text-green-700 hover:bg-green-700 hover:text-white focus:ring-green-600',
    ghost: 'bg-transparent text-green-700 hover:bg-green-50 focus:ring-green-500 border border-transparent hover:border-green-200',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
  };

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105';
  const widthClasses = fullWidth ? 'w-full' : 'inline-flex items-center justify-center';

  const Component = as;
  
  return (
    <Component
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${widthClasses} ${className}`}
    >
      {children}
    </Component>
  );
};