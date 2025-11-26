import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Upload, Image as ImageIcon, Video, Trash2 as DeleteIcon } from 'lucide-react';
import { apiService } from '../../services/api';
import { Testimonial } from '../../types';
import { toast } from 'sonner';

export default function TestimonialsAdmin() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState({
    clientName: '',
    company: '',
    testimonialText: '',
    mediaType: 'image' as 'image' | 'video',
    mediaUrl: '',
    order: 0,
    isActive: true
  });
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const fetchTestimonials = async () => {
    try {
      const response = await apiService.getAllTestimonials();
      setTestimonials(response.testimonials || []);
    } catch (error) {
      toast.error('Erro ao carregar depoimentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  // Atualizar formData quando editingTestimonial mudar
  useEffect(() => {
    if (editingTestimonial && showModal) {
      console.log('🔄 Atualizando formData com editingTestimonial:', editingTestimonial);
      setFormData({
        clientName: editingTestimonial.clientName || '',
        company: editingTestimonial.company || '',
        testimonialText: editingTestimonial.testimonialText || '',
        mediaType: editingTestimonial.mediaType || 'image',
        mediaUrl: editingTestimonial.mediaUrl || editingTestimonial.clientImageUrl || '',
        order: editingTestimonial.order || 0,
        isActive: editingTestimonial.isActive !== undefined ? editingTestimonial.isActive : true
      });
    }
  }, [editingTestimonial, showModal]);

  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosing(false);
      setEditingTestimonial(null);
      setFormData({ clientName: '', company: '', testimonialText: '', mediaType: 'image', mediaUrl: '', order: 0, isActive: true });
    }, 200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTestimonial) {
        await apiService.updateTestimonial(editingTestimonial.id, {
          ...formData,
          mediaType: formData.mediaType,
          mediaUrl: formData.mediaUrl,
        });
        toast.success('Depoimento atualizado com sucesso!');
      } else {
        const result = await apiService.createTestimonial({
          ...formData,
          mediaType: formData.mediaType,
          mediaUrl: formData.mediaUrl,
        });
        // Se houver mídia para upload, fazer upload após criar
        if (formData.mediaUrl && result.testimonial) {
          setEditingTestimonial(result.testimonial);
          toast.info('Depoimento criado. Agora você pode adicionar a mídia.');
          return; // Não fechar o modal para permitir upload
        }
        toast.success('Depoimento criado com sucesso!');
      }
      
      handleCloseModal();
      fetchTestimonials();
    } catch (error) {
      toast.error('Erro ao salvar depoimento');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este depoimento?')) {
      try {
        await apiService.deleteTestimonial(id);
        toast.success('Depoimento excluído com sucesso!');
        fetchTestimonials();
      } catch (error) {
        toast.error('Erro ao excluir depoimento');
      }
    }
  };

  const openEditModal = (testimonial: Testimonial) => {
    console.log('📝 Abrindo modal de edição com depoimento:', testimonial);
    setEditingTestimonial(testimonial);
    const formDataToSet = {
      clientName: testimonial.clientName || '',
      company: testimonial.company || '',
      testimonialText: testimonial.testimonialText || '',
      mediaType: (testimonial.mediaType || 'image') as 'image' | 'video',
      mediaUrl: testimonial.mediaUrl || testimonial.clientImageUrl || '',
      order: testimonial.order || 0,
      isActive: testimonial.isActive !== undefined ? testimonial.isActive : true
    };
    console.log('📋 FormData a ser definido:', formDataToSet);
    setFormData(formDataToSet);
    setIsClosing(false);
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingTestimonial(null);
    setFormData({ clientName: '', company: '', testimonialText: '', mediaType: 'image', mediaUrl: '', order: 0, isActive: true });
    setIsClosing(false);
    setShowModal(true);
  };

  const handleMediaUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Se não há depoimento criado ainda, criar primeiro
    if (!editingTestimonial) {
      // Criar depoimento básico primeiro
      try {
        setUploadingMedia(true);
        const createData = {
          clientName: formData.clientName || 'Cliente',
          company: formData.company || '',
          testimonialText: formData.testimonialText || 'Depoimento',
          mediaType: formData.mediaType,
          order: formData.order,
          isActive: formData.isActive,
        };
        const result = await apiService.createTestimonial(createData);
        setEditingTestimonial(result.testimonial);
        
        // Agora fazer upload da mídia
        const uploadResult = await apiService.uploadTestimonialMedia(result.testimonial.id, file, formData.mediaType);
        setFormData({ ...formData, mediaUrl: uploadResult.data.url });
        toast.success('Depoimento criado e mídia enviada com sucesso!');
        fetchTestimonials();
      } catch (error: any) {
        console.error('Erro ao criar e fazer upload:', error);
        toast.error(error.message || 'Erro ao criar depoimento e fazer upload');
      } finally {
        setUploadingMedia(false);
        event.target.value = '';
      }
      return;
    }

    // Se já existe depoimento, apenas fazer upload
    setUploadingMedia(true);
    try {
      const result = await apiService.uploadTestimonialMedia(editingTestimonial.id, file, formData.mediaType);
      setFormData({ ...formData, mediaUrl: result.data.url });
      setEditingTestimonial(result.testimonial);
      toast.success('Mídia enviada com sucesso!');
      fetchTestimonials();
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      toast.error(error.message || 'Erro ao fazer upload da mídia');
    } finally {
      setUploadingMedia(false);
      event.target.value = '';
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gerenciar Depoimentos</h1>
        <button
          onClick={openCreateModal}
          className="text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          style={{ backgroundColor: '#3bb664' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2d9a4f'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3bb664'}
        >
          <Plus className="w-4 h-4" />
          Novo Depoimento
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        {testimonials.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Nenhum depoimento cadastrado ainda.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-800">{testimonial.clientName}</h3>
                      <span className="text-gray-500 text-sm">{testimonial.company}</span>
                    </div>
      
                    <p className="text-gray-600 mb-2">{testimonial.testimonialText}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(testimonial.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(testimonial)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(testimonial.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 modal-backdrop" onClick={handleCloseModal}>
          <div 
            className={`bg-white rounded-lg max-w-md w-full p-6 modal-content ${isClosing ? 'closing' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingTestimonial ? 'Editar Depoimento' : 'Novo Depoimento'}
              </h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  required
                  value={formData.clientName || ''}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-colors text-gray-900"
                  style={{ '--tw-ring-color': '#3bb664' } as React.CSSProperties & { '--tw-ring-color': string }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#3bb664'; e.currentTarget.style.setProperty('--tw-ring-color', '#3bb664'); }}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empresa
                </label>
                <input
                  type="text"
                  value={formData.company || ''}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-colors text-gray-900"
                  style={{ '--tw-ring-color': '#3bb664' } as React.CSSProperties & { '--tw-ring-color': string }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#3bb664'; e.currentTarget.style.setProperty('--tw-ring-color', '#3bb664'); }}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Depoimento
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.testimonialText || ''}
                  onChange={(e) => setFormData({ ...formData, testimonialText: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-colors text-gray-900"
                  style={{ '--tw-ring-color': '#3bb664' } as React.CSSProperties & { '--tw-ring-color': string }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#3bb664'; e.currentTarget.style.setProperty('--tw-ring-color', '#3bb664'); }}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Mídia
                </label>
                <select
                  value={formData.mediaType}
                  onChange={(e) => setFormData({ ...formData, mediaType: e.target.value as 'image' | 'video', mediaUrl: '' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-colors text-gray-900"
                  style={{ '--tw-ring-color': '#3bb664' } as React.CSSProperties & { '--tw-ring-color': string }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#3bb664'; e.currentTarget.style.setProperty('--tw-ring-color', '#3bb664'); }}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                >
                  <option value="image">Imagem</option>
                  <option value="video">Vídeo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.mediaType === 'image' ? 'Imagem' : 'Vídeo'} do Cliente
                </label>
                {formData.mediaUrl ? (
                  <div className="space-y-2">
                    {formData.mediaType === 'image' ? (
                      <img
                        src={formData.mediaUrl}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                    ) : (
                      <video
                        src={formData.mediaUrl}
                        controls
                        className="w-full h-48 rounded-lg border"
                      />
                    )}
                    <div className="flex gap-2">
                      <input
                        type="file"
                        accept={formData.mediaType === 'image' ? 'image/*' : 'video/*'}
                        onChange={handleMediaUpload}
                        className="hidden"
                        disabled={uploadingMedia}
                        id="testimonial-media-upload"
                      />
                      <button
                        type="button"
                        onClick={() => document.getElementById('testimonial-media-upload')?.click()}
                        disabled={uploadingMedia}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {uploadingMedia ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            Trocar {formData.mediaType === 'image' ? 'Imagem' : 'Vídeo'}
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, mediaUrl: '' })}
                        className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <DeleteIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept={formData.mediaType === 'image' ? 'image/*' : 'video/*'}
                      onChange={handleMediaUpload}
                      className="hidden"
                      disabled={uploadingMedia}
                      id="testimonial-media-upload-empty"
                    />
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#3bb664] transition-colors"
                      onClick={() => {
                        if (!uploadingMedia) {
                          document.getElementById('testimonial-media-upload-empty')?.click();
                        }
                      }}
                    >
                      {uploadingMedia ? (
                        <div className="flex flex-col items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3bb664] mb-2"></div>
                          <span className="text-sm text-gray-600">Enviando...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          {formData.mediaType === 'image' ? (
                            <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                          ) : (
                            <Video className="h-8 w-8 text-gray-400 mb-2" />
                          )}
                          <p className="text-gray-600">Clique para fazer upload</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formData.mediaType === 'image' 
                              ? 'JPG, PNG, GIF ou WebP (máx. 5MB)'
                              : 'MP4, WebM ou OGG (máx. 50MB)'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-white rounded-lg transition-colors"
                  style={{ backgroundColor: '#3bb664' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2d9a4f'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3bb664'}
                >
                  {editingTestimonial ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}