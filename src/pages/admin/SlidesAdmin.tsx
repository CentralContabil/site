import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  ArrowUp,
  ArrowDown,
  Upload
} from 'lucide-react';
import { apiService } from '../../services/api';
import { Slide } from '../../types';
import { toast } from 'sonner';

// Usar tipo compartilhado com camelCase

export default function SlidesAdmin() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    buttonText: '',
    buttonLink: '',
    order: 0,
    isActive: true
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    loadSlides();
  }, []);

  const loadSlides = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllSlides();
      setSlides(response.slides || []);
    } catch (error) {
      console.error('Error loading slides:', error);
      toast.error('Erro ao carregar slides');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('subtitle', formData.subtitle);
      formDataToSend.append('buttonText', formData.buttonText);
      formDataToSend.append('buttonLink', formData.buttonLink);
      formDataToSend.append('order', formData.order.toString());
      formDataToSend.append('isActive', formData.isActive.toString());
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      if (editingSlide) {
        await apiService.updateSlide(editingSlide.id, formDataToSend);
        toast.success('Slide atualizado com sucesso!');
      } else {
        await apiService.createSlide(formDataToSend);
        toast.success('Slide criado com sucesso!');
      }
      
      setShowModal(false);
      resetForm();
      loadSlides();
    } catch (error) {
      console.error('Error saving slide:', error);
      toast.error('Erro ao salvar slide');
    }
  };

  const handleEdit = (slide: Slide) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title,
      subtitle: slide.subtitle || '',
      buttonText: slide.buttonText || '',
      buttonLink: slide.buttonLink || '',
      order: slide.order,
      isActive: slide.isActive
    });
    setImagePreview(slide.imageUrl);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este slide?')) {
      try {
        await apiService.deleteSlide(id);
        toast.success('Slide excluído com sucesso!');
        loadSlides();
      } catch (error) {
        console.error('Error deleting slide:', error);
        toast.error('Erro ao excluir slide');
      }
    }
  };

  const handleToggleStatus = async (slide: Slide) => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('isActive', (!slide.isActive).toString());
      formDataToSend.append('title', slide.title);
      formDataToSend.append('order', slide.order.toString());
      
      await apiService.updateSlide(slide.id, formDataToSend);
      toast.success(`Slide ${!slide.isActive ? 'ativado' : 'desativado'} com sucesso!`);
      loadSlides();
    } catch (error) {
      console.error('Error toggling slide status:', error);
      toast.error('Erro ao alterar status do slide');
    }
  };

  const resetForm = () => {
    setEditingSlide(null);
    setFormData({
      title: '',
      subtitle: '',
      buttonText: '',
      buttonLink: '',
      order: 0,
      isActive: true
    });
    setImageFile(null);
    setImagePreview('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Slides</h1>
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
            Novo Slide
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
                    Imagem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Botão
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
                {slides.map((slide) => (
                  <tr key={slide.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={slide.imageUrl}
                        alt={slide.title}
                        className="h-12 w-20 object-cover rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{slide.title}</div>
                      {slide.subtitle && (
                        <div className="text-sm text-gray-500">{slide.subtitle}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {slide.buttonText && (
                        <div className="text-sm text-gray-900">{slide.buttonText}</div>
                      )}
                      {slide.buttonLink && (
                        <div className="text-sm text-gray-500 text-xs">{slide.buttonLink}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {slide.order}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(slide)}
                        className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium ${
                          slide.isActive
                            ? 'text-white'
                            : 'bg-red-100 text-red-800'
                        }`}
                        style={slide.isActive ? { backgroundColor: '#3bb664' } : {}}
                      >
                        {slide.isActive ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(slide)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(slide.id)}
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
                {editingSlide ? 'Editar Slide' : 'Novo Slide'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Título</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subtítulo</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Texto do Botão</label>
                  <input
                    type="text"
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Link do Botão</label>
                  <input
                    type="url"
                    value={formData.buttonLink}
                    onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Imagem</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="mt-1 block w-full"
                    required={!editingSlide}
                  />
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="mt-2 h-20 object-cover rounded" />
                  )}
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
                    {editingSlide ? 'Atualizar' : 'Criar'}
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
