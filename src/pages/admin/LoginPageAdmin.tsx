import { useState, useEffect } from 'react';
import { Save, Upload, Image as ImageIcon, Trash2, ArrowRight, Sparkles, Activity } from 'lucide-react';
import { apiService } from '../../services/api';
import { LoginPage, UpdateLoginPageRequest } from '../../types';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import * as LucideIcons from 'lucide-react';

// Ícones disponíveis para o botão
const AVAILABLE_ICONS = [
  { value: 'ArrowRight', label: 'Seta Direita', icon: ArrowRight },
  { value: 'Sparkles', label: 'Estrelas', icon: Sparkles },
  { value: 'Activity', label: 'Atividade', icon: Activity },
  { value: 'CheckCircle', label: 'Check', icon: LucideIcons.CheckCircle },
  { value: 'Rocket', label: 'Foguete', icon: LucideIcons.Rocket },
  { value: 'Zap', label: 'Raio', icon: LucideIcons.Zap },
  { value: 'Heart', label: 'Coração', icon: LucideIcons.Heart },
  { value: 'Star', label: 'Estrela', icon: LucideIcons.Star },
  { value: 'TrendingUp', label: 'Crescimento', icon: LucideIcons.TrendingUp },
  { value: 'Target', label: 'Alvo', icon: LucideIcons.Target },
];

export default function LoginPageAdmin() {
  const [loginPage, setLoginPage] = useState<LoginPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState<UpdateLoginPageRequest>({
    background_image_url: '',
    welcome_text: '',
    title_line1: '',
    title_line2: '',
    button_text: '',
    button_link: '',
    button_icon: 'ArrowRight',
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
        background_image_url: loginPageData.background_image_url || '',
        welcome_text: loginPageData.welcome_text || '',
        title_line1: loginPageData.title_line1 || '',
        title_line2: loginPageData.title_line2 || '',
        button_text: loginPageData.button_text || '',
        button_link: loginPageData.button_link || '',
        button_icon: loginPageData.button_icon || 'ArrowRight',
      });
    } catch (error) {
      console.error('Erro ao carregar LoginPage:', error);
      toast.error('Erro ao carregar dados da Página de Login');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const dataToSend: UpdateLoginPageRequest = {
        background_image_url: formData.background_image_url?.trim() || null,
        welcome_text: formData.welcome_text?.trim() || null,
        title_line1: formData.title_line1?.trim() || null,
        title_line2: formData.title_line2?.trim() || null,
        button_text: formData.button_text?.trim() || null,
        button_link: formData.button_link?.trim() || null,
        button_icon: formData.button_icon || null,
      };
      
      const response = await apiService.updateLoginPage(dataToSend);
      setLoginPage(response.loginPage);
      setFormData({
        background_image_url: response.loginPage.background_image_url || '',
        welcome_text: response.loginPage.welcome_text || '',
        title_line1: response.loginPage.title_line1 || '',
        title_line2: response.loginPage.title_line2 || '',
        button_text: response.loginPage.button_text || '',
        button_link: response.loginPage.button_link || '',
        button_icon: response.loginPage.button_icon || 'ArrowRight',
      });
      toast.success('✅ Página de Login atualizada com sucesso!', {
        duration: 4000,
        description: 'As alterações foram aplicadas e estão ativas na tela de login.',
      });
    } catch (error: any) {
      console.error('Erro ao salvar LoginPage:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Erro ao salvar dados da Página de Login';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formDataToSend = new FormData();
    formDataToSend.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'http://localhost:3006/api');
      
      const response = await fetch(`${API_BASE_URL}/login-page/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        const result = await response.json();
        setFormData(prev => ({ ...prev, background_image_url: result.data.url }));
        if (result.loginPage) {
          setLoginPage(result.loginPage);
        }
        toast.success('Imagem enviada com sucesso!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao enviar imagem');
      }
    } catch (error) {
      console.error('Erro ao enviar imagem:', error);
      toast.error('Erro ao enviar imagem');
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
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'http://localhost:3006/api');
      
      const response = await fetch(`${API_BASE_URL}/login-page/image/background`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setFormData(prev => ({ ...prev, background_image_url: '' }));
        toast.success('Imagem removida com sucesso!');
        await loadLoginPage();
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3bb664]"></div>
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        title="Gerenciar Página de Login"
        subtitle="Personalize a área esquerda da tela de login"
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
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                  <div className="flex gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                      id="login-page-image-upload"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('login-page-image-upload')?.click()}
                      disabled={uploadingImage}
                      className="flex-1"
                    >
                      {uploadingImage ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
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
                    id="login-page-image-upload-empty"
                  />
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#3bb664] transition-colors"
                    onClick={() => document.getElementById('login-page-image-upload-empty')?.click()}
                  >
                    {uploadingImage ? (
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3bb664] mb-2"></div>
                        <span className="text-sm text-gray-600">Enviando...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-gray-600">Clique para fazer upload</p>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF ou WebP (máx. 5MB)</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="mt-2">
                <label className="block text-xs text-gray-500 mb-1">
                  Ou insira uma URL de imagem
                </label>
                <Input
                  type="text"
                  value={formData.background_image_url || ''}
                  onChange={(value) => setFormData({ ...formData, background_image_url: value })}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Textos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Texto de Boas-vindas
                </label>
                <Textarea
                  value={formData.welcome_text || ''}
                  onChange={(e) => setFormData({ ...formData, welcome_text: e.target.value })}
                  placeholder="Ex: Bem-vindo ao nosso sistema"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título - Linha 1
                </label>
                <Input
                  type="text"
                  value={formData.title_line1 || ''}
                  onChange={(value) => setFormData({ ...formData, title_line1: value })}
                  placeholder="Ex: Soluções Contábeis"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título - Linha 2
                </label>
                <Input
                  type="text"
                  value={formData.title_line2 || ''}
                  onChange={(value) => setFormData({ ...formData, title_line2: value })}
                  placeholder="Ex: Para o seu negócio"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Botão CTA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Texto do Botão
                </label>
                <Input
                  type="text"
                  value={formData.button_text || ''}
                  onChange={(value) => setFormData({ ...formData, button_text: value })}
                  placeholder="Ex: Saiba Mais"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link do Botão
                </label>
                <Input
                  type="text"
                  value={formData.button_link || ''}
                  onChange={(value) => setFormData({ ...formData, button_link: value })}
                  placeholder="Ex: https://exemplo.com ou /contato"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ícone do Botão
                </label>
                <select
                  value={formData.button_icon || 'ArrowRight'}
                  onChange={(e) => setFormData({ ...formData, button_icon: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3bb664] focus:border-[#3bb664] outline-none"
                >
                  {AVAILABLE_ICONS.map((iconOption) => {
                    const IconComponent = iconOption.icon;
                    return (
                      <option key={iconOption.value} value={iconOption.value}>
                        {iconOption.label}
                      </option>
                    );
                  })}
                </select>
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                  <span>Preview:</span>
                  {(() => {
                    const selectedIcon = AVAILABLE_ICONS.find(i => i.value === (formData.button_icon || 'ArrowRight'));
                    const IconComponent = selectedIcon?.icon || ArrowRight;
                    return <IconComponent className="w-4 h-4" />;
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-96 rounded-lg overflow-hidden border">
                {formData.background_image_url ? (
                  <>
                    <img
                      src={formData.background_image_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      style={{ filter: 'blur(8px)' }}
                    />
                    <div
                      className="absolute inset-0 opacity-90"
                      style={{
                        background: `linear-gradient(135deg, #3bb664dd 0%, #2d9a4fdd 100%)`
                      }}
                    ></div>
                  </>
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(135deg, #3bb664 0%, #2d9a4f 100%)`
                    }}
                  ></div>
                )}
                
                <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-white">
                  {formData.welcome_text && (
                    <p className="text-base mb-4 text-center opacity-90">
                      {formData.welcome_text}
                    </p>
                  )}
                  
                  {(formData.title_line1 || formData.title_line2) && (
                    <div className="text-center mb-6">
                      {formData.title_line1 && (
                        <h1 className="text-3xl font-bold mb-2">
                          {formData.title_line1}
                        </h1>
                      )}
                      {formData.title_line2 && (
                        <h2 className="text-2xl font-semibold">
                          {formData.title_line2}
                        </h2>
                      )}
                    </div>
                  )}
                  
                  {formData.button_text && formData.button_link && (
                    <a
                      href={formData.button_link}
                      className="px-6 py-3 bg-white text-[#3bb664] font-semibold rounded-lg hover:bg-gray-100 transition-all shadow-lg flex items-center gap-2"
                    >
                      {formData.button_icon && (() => {
                        const selectedIcon = AVAILABLE_ICONS.find(i => i.value === formData.button_icon);
                        const IconComponent = selectedIcon?.icon || ArrowRight;
                        return <IconComponent className="w-4 h-4" />;
                      })()}
                      {formData.button_text}
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

