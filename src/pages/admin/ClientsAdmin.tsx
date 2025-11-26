import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Upload, Image as ImageIcon, X, ExternalLink, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import { apiService } from '../../services/api';
import { Client, CreateClientRequest, UpdateClientRequest } from '../../types';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

export default function ClientsAdmin() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<CreateClientRequest>({
    name: '',
    phone: '',
    websiteUrl: '',
    facebookUrl: '',
    instagramUrl: '',
    linkedinUrl: '',
    twitterUrl: '',
    order: 0,
    isActive: true
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllClients();
      setClients(response.clients || []);
    } catch (error) {
      console.error('Error loading clients:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosing(false);
      resetForm();
    }, 200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let clientId: string;
      
      if (editingClient) {
        const response = await apiService.updateClient(editingClient.id, formData);
        clientId = response.client.id;
        toast.success('Cliente atualizado com sucesso!');
      } else {
        const response = await apiService.createClient(formData);
        clientId = response.client.id;
        toast.success('Cliente criado com sucesso!');
      }
      
      // Se há uma logo para fazer upload, fazer após criar/atualizar
      if (logoFile) {
        try {
          setUploadingLogo(clientId);
          await apiService.uploadClientLogo(clientId, logoFile);
          toast.success('Logo enviada com sucesso!');
        } catch (error: any) {
          console.error('Error uploading logo:', error);
          toast.error(error.message || 'Erro ao fazer upload da logo');
        } finally {
          setUploadingLogo(null);
        }
      }
      
      handleCloseModal();
      loadClients();
    } catch (error: any) {
      console.error('Error saving client:', error);
      toast.error(error.message || 'Erro ao salvar cliente');
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      phone: client.phone || '',
      websiteUrl: client.websiteUrl || client.website_url || '',
      facebookUrl: client.facebookUrl || client.facebook_url || '',
      instagramUrl: client.instagramUrl || client.instagram_url || '',
      linkedinUrl: client.linkedinUrl || client.linkedin_url || '',
      twitterUrl: client.twitterUrl || client.twitter_url || '',
      order: client.order,
      isActive: client.isActive
    });
    const logoUrl = getLogoUrl(client);
    setLogoPreview(logoUrl);
    setLogoFile(null);
    setIsClosing(false);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Tem certeza?',
      text: 'Esta ação não pode ser desfeita!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3bb664',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await apiService.deleteClient(id);
        toast.success('Cliente excluído com sucesso!');
        loadClients();
      } catch (error: any) {
        console.error('Error deleting client:', error);
        toast.error(error.message || 'Erro ao excluir cliente');
      }
    }
  };

  const handleToggleStatus = async (client: Client) => {
    try {
      await apiService.updateClient(client.id, { isActive: !client.isActive });
      toast.success(`Cliente ${!client.isActive ? 'ativado' : 'desativado'} com sucesso!`);
      loadClients();
    } catch (error: any) {
      console.error('Error toggling client status:', error);
      toast.error(error.message || 'Erro ao alterar status do cliente');
    }
  };

  const handleLogoUpload = async (clientId: string, file: File) => {
    try {
      setUploadingLogo(clientId);
      await apiService.uploadClientLogo(clientId, file);
      toast.success('Logo enviada com sucesso!');
      loadClients();
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      toast.error(error.message || 'Erro ao fazer upload da logo');
    } finally {
      setUploadingLogo(null);
    }
  };

  const handleLogoDelete = async (clientId: string) => {
    const result = await Swal.fire({
      title: 'Remover logo?',
      text: 'Esta ação não pode ser desfeita!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3bb664',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, remover!',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await apiService.deleteClientLogo(clientId);
        toast.success('Logo removida com sucesso!');
        loadClients();
      } catch (error: any) {
        console.error('Error deleting logo:', error);
        toast.error(error.message || 'Erro ao remover logo');
      }
    }
  };

  const resetForm = () => {
    setEditingClient(null);
    setLogoPreview(null);
    setLogoFile(null);
    setFormData({
      name: '',
      phone: '',
      websiteUrl: '',
      facebookUrl: '',
      instagramUrl: '',
      linkedinUrl: '',
      twitterUrl: '',
      order: 0,
      isActive: true
    });
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione uma imagem válida');
        return;
      }
      
      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('A imagem deve ter no máximo 5MB');
        return;
      }
      
      setLogoFile(file);
      
      // Criar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getLogoUrl = (client: Client) => {
    const logoUrl = client.logoUrl || client.logo_url;
    if (!logoUrl) return null;
    if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
      return logoUrl;
    }
    return `http://localhost:3006${logoUrl}`;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Clientes</h1>
          <button
            onClick={() => {
              resetForm();
              setIsClosing(false);
              setShowModal(true);
            }}
            className="text-white px-4 py-2 rounded-md flex items-center transition-colors"
            style={{ backgroundColor: '#3bb664' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2d9a4f'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3bb664'}
          >
            <Plus className="h-5 w-5 mr-2" />
            Novo Cliente
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3bb664]"></div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Logo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Links
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ordem
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {clients.map((client) => {
                    const logoUrl = getLogoUrl(client);
                    return (
                      <tr key={client.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="relative group">
                            {logoUrl ? (
                              <div className="relative">
                                <img
                                  src={logoUrl}
                                  alt={client.name}
                                  className="h-16 w-16 object-contain rounded"
                                />
                                <button
                                  onClick={() => handleLogoDelete(client.id)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Remover logo"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="h-16 w-16 bg-gray-100 rounded flex items-center justify-center">
                                <ImageIcon className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                            <label className="absolute inset-0 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleLogoUpload(client.id, file);
                                }}
                                disabled={uploadingLogo === client.id}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-50 rounded flex items-center justify-center">
                                {uploadingLogo === client.id ? (
                                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                ) : (
                                  <Upload className="h-6 w-6 text-white" />
                                )}
                              </div>
                            </label>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{client.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            {client.websiteUrl || client.website_url ? (
                              <a
                                href={client.websiteUrl || client.website_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                                title="Website"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            ) : null}
                            {client.facebookUrl || client.facebook_url ? (
                              <a
                                href={client.facebookUrl || client.facebook_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                                title="Facebook"
                              >
                                <Facebook className="h-4 w-4" />
                              </a>
                            ) : null}
                            {client.instagramUrl || client.instagram_url ? (
                              <a
                                href={client.instagramUrl || client.instagram_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-pink-600 hover:text-pink-800"
                                title="Instagram"
                              >
                                <Instagram className="h-4 w-4" />
                              </a>
                            ) : null}
                            {client.linkedinUrl || client.linkedin_url ? (
                              <a
                                href={client.linkedinUrl || client.linkedin_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-700 hover:text-blue-900"
                                title="LinkedIn"
                              >
                                <Linkedin className="h-4 w-4" />
                              </a>
                            ) : null}
                            {client.twitterUrl || client.twitter_url ? (
                              <a
                                href={client.twitterUrl || client.twitter_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-400 hover:text-blue-600"
                                title="Twitter"
                              >
                                <Twitter className="h-4 w-4" />
                              </a>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {client.order}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleStatus(client)}
                            className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium ${
                              client.isActive
                                ? 'text-white'
                                : 'bg-red-100 text-red-800'
                            }`}
                            style={client.isActive ? { backgroundColor: '#3bb664' } : {}}
                          >
                            {client.isActive ? 'Ativo' : 'Inativo'}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(client)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(client.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 modal-backdrop" onClick={handleCloseModal}>
            <div 
              className={`relative top-10 mx-auto p-6 border w-full max-w-2xl shadow-lg rounded-md bg-white my-8 modal-content ${isClosing ? 'closing' : ''}`}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Logo Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logomarca do Cliente
                  </label>
                  <div className="mt-1 flex items-center space-x-4">
                    {logoPreview ? (
                      <div className="relative">
                        <img
                          src={logoPreview}
                          alt="Preview"
                          className="h-24 w-24 object-contain border-2 border-gray-300 rounded-lg p-2"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setLogoPreview(null);
                            setLogoFile(null);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          title="Remover logo"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="h-24 w-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <label className="cursor-pointer">
                        <div className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                          <Upload className="h-4 w-4 mr-2" />
                          {logoPreview ? 'Alterar Logo' : 'Selecionar Logo'}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleLogoFileChange}
                          disabled={uploadingLogo === editingClient?.id}
                        />
                      </label>
                      <p className="mt-1 text-xs text-gray-500">
                        PNG, JPG ou GIF (máx. 5MB)
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 placeholder:text-gray-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Telefone (WhatsApp)</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 placeholder:text-gray-400"
                    placeholder="(00) 00000-0000"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Telefone para contato via WhatsApp no card do cliente
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Website</label>
                    <input
                      type="url"
                      value={formData.websiteUrl}
                      onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 placeholder:text-gray-400"
                      placeholder="https://exemplo.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Facebook</label>
                    <input
                      type="url"
                      value={formData.facebookUrl}
                      onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 placeholder:text-gray-400"
                      placeholder="https://facebook.com/exemplo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Instagram</label>
                    <input
                      type="url"
                      value={formData.instagramUrl}
                      onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 placeholder:text-gray-400"
                      placeholder="https://instagram.com/exemplo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">LinkedIn</label>
                    <input
                      type="url"
                      value={formData.linkedinUrl}
                      onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 placeholder:text-gray-400"
                      placeholder="https://linkedin.com/company/exemplo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Twitter</label>
                    <input
                      type="url"
                      value={formData.twitterUrl}
                      onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 placeholder:text-gray-400"
                      placeholder="https://twitter.com/exemplo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ordem</label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 placeholder:text-gray-400"
                      min="0"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-[#3bb664] focus:ring-[#3bb664] border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Ativo
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#3bb664' }}
                    onMouseEnter={(e) => {
                      if (!e.currentTarget.disabled) {
                        e.currentTarget.style.backgroundColor = '#2d9a4f';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!e.currentTarget.disabled) {
                        e.currentTarget.style.backgroundColor = '#3bb664';
                      }
                    }}
                    disabled={uploadingLogo === editingClient?.id}
                  >
                    {uploadingLogo === editingClient?.id ? (
                      <span className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Enviando...
                      </span>
                    ) : (
                      editingClient ? 'Atualizar' : 'Criar'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

