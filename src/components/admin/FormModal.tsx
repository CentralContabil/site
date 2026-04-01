import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, GripVertical, Save } from 'lucide-react';
import { apiService } from '../../services/api';
import { toast } from 'sonner';
import { Form, FormField, FormFieldType } from '../../types';

interface FormModalProps {
  form?: Form | null;
  onClose: () => void;
  onSave: () => void;
}

export const FormModal: React.FC<FormModalProps> = ({ form, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    is_active: true,
  });

  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (form) {
      setFormData({
        title: form.title || '',
        slug: form.slug || '',
        description: form.description || '',
        is_active: form.is_active,
      });
      setFormFields(form.fields || []);
    } else {
      setFormData({
        title: '',
        slug: '',
        description: '',
        is_active: true,
      });
      setFormFields([]);
    }
  }, [form]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let formId = form?.id;

      if (form) {
        await apiService.updateForm(form.id, formData);
        formId = form.id;
        toast.success('Formulário atualizado com sucesso!');
      } else {
        const response = await apiService.createForm(formData);
        formId = response.form.id;
        toast.success('Formulário criado com sucesso!');
      }

      // Salvar/atualizar campos do formulário
      if (formId && formFields.length > 0) {
        for (const field of formFields) {
          if (!field.field_name || !field.field_label || !field.field_type) {
            toast.error(`Campo ${field.field_label || 'sem nome'} está incompleto.`);
            continue;
          }

          try {
            if (field.id && !field.id.startsWith('temp-')) {
              await apiService.updateReusableFormField(field.id, {
                field_type: field.field_type,
                field_name: field.field_name,
                field_label: field.field_label,
                placeholder: field.placeholder || undefined,
                help_text: field.help_text || undefined,
                is_required: field.is_required || false,
                validation_rules: field.validation_rules || undefined,
                options: field.options || undefined,
                order: field.order || 0,
                is_active: field.is_active !== undefined ? field.is_active : true,
              });
            } else {
              await apiService.createReusableFormField({
                form_id: formId,
                field_type: field.field_type,
                field_name: field.field_name,
                field_label: field.field_label,
                placeholder: field.placeholder || undefined,
                help_text: field.help_text || undefined,
                is_required: field.is_required || false,
                validation_rules: field.validation_rules || undefined,
                options: field.options || undefined,
                order: field.order || 0,
                is_active: field.is_active !== undefined ? field.is_active : true,
              });
            }
          } catch (fieldError: any) {
            console.error(`Erro ao salvar campo ${field.field_name}:`, fieldError);
            toast.error(`Erro ao salvar campo "${field.field_label}": ${fieldError?.message || 'Erro desconhecido'}`);
          }
        }
      }

      onSave();
    } catch (error: any) {
      console.error('Error saving form:', error);
      toast.error(error?.message || 'Erro ao salvar formulário');
    } finally {
      setSaving(false);
    }
  };

  const handleAddField = () => {
    setFormFields([
      ...formFields,
      {
        id: `temp-${Date.now()}`,
        landing_page_id: null,
        form_id: form?.id || null,
        field_type: 'text',
        field_name: '',
        field_label: '',
        placeholder: '',
        help_text: '',
        is_required: false,
        validation_rules: null,
        options: null,
        order: formFields.length,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  };

  const handleRemoveField = async (index: number) => {
    const field = formFields[index];
    if (field.id && !field.id.startsWith('temp-')) {
      try {
        await apiService.deleteReusableFormField(field.id);
        toast.success('Campo removido com sucesso!');
      } catch (error) {
        console.error('Error deleting field:', error);
        toast.error('Erro ao remover campo');
      }
    }
    setFormFields(formFields.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index: number, field: Partial<FormField>) => {
    const updated = [...formFields];
    updated[index] = { ...updated[index], ...field };
    setFormFields(updated);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b bg-gray-50 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">
            {form ? 'Editar Formulário' : 'Novo Formulário'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3bb664] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug (URL)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3bb664] focus:border-transparent"
                  placeholder="exemplo-formulario"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3bb664] focus:border-transparent"
                />
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Campos do Formulário</h3>
                  <button
                    type="button"
                    onClick={handleAddField}
                    className="flex items-center gap-2 px-4 py-2 bg-[#3bb664] text-white rounded-lg hover:bg-[#2d9550]"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Campo
                  </button>
                </div>

                {formFields.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum campo adicionado ainda
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formFields.map((field, index) => (
                      <FormFieldEditor
                        key={field.id || index}
                        field={field}
                        index={index}
                        onChange={(updated) => handleFieldChange(index, updated)}
                        onRemove={() => handleRemoveField(index)}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Status</h3>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-[#3bb664] border-gray-300 rounded focus:ring-[#3bb664] focus:ring-2 cursor-pointer mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Ativo</span>
                </label>
              </div>
            </div>
          </div>

          <div className="border-t p-6 flex justify-end gap-3 bg-gray-50 shadow-inner flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium text-gray-700 bg-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-[#3bb664] text-white rounded-lg hover:bg-[#2d9550] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md font-medium transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Componente para editar um campo do formulário (reutilizado do LandingPageModal)
function FormFieldEditor({ field, index, onChange, onRemove }: any) {
  const fieldTypes: FormFieldType[] = ['text', 'email', 'tel', 'textarea', 'select', 'checkbox', 'radio', 'number', 'date', 'file'];

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <GripVertical className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Campo {index + 1}</span>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="text-red-600 hover:text-red-800"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Campo *
          </label>
          <select
            value={field.field_type}
            onChange={(e) => onChange({ field_type: e.target.value as FormFieldType })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3bb664] focus:border-transparent"
          >
            {fieldTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome Técnico *
          </label>
          <input
            type="text"
            value={field.field_name}
            onChange={(e) => onChange({ field_name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3bb664] focus:border-transparent"
            placeholder="email, phone, name..."
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Label (Texto exibido) *
        </label>
        <input
          type="text"
          value={field.field_label}
          onChange={(e) => onChange({ field_label: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3bb664] focus:border-transparent"
          placeholder="Seu e-mail"
        />
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Placeholder
        </label>
        <input
          type="text"
          value={field.placeholder || ''}
          onChange={(e) => onChange({ placeholder: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3bb664] focus:border-transparent"
        />
      </div>

      <div className="mt-4">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={field.is_required}
            onChange={(e) => onChange({ is_required: e.target.checked })}
            className="w-4 h-4 text-[#3bb664] border-gray-300 rounded focus:ring-[#3bb664] focus:ring-2 cursor-pointer mr-2"
          />
          <span className="text-sm font-medium text-gray-700">Campo obrigatório</span>
        </label>
      </div>
    </div>
  );
}

