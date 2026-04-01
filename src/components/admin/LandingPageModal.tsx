import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, GripVertical, Save, Upload, Image as ImageIcon, FileText } from 'lucide-react';
import { apiService } from '../../services/api';
import { toast } from 'sonner';
import { LandingPage, FormField, FormFieldType, Form } from '../../types';
import { RichTextEditor } from '../ui/RichTextEditor';

interface LandingPageModalProps {
  page: LandingPage | null;
  onClose: () => void;
  onSave: () => void;
}

export function LandingPageModal({ page, onClose, onSave }: LandingPageModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    hero_title: '',
    hero_subtitle: '',
    hero_image_url: '',
    hero_background_color: '',
    content: '',
    featured_image_url: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    is_active: true,
    is_published: false,
  });

  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [activeTab, setActiveTab] = useState<'content' | 'form' | 'seo'>('content');
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [availableForms, setAvailableForms] = useState<Form[]>([]);
  const [showFormSelector, setShowFormSelector] = useState(false);
  const editorRef = React.useRef<any>(null);

  useEffect(() => {
    loadAvailableForms();
  }, []);

  const loadAvailableForms = async () => {
    try {
      const response = await apiService.getForms(true); // Apenas formulários ativos
      setAvailableForms(response.forms || []);
    } catch (error) {
      console.error('Error loading forms:', error);
    }
  };

  const insertFormShortcode = (formId: string) => {
    // Encontrar o formulário pelo ID para obter o slug
    const form = availableForms.find(f => f.id === formId);
    const slug = form?.slug || formId; // Usar slug se disponível, senão usar ID como fallback
    
    const shortcode = `[form slug="${slug}"]`;
    
    // Se o editor Quill estiver disponível, inserir na posição do cursor
    if (editorRef.current) {
      try {
        const quill = editorRef.current.getEditor();
        if (quill) {
          const range = quill.getSelection();
          if (range) {
            // Inserir na posição do cursor
            quill.insertText(range.index, shortcode, 'user');
            quill.setSelection(range.index + shortcode.length);
          } else {
            // Se não houver seleção, adicionar no final
            const length = quill.getLength();
            quill.insertText(length - 1, shortcode, 'user');
            quill.setSelection(length - 1 + shortcode.length);
          }
          // Atualizar o estado também
          const updatedContent = quill.root.innerHTML;
          setFormData({ ...formData, content: updatedContent });
        }
      } catch (error) {
        console.error('Error inserting shortcode in Quill:', error);
        // Fallback: adicionar ao final do conteúdo
        const currentContent = formData.content || '';
        setFormData({ ...formData, content: currentContent + (currentContent ? ' ' : '') + shortcode });
      }
    } else {
      // Fallback: adicionar ao final do conteúdo
      const currentContent = formData.content || '';
      setFormData({ ...formData, content: currentContent + (currentContent ? ' ' : '') + shortcode });
    }
    
    setShowFormSelector(false);
    toast.success('Shortcode do formulário inserido!');
  };

  useEffect(() => {
    if (page) {
      setFormData({
        title: page.title || '',
        slug: page.slug || '',
        description: page.description || '',
        hero_title: page.hero_title || '',
        hero_subtitle: page.hero_subtitle || '',
        hero_image_url: page.hero_image_url || '',
        hero_background_color: page.hero_background_color || '',
        content: page.content || '',
        featured_image_url: (page as any).featured_image_url || '',
        meta_title: page.meta_title || '',
        meta_description: page.meta_description || '',
        meta_keywords: page.meta_keywords || '',
        is_active: page.is_active,
        is_published: page.is_published,
      });
      setFormFields(page.form_fields || []);
      // Limpar estados de imagem temporária quando editando
      setSelectedImageFile(null);
      setImagePreview(null);
    } else {
      // Limpar tudo quando criando nova landing page
      setFormData({
        title: '',
        slug: '',
        description: '',
        hero_title: '',
        hero_subtitle: '',
        hero_image_url: '',
        hero_background_color: '',
        content: '',
        featured_image_url: '',
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
        is_active: true,
        is_published: false,
      });
      setFormFields([]);
      setSelectedImageFile(null);
      setImagePreview(null);
    }
  }, [page]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let landingPageId = page?.id;
      let finalFormData = { ...formData };

      // Se há uma imagem selecionada mas ainda não enviada, fazer upload primeiro
      if (selectedImageFile && !page) {
        setUploadingImage(true);
        try {
          const result = await apiService.uploadLandingPageImage(selectedImageFile);
          finalFormData.featured_image_url = result.url;
          setFormData(finalFormData);
          setSelectedImageFile(null);
          setImagePreview(null);
        } catch (error: any) {
          console.error('Erro ao fazer upload da imagem:', error);
          toast.error(error?.message || 'Erro ao fazer upload da imagem');
          setUploadingImage(false);
          setSaving(false);
          return;
        } finally {
          setUploadingImage(false);
        }
      }

      if (page) {
        // Atualizar landing page existente
        await apiService.updateLandingPage(page.id, finalFormData);
        landingPageId = page.id;
        toast.success('Landing page atualizada com sucesso!');
      } else {
        // Criar nova landing page
        const response = await apiService.createLandingPage(finalFormData);
        landingPageId = response.landingPage.id;
        toast.success('Landing page criada com sucesso!');
      }

      // Salvar/atualizar campos do formulário
      if (landingPageId && formFields.length > 0) {
        for (const field of formFields) {
          // Validar campos obrigatórios antes de salvar
          if (!field.field_name || !field.field_label || !field.field_type) {
            toast.error(`Campo ${field.field_label || 'sem nome'} está incompleto. Preencha todos os campos obrigatórios.`);
            continue;
          }

          try {
            if (field.id && !field.id.startsWith('temp-')) {
              // Atualizar campo existente
              await apiService.updateFormField(field.id, {
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
              // Criar novo campo
              await apiService.createFormField({
                landing_page_id: landingPageId,
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

      // Limpar estados de imagem temporária após salvar
      setSelectedImageFile(null);
      setImagePreview(null);

      onSave();
    } catch (error: any) {
      console.error('Error saving landing page:', error);
      toast.error(error?.message || 'Erro ao salvar landing page');
    } finally {
      setSaving(false);
    }
  };

  const handleAddField = () => {
    setFormFields([
      ...formFields,
      {
        id: `temp-${Date.now()}`,
        landing_page_id: page?.id || '',
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
        await apiService.deleteFormField(field.id);
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

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione um arquivo de imagem');
      return;
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    // Se já existe uma landing page, fazer upload imediatamente
    if (page) {
      handleImageUpload(file);
    } else {
      // Se é nova landing page, apenas armazenar o arquivo e criar preview
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }

    event.target.value = '';
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const result = await apiService.uploadLandingPageImage(file);
      const updatedFormData = { ...formData, featured_image_url: result.url };
      setFormData(updatedFormData);
      
      // Se já existe landing page, salvar automaticamente
      if (page) {
        await apiService.updateLandingPage(page.id, {
          featured_image_url: result.url,
        });
        toast.success('Imagem enviada e salva com sucesso!');
      }
      
      // Limpar arquivo selecionado e preview
      setSelectedImageFile(null);
      setImagePreview(null);
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      toast.error(error?.message || 'Erro ao fazer upload da imagem');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!window.confirm('Tem certeza que deseja remover a imagem destacada?')) {
      return;
    }

    // Limpar imagem selecionada e preview
    setSelectedImageFile(null);
    setImagePreview(null);
    setFormData({ ...formData, featured_image_url: '' });

    // Se já existe landing page, salvar a remoção
    if (page) {
      try {
        await apiService.updateLandingPage(page.id, {
          featured_image_url: '',
        });
        toast.success('Imagem removida com sucesso!');
      } catch (error: any) {
        console.error('Erro ao remover imagem:', error);
        toast.error(error?.message || 'Erro ao remover imagem');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-900">
            {page ? 'Editar Landing Page' : 'Nova Landing Page'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="border-b mb-4">
              <nav className="flex -mb-px">
                <button
                  type="button"
                  onClick={() => setActiveTab('content')}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === 'content'
                      ? 'border-b-2 border-[#3bb664] text-[#3bb664]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Conteúdo
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('form')}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === 'form'
                      ? 'border-b-2 border-[#3bb664] text-[#3bb664]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Formulário ({formFields.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('seo')}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === 'seo'
                      ? 'border-b-2 border-[#3bb664] text-[#3bb664]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  SEO
                </button>
              </nav>
            </div>

            {activeTab === 'content' && (
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
                    placeholder="exemplo-landing-page"
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Título do Hero
                    </label>
                    <input
                      type="text"
                      value={formData.hero_title}
                      onChange={(e) => setFormData({ ...formData, hero_title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3bb664] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subtítulo do Hero
                    </label>
                    <input
                      type="text"
                      value={formData.hero_subtitle}
                      onChange={(e) => setFormData({ ...formData, hero_subtitle: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3bb664] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Imagem de Destaque
                  </label>
                  {(formData.featured_image_url || imagePreview) ? (
                    <div className="space-y-2">
                      <img
                        src={formData.featured_image_url || imagePreview || ''}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-lg border border-gray-300"
                      />
                      <div className="flex gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                          disabled={uploadingImage || saving}
                          id="landing-image-upload"
                        />
                        <button
                          type="button"
                          onClick={() => document.getElementById('landing-image-upload')?.click()}
                          disabled={uploadingImage || saving}
                          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {uploadingImage ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                              Enviando...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4" />
                              Trocar Imagem
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={handleDeleteImage}
                          disabled={uploadingImage || saving}
                          className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {selectedImageFile && !page && (
                        <p className="text-xs text-blue-600">Imagem será enviada ao salvar a landing page</p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                        disabled={uploadingImage || saving}
                        id="landing-image-upload-empty"
                      />
                      <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-[#3bb664] transition-colors"
                        onClick={() => {
                          if (!uploadingImage && !saving) {
                            document.getElementById('landing-image-upload-empty')?.click();
                          }
                        }}
                      >
                        {uploadingImage ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3bb664]"></div>
                            <p className="text-sm text-gray-600">Enviando...</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <ImageIcon className="w-12 h-12 text-gray-400" />
                            <p className="text-sm text-gray-600">
                              Clique para selecionar uma imagem
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG ou WEBP até 5MB</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Conteúdo
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowFormSelector(!showFormSelector)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[#3bb664] text-white rounded-lg hover:bg-[#2d9550] transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        Inserir Formulário
                      </button>
                      {showFormSelector && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setShowFormSelector(false)}
                          />
                          <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
                            {availableForms.length === 0 ? (
                              <div className="p-4 text-sm text-gray-500 text-center">
                                Nenhum formulário disponível
                              </div>
                            ) : (
                              <div className="py-2">
                                {availableForms.map((form) => (
                                  <button
                                    key={form.id}
                                    type="button"
                                    onClick={() => insertFormShortcode(form.id)}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors"
                                  >
                                    <div className="font-medium text-gray-900">{form.title}</div>
                                    <div className="text-xs text-gray-500">{form.slug}</div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <RichTextEditor
                    ref={editorRef}
                    value={formData.content || ''}
                    onChange={(content) => setFormData({ ...formData, content })}
                    placeholder="Digite o conteúdo da landing page..."
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Dica: Use o botão "Inserir Formulário" para adicionar formulários reutilizáveis ao conteúdo.
                  </p>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Status</h3>
                  <div className="flex gap-6">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="w-4 h-4 text-[#3bb664] border-gray-300 rounded focus:ring-[#3bb664] focus:ring-2 cursor-pointer"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">Ativo</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_published}
                        onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                        className="w-4 h-4 text-[#3bb664] border-gray-300 rounded focus:ring-[#3bb664] focus:ring-2 cursor-pointer"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">Publicado</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'form' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
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
            )}

            {activeTab === 'seo' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={formData.meta_title}
                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3bb664] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Description
                  </label>
                  <textarea
                    value={formData.meta_description}
                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3bb664] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Keywords
                  </label>
                  <input
                    type="text"
                    value={formData.meta_keywords}
                    onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3bb664] focus:border-transparent"
                    placeholder="palavra1, palavra2, palavra3"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="border-t bg-gray-50 p-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#3bb664] text-white rounded-lg hover:bg-[#2d9550] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Componente para editar um campo do formulário
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

