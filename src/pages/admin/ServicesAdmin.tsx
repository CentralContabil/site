import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { apiService } from '../../services/api';
import { Service } from '../../types';
import { toast } from 'sonner';

// Usar tipo compartilhado com camelCase

const ICON_OPTIONS = [
  'briefcase', 'calculator', 'chart-bar', 'clipboard-list', 'file-text',
  'handshake', 'shield', 'trending-up', 'users', 'wallet'
];

export default function ServicesAdmin() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    content: '',
    icon: '',
    imageUrl: '',
    order: 0,
    isActive: true
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllServices();
      setServices(response.services || []);
    } catch (error) {
      console.error('Error loading services:', error);
      toast.error('Erro ao carregar serviços');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingService) {
        await apiService.updateService(editingService.id, formData);
        toast.success('Serviço atualizado com sucesso!');
      } else {
        await apiService.createService(formData);
        toast.success('Serviço criado com sucesso!');
      }
      
      setShowModal(false);
      resetForm();
      loadServices();
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error('Erro ao salvar serviço');
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      slug: service.slug || '',
      description: service.description,
      content: service.content || '',
      icon: service.icon || '',
      imageUrl: service.imageUrl || service.image_url || '',
      order: service.order,
      isActive: service.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
      try {
        await apiService.deleteService(id);
        toast.success('Serviço excluído com sucesso!');
        loadServices();
      } catch (error) {
        console.error('Error deleting service:', error);
        toast.error('Erro ao excluir serviço');
      }
    }
  };

  const handleToggleStatus = async (service: Service) => {
    try {
      await apiService.updateService(service.id, { isActive: !service.isActive });
      toast.success(`Serviço ${!service.isActive ? 'ativado' : 'desativado'} com sucesso!`);
      loadServices();
    } catch (error) {
      console.error('Error toggling service status:', error);
      toast.error('Erro ao alterar status do serviço');
    }
  };

  const resetForm = () => {
    setEditingService(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      content: '',
      icon: '',
      imageUrl: '',
      order: 0,
      isActive: true
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Serviços</h1>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="text-white px-4 py-2 rounded-md flex items-center transition-colors"
            style={{ backgroundColor: '#3bb664' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2d9a4f'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3bb664'}
          >
            <Plus className="h-5 w-5 mr-2" />
            Novo Serviço
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3bb664]"></div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ícone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
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
                {services.map((service) => (
                  <tr key={service.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {service.icon && (
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#3bb66420' }}>
                          <span className="text-lg" style={{ color: '#3bb664' }}>{service.icon}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{service.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {service.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {service.order}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(service)}
                        className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium ${
                          service.isActive
                            ? 'text-white'
                            : 'bg-red-100 text-red-800'
                        }`}
                        style={service.isActive ? { backgroundColor: '#3bb664' } : {}}
                      >
                        {service.isActive ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(service)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {editingService ? 'Editar Serviço' : 'Novo Serviço'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Slug (URL amigável)</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="ex: abertura-de-empresa"
                  />
                  <p className="mt-1 text-xs text-gray-500">Deixe em branco para gerar automaticamente a partir do nome</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descrição</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    rows={3}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Conteúdo Completo (HTML)</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    rows={6}
                    placeholder="Conteúdo completo do serviço em HTML (opcional)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">URL da Imagem</label>
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ícone</label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Selecione um ícone</option>
                    {ICON_OPTIONS.map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ordem</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    min="0"
                    required
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                    Ativo
                  </label>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white rounded-md transition-colors"
                    style={{ backgroundColor: '#3bb664' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2d9a4f'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3bb664'}
                  >
                    {editingService ? 'Atualizar' : 'Criar'}
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
