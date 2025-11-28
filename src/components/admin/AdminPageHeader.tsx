import React from 'react';
import { Save } from 'lucide-react';
import { Button } from '../ui/Button';

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  onSave?: () => void;
  saving?: boolean;
  saveLabel?: string;
  children?: React.ReactNode;
}

export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
  title,
  subtitle,
  onSave,
  saving = false,
  saveLabel = 'Salvar Alterações',
  children
}) => {
  return (
    <div className="flex justify-between items-start mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        {subtitle && (
          <p className="text-gray-600 mt-1">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {children}
        {onSave && (
          <Button
            onClick={onSave}
            disabled={saving}
            className="bg-[#3bb664] hover:bg-[#2d9a4f] text-white"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Salvando...' : saveLabel}
          </Button>
        )}
      </div>
    </div>
  );
};




