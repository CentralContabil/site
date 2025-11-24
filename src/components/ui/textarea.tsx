import React from 'react';

interface TextareaProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  id?: string;
  required?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({ 
  label,
  value, 
  onChange, 
  placeholder, 
  rows = 3, 
  className = '', 
  id,
  required = false
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        id={id}
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 placeholder:text-gray-400"
      />
    </div>
  );
};