import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { apiService } from '../../services/api';
import { Service } from '../../types';
import { toast } from 'sonner';

// Usar tipo compartilhado com camelCase

const ICON_OPTIONS = [
  'briefcase', 'calculator', 'chart-bar', 'clipboard-list', 'file-text',
  'handshake', 'shield', 'trending-up', 'users', 'wallet'
];

// Componente para linha arrastável
function SortableRow({ 
  service, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  renderIcon 
}: { 
  service: Service; 
  onEdit: (service: Service) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (service: Service) => void;
  renderIcon: (iconName: string) => React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: service.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} className={isDragging ? 'bg-gray-100' : ''}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 p-1"
            title="Arrastar para reordenar"
          >
            <GripVertical className="w-5 h-5" />
          </button>
          {service.icon && (
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#3bb66420' }}>
              {renderIcon(service.icon)}
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900">{service.name}</div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-500 max-w-xs truncate">
          {service.description}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <button
          onClick={() => onToggleStatus(service)}
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
            onClick={() => onEdit(service)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(service.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Excluir"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function ServicesAdmin() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
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

  // Sensores para drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
      if (editingService) {
        await apiService.updateService(editingService.id, formData);
        toast.success('Serviço atualizado com sucesso!');
      } else {
        await apiService.createService(formData);
        toast.success('Serviço criado com sucesso!');
      }
      
      handleCloseModal();
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
    setIsClosing(false);
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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!editingService) {
      toast.error('Salve o serviço primeiro antes de adicionar imagem');
      return;
    }

    setUploadingImage(true);
    try {
      const result = await apiService.uploadServiceImage(editingService.id, file);
      setFormData((prev) => ({ ...prev, imageUrl: result.data.url }));
      toast.success('Imagem enviada com sucesso!');
      loadServices();
    } catch (error: any) {
      console.error('Erro ao fazer upload da imagem do serviço:', error);
      toast.error(error.message || 'Erro ao fazer upload da imagem');
    } finally {
      setUploadingImage(false);
      event.target.value = '';
    }
  };

  const handleDeleteImage = async () => {
    if (!editingService) return;

    if (!window.confirm('Tem certeza que deseja remover a imagem do serviço?')) {
      return;
    }

    setUploadingImage(true);
    try {
      await apiService.deleteServiceImage(editingService.id);
      setFormData((prev) => ({ ...prev, imageUrl: '' }));
      toast.success('Imagem removida com sucesso!');
      loadServices();
    } catch (error: any) {
      console.error('Erro ao remover imagem do serviço:', error);
      toast.error(error.message || 'Erro ao remover imagem');
    } finally {
      setUploadingImage(false);
    }
  };

  // Handler para quando o drag termina
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = services.findIndex((s) => s.id === active.id);
      const newIndex = services.findIndex((s) => s.id === over.id);

      const newServices = arrayMove(services, oldIndex, newIndex);
      
      // Atualizar a ordem localmente primeiro (otimista)
      setServices(newServices);

      // Atualizar a ordem no backend
      try {
        // Atualizar a ordem de todos os serviços afetados
        const updates = newServices.map((service, index) => ({
          id: service.id,
          order: index + 1,
        }));

        // Atualizar cada serviço
        await Promise.all(
          updates.map((update) =>
            apiService.updateService(update.id, { order: update.order })
          )
        );

        toast.success('Ordem atualizada com sucesso!');
      } catch (error) {
        console.error('Error updating order:', error);
        toast.error('Erro ao atualizar ordem. Recarregando...');
        // Reverter para o estado anterior
        loadServices();
      }
    }
  };

  // Função para renderizar o ícone
  const renderIcon = (iconName: string) => {
    if (!iconName) return null;
    
    // Normalizar o nome do ícone: remover espaços, converter para PascalCase
    // Exemplos: "trending-up" -> "TrendingUp", "file-text" -> "FileText", "chart-bar" -> "ChartBar"
    const normalizedName = iconName
      .toLowerCase()
      .replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '')
      .replace(/^(.)/, (_, c) => c.toUpperCase());
    
    // Tentar encontrar o ícone no lucide-react
    const IconComponent = (LucideIcons as any)[normalizedName];
    
    if (IconComponent) {
      return <IconComponent className="w-5 h-5" style={{ color: '#3bb664' }} />;
    }
    
    // Se não encontrar, tentar com o nome original (caso já esteja em PascalCase)
    const IconComponentOriginal = (LucideIcons as any)[iconName];
    if (IconComponentOriginal) {
      return <IconComponentOriginal className="w-5 h-5" style={{ color: '#3bb664' }} />;
    }
    
    // Fallback se o ícone não for encontrado
    return <span className="text-xs" style={{ color: '#3bb664' }}>{iconName}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Serviços</h1>
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
            Novo Serviço
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3bb664]"></div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                      
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descrição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <SortableContext
                  items={services.map((s) => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <tbody className="bg-white divide-y divide-gray-200">
                    {services.map((service) => (
                      <SortableRow
                        key={service.id}
                        service={service}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onToggleStatus={handleToggleStatus}
                        renderIcon={renderIcon}
                      />
                    ))}
                  </tbody>
                </SortableContext>
              </table>
            </DndContext>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 modal-backdrop" onClick={handleCloseModal}>
            <div 
              className={`relative top-10 mx-auto p-6 border w-full max-w-3xl shadow-lg rounded-md bg-white my-8 modal-content ${isClosing ? 'closing' : ''}`}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagem do Serviço
                  </label>
                  {formData.imageUrl ? (
                    <div className="space-y-3">
                      <img
                        src={formData.imageUrl}
                        alt="Pré-visualização"
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                      <div className="flex flex-wrap gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={uploadingImage || !editingService}
                          id="service-image-upload"
                        />
                        <button
                          type="button"
                          onClick={() => document.getElementById('service-image-upload')?.click()}
                          disabled={uploadingImage || !editingService}
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
                          disabled={uploadingImage || !editingService}
                          className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remover
                        </button>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          URL da imagem (opcional)
                        </label>
                        <input
                          type="text"
                          value={formData.imageUrl}
                          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                          className="block w-full border border-gray-300 rounded-md px-3 py-2 text-xs"
                          placeholder="https://exemplo.com/imagem.jpg"
                        />
                      </div>
                      {!editingService && (
                        <p className="text-xs text-gray-500">
                          Salve o serviço primeiro para fazer upload de imagem
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImage || !editingService}
                        id="service-image-upload-empty"
                      />
                      <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#3bb664] transition-colors flex flex-col items-center gap-2"
                        onClick={() => {
                          if (!uploadingImage && editingService) {
                            document.getElementById('service-image-upload-empty')?.click();
                          } else if (!editingService) {
                            toast.error('Salve o serviço primeiro antes de adicionar imagem');
                          }
                        }}
                      >
                        <ImageIcon className="w-8 h-8 text-gray-400 mb-1" />
                        <p className="text-sm text-gray-600">
                          Clique para enviar uma imagem do serviço
                        </p>
                        <p className="text-xs text-gray-400">
                          PNG, JPG ou WEBP até 5MB
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Ou informe a URL da imagem
                        </label>
                        <input
                          type="text"
                          value={formData.imageUrl}
                          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                          className="block w-full border border-gray-300 rounded-md px-3 py-2 text-xs"
                          placeholder="https://exemplo.com/imagem.jpg"
                        />
                      </div>
                    </div>
                  )}
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
                    onClick={handleCloseModal}
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
