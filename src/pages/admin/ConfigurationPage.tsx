import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Configuration {
  id: string;
  company_name?: string;
  companyName?: string;
  phone?: string;
  email?: string;
  contact_email?: string;
  contactEmail?: string;
  address?: string;
  business_hours?: string;
  businessHours?: string;
  facebook_url?: string;
  facebookUrl?: string;
  instagram_url?: string;
  instagramUrl?: string;
  linkedin_url?: string;
  linkedinUrl?: string;
  logo_url?: string;
  logo_dark_url?: string;
  favicon_url?: string;
  footer_years_text?: string;
  footerYearsText?: string;
}

export default function ConfigurationPage() {
  const [config, setConfig] = useState<Configuration | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState<string | null>(null); // Tipo de logo sendo enviada
  const logoInputRef = useRef<HTMLInputElement>(null);
  const logoDarkInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchConfiguration();
  }, []);

  const fetchConfiguration = async () => {
    try {
      console.log('Buscando configurações do servidor...');
      const response = await fetch('/api/configurations');
      console.log('Resposta do servidor:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Configurações recebidas:', data);
        setConfig(data);
      } else {
        console.error('Erro ao buscar configurações:', response.status);
        toast.error('Erro ao carregar configurações');
      }
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (config) {
      setConfig({ ...config, [field]: value });
    }
  };

  const handleSave = async () => {
    if (!config) return;

    setSaving(true);
    try {
      const response = await fetch('/api/configurations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        toast.success('✅ Configurações salvas com sucesso!', {
          duration: 4000,
          description: 'As alterações foram aplicadas e estão ativas no site.',
        });
      } else {
        toast.error('Erro ao salvar configurações');
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (type: 'logo' | 'logo_dark' | 'favicon', event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleLogoUpload chamado com tipo:', type);
    const file = event.target.files?.[0];
    console.log('Arquivo selecionado:', file);
    if (!file) {
      console.log('Nenhum arquivo selecionado');
      return;
    }

    // Mostrar preview antes de enviar
    const reader = new FileReader();
    reader.onload = async (e) => {
      const previewUrl = e.target?.result as string;
      console.log('Preview URL gerada');
      
      // Atualizar preview imediatamente
      if (config) {
        const fieldName = type === 'logo' ? 'logo_url' : 
                         type === 'logo_dark' ? 'logo_dark_url' : 'favicon_url';
        setConfig({ ...config, [fieldName]: previewUrl });
        console.log('Preview atualizado para:', fieldName);
      }

      // Agora fazer o upload real
      setUploadingLogo(type);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      try {
        console.log('Enviando arquivo para o servidor...');
        const token = localStorage.getItem('token');
        console.log('Token encontrado:', !!token);
        
        const response = await fetch('/api/configurations/logo', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        console.log('Resposta do servidor:', response.status);
        
        if (response.ok) {
          const result = await response.json();
          console.log('Upload bem sucedido:', result);
          if (config) {
            const fieldName = type === 'logo' ? 'logo_url' : 
                             type === 'logo_dark' ? 'logo_dark_url' : 'favicon_url';
            setConfig({ ...config, [fieldName]: result.data.url });
          }
          toast.success('Logo enviada com sucesso!');
        } else {
          const error = await response.json();
          console.error('Erro do servidor:', error);
          toast.error(error.details || 'Erro ao enviar logo');
          // Reverter preview em caso de erro
          await fetchConfiguration();
        }
      } catch (error) {
        console.error('Erro ao enviar logo:', error);
        toast.error('Erro ao enviar logo');
        // Reverter preview em caso de erro
        await fetchConfiguration();
      } finally {
        setUploadingLogo(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteLogo = async (type: 'logo' | 'logo_dark' | 'favicon') => {
    try {
      const response = await fetch(`/api/configurations/logo/${type}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        if (config) {
          const fieldName = type === 'logo' ? 'logo_url' : 
                           type === 'logo_dark' ? 'logo_dark_url' : 'favicon_url';
          setConfig({ ...config, [fieldName]: undefined });
        }
        toast.success('Logo removida com sucesso!');
      } else {
        toast.error('Erro ao remover logo');
      }
    } catch (error) {
      console.error('Erro ao remover logo:', error);
      toast.error('Erro ao remover logo');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Erro ao carregar configurações</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#0b3a25]">Configurações</h1>
        <Button onClick={() => {
          console.log('Botão Salvar clicado');
          handleSave();
        }} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Logo Section */}
        <Card>
          <CardHeader>
            <CardTitle>Logomarca</CardTitle>
            <CardDescription>
              Configure as logos da sua empresa. As imagens são enviadas automaticamente quando selecionadas.
              Formatos aceitos: JPG, PNG, GIF, WebP (máx. 5MB)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Logo Principal */}
              <div className="space-y-4">
                <Label>Logo Principal</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center min-h-[120px] flex flex-col justify-center">
                  {uploadingLogo === 'logo' ? (
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3bb664]"></div>
                      <span className="text-sm text-gray-500">Enviando logo...</span>
                    </div>
                  ) : config.logo_url ? (
                    <div className="space-y-3">
                      <img 
                        src={config.logo_url} 
                        alt="Logo Principal" 
                        className="max-h-20 mx-auto object-contain"
                      />
                      <div className="flex gap-2 justify-center">
                        <Button size="sm" variant="primary" onClick={() => logoInputRef.current?.click()}>
                          Alterar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteLogo('logo')}
                        >
                          Remover
                        </Button>
                      </div>
                      <Input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        onChangeFile={(e) => handleLogoUpload('logo', e)}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-gray-500 text-sm">Nenhuma logo principal</div>
                      <Button size="sm" variant="primary" onClick={() => logoInputRef.current?.click()}>
                        Escolher Arquivo
                      </Button>
                    </div>
                  )}
                </div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleLogoUpload('logo', e)}
                  className="hidden"
                />
              </div>

              {/* Logo Dark */}
              <div className="space-y-4">
                <Label>Logo Versão Escura</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center min-h-[120px] flex flex-col justify-center">
                  {uploadingLogo === 'logo_dark' ? (
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3bb664]"></div>
                      <span className="text-sm text-gray-500">Enviando logo...</span>
                    </div>
                  ) : config.logo_dark_url ? (
                    <div className="space-y-3">
                      <img 
                        src={config.logo_dark_url} 
                        alt="Logo Dark" 
                        className="max-h-20 mx-auto object-contain bg-gray-800 rounded p-2"
                      />
                      <div className="flex gap-2 justify-center">
                        <label htmlFor="logo-dark-upload" className="cursor-pointer inline-block">
                          <Button size="sm" variant="primary" as="span">
                            Alterar
                          </Button>
                        </label>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteLogo('logo_dark')}
                        >
                          Remover
                        </Button>
                      </div>
                      <Input
                        id="logo-dark-upload"
                        type="file"
                        accept="image/*"
                        onChangeFile={(e) => handleLogoUpload('logo_dark', e)}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-gray-500 text-sm">Nenhuma logo dark</div>
                      <label htmlFor="logo-dark-upload" className="cursor-pointer inline-block">
                        <Button size="sm" variant="primary" as="span">
                          Escolher Arquivo
                        </Button>
                      </label>
                      <Input
                        id="logo-dark-upload"
                        type="file"
                        accept="image/*"
                        onChangeFile={(e) => handleLogoUpload('logo_dark', e)}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Favicon */}
              <div className="space-y-4">
                <Label>Favicon</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center min-h-[120px] flex flex-col justify-center">
                  {uploadingLogo === 'favicon' ? (
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3bb664]"></div>
                      <span className="text-sm text-gray-500">Enviando favicon...</span>
                    </div>
                  ) : config.favicon_url ? (
                    <div className="space-y-3">
                      <img 
                        src={config.favicon_url} 
                        alt="Favicon" 
                        className="h-8 w-8 mx-auto object-contain"
                      />
                      <div className="flex gap-2 justify-center">
                        <label htmlFor="favicon-upload" className="cursor-pointer inline-block">
                          <Button size="sm" variant="primary" as="span">
                            Alterar
                          </Button>
                        </label>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteLogo('favicon')}
                        >
                          Remover
                        </Button>
                      </div>
                      <Input
                        id="favicon-upload"
                        type="file"
                        accept="image/*"
                        onChangeFile={(e) => handleLogoUpload('favicon', e)}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-gray-500 text-sm">Nenhum favicon</div>
                      <label htmlFor="favicon-upload" className="cursor-pointer inline-block">
                        <Button size="sm" variant="primary" as="span">
                          Escolher Arquivo
                        </Button>
                      </label>
                      <Input
                        id="favicon-upload"
                        type="file"
                        accept="image/*"
                        onChangeFile={(e) => handleLogoUpload('favicon', e)}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informações da Empresa</CardTitle>
            <CardDescription>Dados básicos da sua empresa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="companyName">Nome da Empresa</Label>
                <Input
                  id="companyName"
                  value={config.companyName || config.company_name}
                  onChange={(value) => handleInputChange('companyName', value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={config.phone || ''}
                  onChange={(value) => handleInputChange('phone', value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp_number">WhatsApp (número)</Label>
                <Input
                  id="whatsapp_number"
                  placeholder="(27) 9xxxx-xxxx"
                  value={config.whatsapp_number || config.whatsappNumber || ''}
                  onChange={(value) => handleInputChange('whatsapp_number', value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={config.email || ''}
                  onChange={(value) => handleInputChange('email', value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_email">Email para Receber Contatos</Label>
                <Input
                  id="contact_email"
                  type="email"
                  placeholder="wagner.guerra@gmail.com"
                  value={config.contact_email || config.contactEmail || ''}
                  onChange={(value) => handleInputChange('contact_email', value)}
                />
                <p className="text-xs text-gray-500">
                  Este email receberá notificações quando houver novos contatos através do formulário.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="business_hours">Horário de Funcionamento</Label>
                <Input
                  id="business_hours"
                  value={config.business_hours || ''}
                  onChange={(value) => handleInputChange('business_hours', value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Textarea
                id="address"
                value={config.address || ''}
                onChange={(value) => handleInputChange('address', value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="footer_years_text">Texto dos Anos no Rodapé</Label>
              <Textarea
                id="footer_years_text"
                value={config.footer_years_text || config.footerYearsText || ''}
                onChange={(value) => handleInputChange('footer_years_text', value)}
                rows={3}
                placeholder="Mais de 34 anos oferecendo soluções contábeis estratégicas para empresas que buscam crescimento sustentável."
              />
              <p className="text-xs text-gray-500">
                Este texto aparece no rodapé do site, abaixo da logo da empresa.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader>
            <CardTitle>Redes Sociais</CardTitle>
            <CardDescription>Links das redes sociais da empresa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="facebookUrl">Facebook</Label>
                <Input
                  id="facebookUrl"
                  type="text"
                  value={config.facebookUrl || config.facebook_url || ''}
                  onChange={(value) => handleInputChange('facebookUrl', value)}
                  placeholder="https://facebook.com/sua-pagina"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagramUrl">Instagram</Label>
                <Input
                  id="instagramUrl"
                  type="text"
                  value={config.instagramUrl || config.instagram_url || ''}
                  onChange={(value) => handleInputChange('instagramUrl', value)}
                  placeholder="https://instagram.com/sua-conta"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="linkedinUrl">LinkedIn</Label>
                <Input
                  id="linkedinUrl"
                  type="text"
                  value={config.linkedinUrl || config.linkedin_url || ''}
                  onChange={(value) => handleInputChange('linkedinUrl', value)}
                  placeholder="https://linkedin.com/company/sua-empresa"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

