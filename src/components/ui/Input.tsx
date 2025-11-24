import React from 'react';

interface InputProps {
  label?: string;
  type?: 'text' | 'email' | 'tel' | 'password' | 'textarea' | 'file';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onChangeFile?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  maxLength?: number;
  pattern?: string;
  accept?: string;
  id?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onChangeFile,
  error,
  required = false,
  className = '',
  disabled = false,
  maxLength,
  pattern,
  accept,
  id,
}) => {
  const baseClasses = 'w-full px-4 py-3 border bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3bb664] focus:border-[#3bb664] transition-colors';
  const errorClasses = error ? 'border-red-500' : 'border-gray-300';

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      {type === 'textarea' ? (
        <textarea
          placeholder={placeholder}
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value)}
          className={`${baseClasses} ${errorClasses} min-h-[100px] resize-y`}
          required={required}
          disabled={disabled}
          maxLength={maxLength}
        />
      ) : type === 'file' ? (
        <input
          type="file"
          id={id}
          accept={accept}
          onChange={onChangeFile}
          className={`${baseClasses} ${errorClasses}`}
          required={required}
          disabled={disabled}
        />
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value)}
          className={`${baseClasses} ${errorClasses}`}
          required={required}
          disabled={disabled}
          maxLength={maxLength}
          pattern={pattern}
        />
      )}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};