import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { RichTextEditor } from '../../components/ui/RichTextEditor';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Upload, Image as ImageIcon, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '../../services/api';

interface PrivacyPolicy {
  id: string;
  title: string;
  content: string;
  background_image_url?: string | null;
}

export const PrivacyPolicyAdmin: React.FC = () => {
  const [policy, setPolicy] = useState<PrivacyPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    title: 'Política de Privacidade',
    content: '',
  });

  useEffect(() => {
    fetchPolicy();
  }, []);

  const fetchPolicy = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPrivacyPolicyAdmin();
      if (response.success && response.policy) {
        setPolicy(response.policy);
        setFormData({
          title: response.policy.title || 'Política de Privacidade',
          content: response.policy.content || '',
        });
      }
    } catch (error: any) {
      console.error('Erro ao carregar política:', error);
      toast.error('Erro ao carregar política de privacidade');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      // Garantir que estamos usando o valor mais recente do formData
      const contentToSave = formData.content || '';
      const titleToSave = formData.title || 'Política de Privacidade';
      
      console.log('Salvando política:', { 
        title: titleToSave, 
        contentLength: contentToSave.length,
        containsTable: contentToSave.includes('<table'),
        containsTableBody: contentToSave.includes('<tbody'),
        containsTableRow: contentToSave.includes('<tr'),
        containsTableCell: contentToSave.includes('<td'),
      });
      
      // Log uma amostra do conteúdo para debug
      if (contentToSave.length > 0) {
        const sample = contentToSave.substring(0, 500);
        console.log('Amostra do conteúdo (primeiros 500 chars):', sample);
      }
      
      const response = await apiService.updatePrivacyPolicy({
        title: titleToSave,
        content: contentToSave,
      });

      if (response.success) {
        toast.success('Política de privacidade atualizada com sucesso!');
        setPolicy(response.policy);
        // Atualizar formData com a resposta do servidor para garantir sincronização
        setFormData({
          title: response.policy.title || titleToSave,
          content: response.policy.content || contentToSave,
        });
      }
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast.error(error.message || 'Erro ao salvar política de privacidade');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const response = await apiService.uploadPrivacyPolicyBackgroundImage(file);
      if (response.success) {
        toast.success('Imagem de fundo atualizada com sucesso!');
        if (policy) {
          setPolicy({ ...policy, background_image_url: response.data.url });
        }
      }
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      toast.error(error.message || 'Erro ao fazer upload da imagem');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleDeleteImage = async () => {
    if (!policy?.background_image_url) return;

    if (!window.confirm('Tem certeza que deseja remover a imagem de fundo?')) {
      return;
    }

    try {
      setUploadingImage(true);
      const response = await apiService.updatePrivacyPolicy({
        title: formData.title,
        content: formData.content,
        background_image_url: null,
      });
      
      if (response.success) {
        setPolicy({ ...policy, background_image_url: null });
        toast.success('Imagem removida com sucesso!');
      }
    } catch (error: any) {
      console.error('Erro ao remover imagem:', error);
      toast.error('Erro ao remover imagem');
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3bb664]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Política de Privacidade</h1>
          <p className="text-gray-600 mt-1">Gerencie a política de privacidade e conformidade com a LGPD</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configurações da Política de Privacidade</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título *
                </label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(value) => setFormData({ ...formData, title: value })}
                  required
                  placeholder="Título da política de privacidade"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conteúdo *
                </label>
                {formData.content.includes('<table') && (
                  <div className="mb-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>⚠️ Atenção:</strong> Seu conteúdo contém tabelas. 
                      Para preservar as tabelas corretamente, use o modo "Editar HTML" e salve diretamente desse modo, 
                      sem voltar para o modo visual.
                    </p>
                  </div>
                )}
                <RichTextEditor
                  value={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                  placeholder="Digite o conteúdo da política de privacidade..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagem de Fundo
                </label>
                {policy?.background_image_url ? (
                  <div className="space-y-2">
                    <img
                      src={policy.background_image_url}
                      alt="Background"
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <div className="flex gap-2">
                      <label className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={uploadingImage}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          disabled={uploadingImage}
                          onClick={() => document.querySelector('input[type="file"]')?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {uploadingImage ? 'Enviando...' : 'Alterar Imagem'}
                        </Button>
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleDeleteImage}
                        disabled={uploadingImage}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <label className="block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#3bb664] transition-colors cursor-pointer">
                      <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-1">
                        Clique para fazer upload da imagem de fundo
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG ou GIF até 5MB
                      </p>
                    </div>
                  </label>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="submit"
                  disabled={saving}
                  style={{ backgroundColor: '#3bb664' }}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

