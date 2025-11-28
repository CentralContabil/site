import React, { useEffect, useState } from 'react';
import { Upload, Trash2 } from 'lucide-react';
import { apiService } from '../../services/api';
import { CareersPage, UpdateCareersPageRequest } from '../../types';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';

const DEFAULT_TEXTS = {
  hero_title: 'Trabalhe com a gente',
  hero_subtitle:
    'Estamos sempre em busca de profissionais que queiram crescer junto com a Central Contábil e com os nossos clientes.',
  culture_title: 'Cultura e propósito',
  culture_text:
    'A Central Contábil tem mais de três décadas de história construídas com transparência, confiança e foco em resultados. Valorizamos um ambiente colaborativo, com desenvolvimento contínuo e visão de longo prazo para nossa equipe e nossos clientes.',
  vacancies_title: 'Vagas em aberto',
  vacancies_text:
    'Neste momento não há vagas publicadas, mas estamos sempre avaliando novos talentos. Preencha o formulário abaixo e envie seu currículo para nossa equipe.',
  benefits_title: 'Benefícios',
  benefits_text:
    'Ambiente estruturado e colaborativo\nExposição a diferentes segmentos de clientes\nDesenvolvimento contínuo em contabilidade, fiscal e tributário',
  profile_title: 'Perfil que buscamos',
  profile_text:
    'Compromisso com qualidade e prazos\nVontade de aprender e crescer\nBoa comunicação e trabalho em equipe',
};

const CareersPageAdmin: React.FC = () => {
  const [careersPage, setCareersPage] = useState<CareersPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState<UpdateCareersPageRequest>({
    background_image_url: '',
    hero_title: DEFAULT_TEXTS.hero_title,
    hero_subtitle: DEFAULT_TEXTS.hero_subtitle,
    culture_title: DEFAULT_TEXTS.culture_title,
    culture_text: DEFAULT_TEXTS.culture_text,
    vacancies_title: DEFAULT_TEXTS.vacancies_title,
    vacancies_text: DEFAULT_TEXTS.vacancies_text,
    benefits_title: DEFAULT_TEXTS.benefits_title,
    benefits_text: DEFAULT_TEXTS.benefits_text,
    profile_title: DEFAULT_TEXTS.profile_title,
    profile_text: DEFAULT_TEXTS.profile_text,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCareersPage();
      const data = response.careersPage;
      setCareersPage(data);
      setFormData({
        background_image_url: data.background_image_url || '',
        hero_title: data.hero_title || DEFAULT_TEXTS.hero_title,
        hero_subtitle: data.hero_subtitle || DEFAULT_TEXTS.hero_subtitle,
        culture_title: data.culture_title || DEFAULT_TEXTS.culture_title,
        culture_text: data.culture_text || DEFAULT_TEXTS.culture_text,
        vacancies_title: data.vacancies_title || DEFAULT_TEXTS.vacancies_title,
        vacancies_text: data.vacancies_text || DEFAULT_TEXTS.vacancies_text,
        benefits_title: data.benefits_title || DEFAULT_TEXTS.benefits_title,
        benefits_text: data.benefits_text || DEFAULT_TEXTS.benefits_text,
        profile_title: data.profile_title || DEFAULT_TEXTS.profile_title,
        profile_text: data.profile_text || DEFAULT_TEXTS.profile_text,
      });
    } catch (error) {
      console.error('Erro ao carregar CareersPage:', error);
      toast.error('Erro ao carregar dados da página Trabalhe Conosco');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload: UpdateCareersPageRequest = {
        background_image_url: formData.background_image_url || null,
        hero_title: formData.hero_title?.trim() || DEFAULT_TEXTS.hero_title,
        hero_subtitle: formData.hero_subtitle?.trim() || DEFAULT_TEXTS.hero_subtitle,
        culture_title: formData.culture_title?.trim() || DEFAULT_TEXTS.culture_title,
        culture_text: formData.culture_text?.trim() || '',
        vacancies_title: formData.vacancies_title?.trim() || DEFAULT_TEXTS.vacancies_title,
        vacancies_text: formData.vacancies_text?.trim() || '',
        benefits_title: formData.benefits_title?.trim() || DEFAULT_TEXTS.benefits_title,
        benefits_text: formData.benefits_text?.trim() || '',
        profile_title: formData.profile_title?.trim() || DEFAULT_TEXTS.profile_title,
        profile_text: formData.profile_text?.trim() || '',
      };

      const response = await apiService.updateCareersPage(payload);
      setCareersPage(response.careersPage);
      toast.success('Página Trabalhe Conosco atualizada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao salvar CareersPage:', error);
      toast.error(error?.message || 'Erro ao salvar dados da página Trabalhe Conosco');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const result = await apiService.uploadCareersPageImage(file);
      setFormData((prev) => ({ ...prev, background_image_url: result.data.url }));
      setCareersPage(result.careersPage);
      toast.success('Imagem de fundo atualizada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao enviar imagem da CareersPage:', error);
      toast.error(error?.message || 'Erro ao enviar imagem');
    } finally {
      setUploadingImage(false);
      event.target.value = '';
    }
  };

  const handleDeleteImage = async () => {
    if (!window.confirm('Tem certeza que deseja remover a imagem de fundo?')) {
      return;
    }

    try {
      const result = await apiService.deleteCareersPageImage();
      setFormData((prev) => ({ ...prev, background_image_url: '' }));
      setCareersPage(result.careersPage);
      toast.success('Imagem de fundo removida com sucesso!');
    } catch (error: any) {
      console.error('Erro ao remover imagem da CareersPage:', error);
      toast.error(error?.message || 'Erro ao remover imagem');
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
    <div>
      <AdminPageHeader
        title="Página Trabalhe Conosco"
        subtitle="Gerencie o conteúdo da página de carreiras"
        onSave={handleSave}
        saving={saving}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Imagem de Fundo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.background_image_url ? (
                <div className="space-y-2">
                  <img
                    src={formData.background_image_url}
                    alt="Background Trabalhe Conosco"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                  <div className="flex gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                      id="careers-image-upload"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('careers-image-upload')?.click()}
                      disabled={uploadingImage}
                      className="flex-1"
                    >
                      {uploadingImage ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Trocar Imagem
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleDeleteImage}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                    id="careers-image-upload-empty"
                  />
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#3bb664] transition-colors"
                    onClick={() => document.getElementById('careers-image-upload-empty')?.click()}
                  >
                    {uploadingImage ? (
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600 mb-2" />
                        <p className="text-gray-600 text-sm">Enviando imagem...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-gray-600 text-sm">
                          Clique para enviar uma imagem de fundo para a página Trabalhe Conosco
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Formatos JPG, PNG, GIF ou WebP até 5MB</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hero (topo da página)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Título principal"
                value={formData.hero_title || ''}
                onChange={(value) => setFormData((prev) => ({ ...prev, hero_title: value }))}
              />
              <Textarea
                label="Subtítulo"
                value={formData.hero_subtitle || ''}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, hero_subtitle: value }))
                }
                rows={3}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Seção "Cultura e propósito"</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Título"
                value={formData.culture_title || ''}
                onChange={(value) => setFormData((prev) => ({ ...prev, culture_title: value }))}
              />
              <Textarea
                label="Texto"
                value={formData.culture_text || ''}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, culture_text: value }))
                }
                rows={4}
              />
            </CardContent>
          </Card>
        </div>

        {/* Preview simples */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pré-visualização (simplificada)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg overflow-hidden shadow border border-gray-200">
                <div
                  className="pt-10 pb-8 px-6 text-white"
                  style={{
                    backgroundImage: formData.background_image_url
                      ? `linear-gradient(to bottom right, rgba(6,78,59,0.85), rgba(5,46,22,0.9)), url(${formData.background_image_url})`
                      : 'linear-gradient(to bottom right, #064e3b, #052e16)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <p className="text-xs uppercase tracking-wider mb-2 opacity-90">
                    Trabalhe Conosco
                  </p>
                  <h2 className="text-2xl font-bold mb-2">
                    {formData.hero_title || DEFAULT_TEXTS.hero_title}
                  </h2>
                  <p className="text-sm text-green-100">
                    {formData.hero_subtitle || DEFAULT_TEXTS.hero_subtitle}
                  </p>
                </div>
                <div className="p-6 space-y-4 bg-white">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">
                      {formData.culture_title || DEFAULT_TEXTS.culture_title}
                    </h3>
                    <p className="text-sm text-gray-700 line-clamp-4">
                      {formData.culture_text ||
                        'Texto de exemplo sobre cultura e propósito da empresa.'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">
                      {formData.vacancies_title || DEFAULT_TEXTS.vacancies_title}
                    </h3>
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {formData.vacancies_text ||
                        'Mensagem de exemplo sobre vagas em aberto e interesse em novos talentos.'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Seções adicionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Input
                  label="Título - Benefícios"
                  value={formData.benefits_title || ''}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, benefits_title: value }))
                  }
                />
                <Textarea
                  label="Texto - Benefícios"
                  value={formData.benefits_text || ''}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, benefits_text: value }))
                  }
                  rows={3}
                />
              </div>
              <div>
                <Input
                  label="Título - Perfil que buscamos"
                  value={formData.profile_title || ''}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, profile_title: value }))
                  }
                />
                <Textarea
                  label="Texto - Perfil que buscamos"
                  value={formData.profile_text || ''}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, profile_text: value }))
                  }
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CareersPageAdmin;


