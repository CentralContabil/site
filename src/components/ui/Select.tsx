import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  placeholder?: string;
}

interface SelectContextType {
  value?: string;
  onValueChange?: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const SelectContext = React.createContext<SelectContextType>({
  isOpen: false,
  setIsOpen: () => {},
});

export const Select: React.FC<SelectProps> = ({
  value,
  onValueChange,
  children,
  className = '',
  placeholder = 'Selecione uma opção',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen }}>
      <div ref={selectRef} className={`relative ${className}`}>
        {children}
      </div>
    </SelectContext.Provider>
  );
};

export const SelectTrigger: React.FC<{
  children?: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  const { isOpen, setIsOpen } = React.useContext(SelectContext);

  return (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:border-[#3bb664] focus:outline-none focus:ring-2 focus:ring-[#3bb664] focus:ring-offset-2 ${className}`}
    >
      <span className="flex-1 text-gray-900">{children}</span>
      <ChevronDown
        className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
      />
    </button>
  );
};

export const SelectValue: React.FC<{
  placeholder?: string;
  children?: React.ReactNode;
}> = ({ placeholder, children }) => {
  const { value } = React.useContext(SelectContext);
  
  // Se houver children, renderizar children
  if (children) {
    return <>{children}</>;
  }
  
  // Caso contrário, mostrar o valor ou placeholder
  return <span>{value || placeholder || 'Selecione uma opção'}</span>;
};

export const SelectContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  const { isOpen } = React.useContext(SelectContext);

  if (!isOpen) return null;

  return (
    <div
      className={`absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto ${className}`}
    >
      {children}
    </div>
  );
};

export const SelectItem: React.FC<{
  value: string;
  children: React.ReactNode;
  className?: string;
}> = ({ value, children, className = '' }) => {
  const { value: selectedValue, onValueChange, setIsOpen } = React.useContext(SelectContext);

  const handleClick = () => {
    onValueChange?.(value);
    setIsOpen(false);
  };

  const isSelected = selectedValue === value;

  return (
    <div
      onClick={handleClick}
      className={`px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors ${
        isSelected ? 'bg-[#3bb664]/10 text-[#3bb664] font-medium' : 'text-gray-900'
      } ${className}`}
    >
      {children}
    </div>
  );
};

