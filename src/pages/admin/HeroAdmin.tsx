import { useState, useEffect } from 'react';
import { Save, Upload, Image as ImageIcon, Trash2, Play, ArrowRight, ArrowLeft } from 'lucide-react';
import { apiService } from '../../services/api';
import { LoginPage, UpdateLoginPageRequest } from '../../types';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select';

const ICON_OPTIONS = [
  { value: '', label: 'Nenhum' },
  { value: 'play', label: 'Play' },
  { value: 'arrow-right', label: 'Seta Direita' },
  { value: 'arrow-left', label: 'Seta Esquerda' },
];

export default function HeroAdmin() {
  const [loginPage, setLoginPage] = useState<LoginPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState<UpdateLoginPageRequest>({
    backgroundImageUrl: '',
    welcomeText: '',
    titleLine1: '',
    titleLine2: '',
    buttonText: '',
    buttonLink: '',
    buttonIcon: '',
  });

  useEffect(() => {
    loadLoginPage();
  }, []);

  const loadLoginPage = async () => {
    try {
      setLoading(true);
      const response = await apiService.getLoginPage();
      const loginPageData = response.loginPage;
      setLoginPage(loginPageData);
      setFormData({
        backgroundImageUrl: loginPageData.backgroundImageUrl || '',
        welcomeText: loginPageData.welcomeText || '',
        titleLine1: loginPageData.titleLine1 || '',
        titleLine2: loginPageData.titleLine2 || '',
        buttonText: loginPageData.buttonText || '',
        buttonLink: loginPageData.buttonLink || '',
        buttonIcon: loginPageData.buttonIcon || '',
      });
    } catch (error) {
      console.error('Erro ao carregar Página de Login:', error);
      toast.error('Erro ao carregar dados da Página de Login');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Preparar dados para envio - converter strings vazias para null
      const dataToSend: UpdateLoginPageRequest = {
        backgroundImageUrl: formData.backgroundImageUrl?.trim() || null,
        welcomeText: formData.welcomeText?.trim() || null,
        titleLine1: formData.titleLine1?.trim() || null,
        titleLine2: formData.titleLine2?.trim() || null,
        buttonText: formData.buttonText?.trim() || null,
        buttonLink: formData.buttonLink?.trim() || null,
        buttonIcon: formData.buttonIcon?.trim() || null,
      };
      
      const response = await apiService.updateLoginPage(dataToSend);
      setLoginPage(response.loginPage);
      // Atualizar formData com a resposta do servidor
      setFormData({
        backgroundImageUrl: response.loginPage.backgroundImageUrl || '',
        welcomeText: response.loginPage.welcomeText || '',
        titleLine1: response.loginPage.titleLine1 || '',
        titleLine2: response.loginPage.titleLine2 || '',
        buttonText: response.loginPage.buttonText || '',
        buttonLink: response.loginPage.buttonLink || '',
        buttonIcon: response.loginPage.buttonIcon || '',
      });
      toast.success('✅ Página de Login atualizada com sucesso!', {
        duration: 4000,
        description: 'As alterações foram aplicadas e estão ativas na página de login.',
      });
    } catch (error: any) {
      console.error('Erro ao salvar Página de Login:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Erro ao salvar dados da Página de Login';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof UpdateLoginPageRequest, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📤 handleImageUpload chamado');
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
      setFormData(prev => ({ ...prev, backgroundImageUrl: previewUrl }));

      // Fazer upload real
      setUploadingImage(true);
      const formDataToSend = new FormData();
      formDataToSend.append('file', file);
      formDataToSend.append('type', 'background');

      try {
        const token = localStorage.getItem('token');
        console.log('🔐 Token encontrado:', !!token);
        console.log('📤 Enviando para: http://localhost:3006/api/login-page/image');
        
        const response = await fetch('http://localhost:3006/api/login-page/image', {
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
          
          setFormData(prev => ({ ...prev, backgroundImageUrl: result.data.url }));
          if (result.loginPage) {
            setLoginPage(result.loginPage);
          }
          toast.success('Imagem enviada com sucesso!');
        } else {
          const error = await response.json();
          console.error('❌ Erro do servidor:', error);
          toast.error(error.error || error.details || 'Erro ao enviar imagem');
          // Reverter preview em caso de erro
          await loadLoginPage();
        }
      } catch (error) {
        console.error('❌ Erro ao enviar imagem:', error);
        toast.error('Erro ao enviar imagem. Verifique o console para mais detalhes.');
        // Reverter preview em caso de erro
        await loadLoginPage();
      } finally {
        setUploadingImage(false);
        // Limpar o input para permitir selecionar o mesmo arquivo novamente
        event.target.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteImage = async () => {
    if (!window.confirm('Tem certeza que deseja remover a imagem de fundo?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3006/api/login-page/image/background`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setFormData({ ...formData, backgroundImageUrl: '' });
        if (result.loginPage) {
          setLoginPage(result.loginPage);
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
          <div className="text-gray-500">Carregando dados da Página de Login...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Página de Login</h1>
          <p className="text-gray-600 mt-1">Configure a página de login do sistema administrativo</p>
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
                  Texto de Boas-vindas (em itálico)
                </label>
                <Input
                  type="text"
                  value={formData.welcomeText || ''}
                  onChange={(value) => handleInputChange('welcomeText', value)}
                  placeholder="Ex: We are glad to see you again!"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título - Linha 1
                </label>
                <Input
                  type="text"
                  value={formData.titleLine1 || ''}
                  onChange={(value) => handleInputChange('titleLine1', value)}
                  placeholder="Ex: Join our next negotiation group in"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título - Linha 2
                </label>
                <Input
                  type="text"
                  value={formData.titleLine2 || ''}
                  onChange={(value) => handleInputChange('titleLine2', value)}
                  placeholder="Ex: few minutes!"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Botão de Ação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Texto do Botão
                </label>
                <Input
                  type="text"
                  value={formData.buttonText || ''}
                  onChange={(value) => handleInputChange('buttonText', value)}
                  placeholder="Ex: Watch demo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link do Botão
                </label>
                <Input
                  type="text"
                  value={formData.buttonLink || ''}
                  onChange={(value) => handleInputChange('buttonLink', value)}
                  placeholder="Ex: # ou URL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ícone do Botão
                </label>
                <Select
                  value={formData.buttonIcon || ''}
                  onValueChange={(value) => handleInputChange('buttonIcon', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um ícone">
                      {(() => {
                        const selectedOption = ICON_OPTIONS.find(opt => opt.value === formData.buttonIcon);
                        if (selectedOption) {
                          return (
                            <div className="flex items-center gap-2">
                              {selectedOption.value === 'play' && <Play className="w-4 h-4" />}
                              {selectedOption.value === 'arrow-right' && <ArrowRight className="w-4 h-4" />}
                              {selectedOption.value === 'arrow-left' && <ArrowLeft className="w-4 h-4" />}
                              {selectedOption.label}
                            </div>
                          );
                        }
                        return 'Selecione um ícone';
                      })()}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          {option.value === 'play' && <Play className="w-4 h-4" />}
                          {option.value === 'arrow-right' && <ArrowRight className="w-4 h-4" />}
                          {option.value === 'arrow-left' && <ArrowLeft className="w-4 h-4" />}
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita - Imagem */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="mr-2 h-5 w-5" />
                Imagem de Fundo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagem de Fundo (Área Verde)
                </label>
                {formData.backgroundImageUrl ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <img
                        src={formData.backgroundImageUrl}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded border"
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
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={uploadingImage}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          disabled={uploadingImage}
                          onClick={(e) => {
                            e.preventDefault();
                            const input = e.currentTarget.parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
                            input?.click();
                          }}
                        >
                          {uploadingImage ? 'Enviando...' : 'Trocar Imagem'}
                        </Button>
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={handleDeleteImage}
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
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
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
                      {uploadingImage ? (
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
