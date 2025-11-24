import { useState, useEffect } from 'react';
import { Save, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { apiService } from '../../services/api';
import { Hero, UpdateHeroRequest } from '../../types';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

export default function HeroAdmin() {
  const [hero, setHero] = useState<Hero | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<'background' | 'hero' | null>(null);
  const [formData, setFormData] = useState<UpdateHeroRequest>({
    badgeText: '',
    titleLine1: '',
    titleLine2: '',
    description: '',
    backgroundImageUrl: '',
    heroImageUrl: '',
    button1Text: '',
    button1Link: '',
    button2Text: '',
    button2Link: '',
    statYears: '',
    statClients: '',
    statNetwork: '',
    indicator1Title: '',
    indicator1Value: '',
    indicator2Title: '',
    indicator2Value: '',
    indicator3Title: '',
    indicator3Value: '',
  });

  useEffect(() => {
    loadHero();
  }, []);

  const loadHero = async () => {
    try {
      setLoading(true);
      const response = await apiService.getHero();
      const heroData = response.hero;
      setHero(heroData);
      setFormData({
        badgeText: heroData.badgeText || '',
        titleLine1: heroData.titleLine1 || '',
        titleLine2: heroData.titleLine2 || '',
        description: heroData.description || '',
        backgroundImageUrl: heroData.backgroundImageUrl || '',
        heroImageUrl: heroData.heroImageUrl || '',
        button1Text: heroData.button1Text || '',
        button1Link: heroData.button1Link || '',
        button2Text: heroData.button2Text || '',
        button2Link: heroData.button2Link || '',
        statYears: heroData.statYears || '',
        statClients: heroData.statClients || '',
        statNetwork: heroData.statNetwork || '',
        indicator1Title: heroData.indicator1Title || '',
        indicator1Value: heroData.indicator1Value || '',
        indicator2Title: heroData.indicator2Title || '',
        indicator2Value: heroData.indicator2Value || '',
        indicator3Title: heroData.indicator3Title || '',
        indicator3Value: heroData.indicator3Value || '',
      });
    } catch (error) {
      console.error('Erro ao carregar Hero:', error);
      toast.error('Erro ao carregar dados do Hero');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Preparar dados para envio - converter strings vazias para null
      const dataToSend: UpdateHeroRequest = {
        ...formData,
        backgroundImageUrl: formData.backgroundImageUrl?.trim() || null,
        heroImageUrl: formData.heroImageUrl?.trim() || null,
        button1Text: formData.button1Text?.trim() || null,
        button1Link: formData.button1Link?.trim() || null,
        button2Text: formData.button2Text?.trim() || null,
        button2Link: formData.button2Link?.trim() || null,
        statYears: formData.statYears?.trim() || null,
        statClients: formData.statClients?.trim() || null,
        statNetwork: formData.statNetwork?.trim() || null,
        indicator1Title: formData.indicator1Title?.trim() || null,
        indicator1Value: formData.indicator1Value?.trim() || null,
        indicator2Title: formData.indicator2Title?.trim() || null,
        indicator2Value: formData.indicator2Value?.trim() || null,
        indicator3Title: formData.indicator3Title?.trim() || null,
        indicator3Value: formData.indicator3Value?.trim() || null,
      };
      
      const response = await apiService.updateHero(dataToSend);
      setHero(response.hero);
      // Atualizar formData com a resposta do servidor
      setFormData({
        badgeText: response.hero.badgeText || '',
        titleLine1: response.hero.titleLine1 || '',
        titleLine2: response.hero.titleLine2 || '',
        description: response.hero.description || '',
        backgroundImageUrl: response.hero.backgroundImageUrl || '',
        heroImageUrl: response.hero.heroImageUrl || '',
        button1Text: response.hero.button1Text || '',
        button1Link: response.hero.button1Link || '',
        button2Text: response.hero.button2Text || '',
        button2Link: response.hero.button2Link || '',
        statYears: response.hero.statYears || '',
        statClients: response.hero.statClients || '',
        statNetwork: response.hero.statNetwork || '',
        indicator1Title: response.hero.indicator1Title || '',
        indicator1Value: response.hero.indicator1Value || '',
        indicator2Title: response.hero.indicator2Title || '',
        indicator2Value: response.hero.indicator2Value || '',
        indicator3Title: response.hero.indicator3Title || '',
        indicator3Value: response.hero.indicator3Value || '',
      });
      toast.success('✅ Hero atualizado com sucesso!', {
        duration: 4000,
        description: 'As alterações foram aplicadas e estão ativas no site.',
      });
    } catch (error: any) {
      console.error('Erro ao salvar Hero:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Erro ao salvar dados do Hero';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof UpdateHeroRequest, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleImageUpload = async (type: 'background' | 'hero', event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📤 handleImageUpload chamado, tipo:', type);
    const file = event.target.files?.[0];
    console.log('📁 Arquivo selecionado:', file);
    
    if (!file) {
      console.log('❌ Nenhum arquivo selecionado');
      return;
    }

    // Mostrar preview antes de enviar
    const reader = new FileReader();
    reader.onload = async (e) => {
      const previewUrl = e.target?.result as string;
      console.log('🖼️ Preview URL gerada');
      
      // Atualizar preview imediatamente
      if (type === 'background') {
        setFormData(prev => ({ ...prev, backgroundImageUrl: previewUrl }));
      } else {
        setFormData(prev => ({ ...prev, heroImageUrl: previewUrl }));
      }

      // Fazer upload real
      setUploadingImage(type);
      const formDataToSend = new FormData();
      formDataToSend.append('file', file);
      formDataToSend.append('type', type);

      try {
        const token = localStorage.getItem('token');
        console.log('🔐 Token encontrado:', !!token);
        console.log('📤 Enviando para: http://localhost:3006/api/hero/image');
        
        const response = await fetch('http://localhost:3006/api/hero/image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formDataToSend
        });

        console.log('📥 Resposta recebida, status:', response.status);

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Upload bem sucedido:', result);
          
          if (type === 'background') {
            setFormData(prev => ({ ...prev, backgroundImageUrl: result.data.url }));
          } else {
            setFormData(prev => ({ ...prev, heroImageUrl: result.data.url }));
          }
          if (result.hero) {
            setHero(result.hero);
          }
          toast.success('Imagem enviada com sucesso!');
        } else {
          const error = await response.json();
          console.error('❌ Erro do servidor:', error);
          toast.error(error.error || error.details || 'Erro ao enviar imagem');
          // Reverter preview em caso de erro
          await loadHero();
        }
      } catch (error) {
        console.error('❌ Erro ao enviar imagem:', error);
        toast.error('Erro ao enviar imagem. Verifique o console para mais detalhes.');
        // Reverter preview em caso de erro
        await loadHero();
      } finally {
        setUploadingImage(null);
        // Limpar o input para permitir selecionar o mesmo arquivo novamente
        event.target.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteImage = async (type: 'background' | 'hero') => {
    if (!window.confirm(`Tem certeza que deseja remover a imagem ${type === 'background' ? 'de fundo' : 'do hero'}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3006/api/hero/image/${type}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (type === 'background') {
          setFormData({ ...formData, backgroundImageUrl: '' });
        } else {
          setFormData({ ...formData, heroImageUrl: '' });
        }
        if (result.hero) {
          setHero(result.hero);
        }
        toast.success('Imagem removida com sucesso!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao remover imagem');
      }
    } catch (error) {
      console.error('Erro ao remover imagem:', error);
      toast.error('Erro ao remover imagem');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3bb664] mb-4"></div>
          <div className="text-gray-500">Carregando dados do Hero...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Hero Section</h1>
          <p className="text-gray-600 mt-1">Configure a seção principal da home page</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#3bb664] hover:bg-[#2d9a4f] text-white flex items-center"
        >
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna Esquerda - Textos */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ImageIcon className="mr-2 h-5 w-5" />
                Textos Principais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Badge (Texto Superior)
                </label>
                <Input
                  type="text"
                  value={formData.badgeText}
                  onChange={(value) => handleInputChange('badgeText', value)}
                  placeholder="Ex: Contabilidade Consultiva"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título - Linha 1
                </label>
                <Input
                  type="text"
                  value={formData.titleLine1}
                  onChange={(value) => handleInputChange('titleLine1', value)}
                  placeholder="Ex: Soluções que Vão"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título - Linha 2
                </label>
                <Input
                  type="text"
                  value={formData.titleLine2}
                  onChange={(value) => handleInputChange('titleLine2', value)}
                  placeholder="Ex: Além da Contabilidade"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(value) => handleInputChange('description', value)}
                  placeholder="Descrição principal do Hero"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Botões de Ação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Botão 1 - Texto
                </label>
                <Input
                  type="text"
                  value={formData.button1Text || ''}
                  onChange={(value) => handleInputChange('button1Text', value)}
                  placeholder="Ex: Agende uma Consultoria"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Botão 1 - Link
                </label>
                <Input
                  type="text"
                  value={formData.button1Link || ''}
                  onChange={(value) => handleInputChange('button1Link', value)}
                  placeholder="Ex: #contato"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Botão 2 - Texto
                </label>
                <Input
                  type="text"
                  value={formData.button2Text || ''}
                  onChange={(value) => handleInputChange('button2Text', value)}
                  placeholder="Ex: Conheça Nossos Serviços"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Botão 2 - Link
                </label>
                <Input
                  type="text"
                  value={formData.button2Link || ''}
                  onChange={(value) => handleInputChange('button2Link', value)}
                  placeholder="Ex: #servicos"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Indicadores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Indicator 1 */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">INDICADOR 1</h4>
                <Input
                  label="Título do Indicador 1"
                  value={formData.indicator1Title || ''}
                  onChange={(value) => handleInputChange('indicator1Title', value)}
                  placeholder="Ex: Anos"
                />
                <Input
                  label="Valor do Indicador 1"
                  value={formData.indicator1Value || ''}
                  onChange={(value) => handleInputChange('indicator1Value', value)}
                  placeholder="Ex: 36+"
                />
              </div>
              {/* Indicator 2 */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">INDICADOR 2</h4>
                <Input
                  label="Título do Indicador 2"
                  value={formData.indicator2Title || ''}
                  onChange={(value) => handleInputChange('indicator2Title', value)}
                  placeholder="Ex: Clientes"
                />
                <Input
                  label="Valor do Indicador 2"
                  value={formData.indicator2Value || ''}
                  onChange={(value) => handleInputChange('indicator2Value', value)}
                  placeholder="Ex: 500+"
                />
              </div>
              {/* Indicator 3 */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">INDICADOR 3</h4>
                <Input
                  label="Título do Indicador 3"
                  value={formData.indicator3Title || ''}
                  onChange={(value) => handleInputChange('indicator3Title', value)}
                  placeholder="Ex: Associado"
                />
                <Input
                  label="Valor do Indicador 3"
                  value={formData.indicator3Value || ''}
                  onChange={(value) => handleInputChange('indicator3Value', value)}
                  placeholder="Ex: RNC"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita - Imagens */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="mr-2 h-5 w-5" />
                Imagens
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Imagem de Fundo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagem de Fundo
                </label>
                {formData.backgroundImageUrl ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <img
                        src={formData.backgroundImageUrl}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <label className="flex-1 cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload('background', e)}
                          className="hidden"
                          disabled={uploadingImage === 'background'}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          disabled={uploadingImage === 'background'}
                          onClick={(e) => {
                            e.preventDefault();
                            const input = e.currentTarget.parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
                            input?.click();
                          }}
                        >
                          {uploadingImage === 'background' ? 'Enviando...' : 'Trocar Imagem'}
                        </Button>
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteImage('background')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <label className="block cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload('background', e)}
                      className="hidden"
                      disabled={uploadingImage === 'background'}
                    />
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#3bb664] transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        const input = e.currentTarget.parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
                        if (!uploadingImage) {
                          input?.click();
                        }
                      }}
                    >
                      {uploadingImage === 'background' ? (
                        <div className="flex flex-col items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3bb664] mb-2"></div>
                          <span className="text-sm text-gray-600">Enviando...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload className="h-8 w-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-600">Clique para fazer upload</span>
                          <span className="text-xs text-gray-500 mt-1">JPG, PNG, GIF ou WebP (máx. 5MB)</span>
                        </div>
                      )}
                    </div>
                  </label>
                )}
              </div>

              {/* Imagem do Hero */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagem do Hero (Lateral Direita)
                </label>
                {formData.heroImageUrl ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <img
                        src={formData.heroImageUrl}
                        alt="Preview"
                        className="w-full h-64 object-contain rounded border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <label className="flex-1 cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload('hero', e)}
                          className="hidden"
                          disabled={uploadingImage === 'hero'}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          disabled={uploadingImage === 'hero'}
                          onClick={(e) => {
                            e.preventDefault();
                            const input = e.currentTarget.parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
                            input?.click();
                          }}
                        >
                          {uploadingImage === 'hero' ? 'Enviando...' : 'Trocar Imagem'}
                        </Button>
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteImage('hero')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <label className="block cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload('hero', e)}
                      className="hidden"
                      disabled={uploadingImage === 'hero'}
                    />
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#3bb664] transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        const input = e.currentTarget.parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
                        if (!uploadingImage) {
                          input?.click();
                        }
                      }}
                    >
                      {uploadingImage === 'hero' ? (
                        <div className="flex flex-col items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3bb664] mb-2"></div>
                          <span className="text-sm text-gray-600">Enviando...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload className="h-8 w-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-600">Clique para fazer upload</span>
                          <span className="text-xs text-gray-500 mt-1">JPG, PNG, GIF ou WebP (máx. 5MB)</span>
                        </div>
                      )}
                    </div>
                  </label>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

