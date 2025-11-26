import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BlogPost, CreateBlogPostRequest, UpdateBlogPostRequest, Category, CreateCategoryRequest, UpdateCategoryRequest, Tag, CreateTagRequest, UpdateTagRequest } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { RichTextEditor } from '../../components/ui/RichTextEditor';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, Edit, Trash2, Eye, Calendar, User, FileText, Search, Filter, Upload, Image as ImageIcon, Trash2 as DeleteIcon, ChevronDown, Tag as TagIcon, Folder, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '../../services/api';
import Swal from 'sweetalert2';

export const BlogAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'posts' | 'categories' | 'tags'>('posts');
  
  // Posts states
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Categories states
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryFormData, setCategoryFormData] = useState<CreateCategoryRequest>({
    name: '',
    description: '',
    color: '#3bb664',
    isActive: true
  });
  
  // Tags states
  const [tags, setTags] = useState<Tag[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [showTagForm, setShowTagForm] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [tagFormData, setTagFormData] = useState<CreateTagRequest>({
    name: '',
    description: '',
    color: '#6b7280',
    isActive: true
  });

  const [formData, setFormData] = useState<CreateBlogPostRequest>({
    title: '',
    excerpt: '',
    content: '',
    featuredImageUrl: '',
    author: 'Admin',
    isPublished: false,
    categoryIds: [],
    tagIds: [],
    publishToFacebook: false,
    publishToInstagram: false,
    publishToLinkedIn: false,
    publishToTwitter: false,
    publishToThreads: false
  });

  const [configuration, setConfiguration] = useState<any>(null);

  useEffect(() => {
    fetchPosts();
    fetchCategories();
    fetchTags();
    fetchConfiguration();
  }, []);

  const fetchConfiguration = async () => {
    try {
      const response = await fetch('/api/configurations');
      if (response.ok) {
        const data = await response.json();
        setConfiguration(data);
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await apiService.getCategories();
      setCategories(response.categories || []);
    } catch (error: any) {
      console.error('Erro ao carregar categorias:', error);
      toast.error('Erro ao carregar categorias');
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        await apiService.updateCategory(editingCategory.id, categoryFormData);
        toast.success('Categoria atualizada com sucesso!');
      } else {
        await apiService.createCategory(categoryFormData);
        toast.success('Categoria criada com sucesso!');
      }
      
      fetchCategories();
      resetCategoryForm();
    } catch (error: any) {
      console.error('Erro ao salvar categoria:', error);
      toast.error(error?.message || 'Erro ao salvar categoria');
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      description: category.description || '',
      color: category.color || '#3bb664',
      isActive: category.isActive
    });
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = async (id: string) => {
    const result = await Swal.fire({
      title: 'Tem certeza?',
      text: 'Esta ação não pode ser desfeita!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await apiService.deleteCategory(id);
        toast.success('Categoria excluída com sucesso!');
        fetchCategories();
      } catch (error: any) {
        console.error('Erro ao excluir categoria:', error);
        if (error?.response?.status === 400) {
          Swal.fire({
            title: 'Erro',
            text: 'Não é possível excluir uma categoria que possui posts associados.',
            icon: 'error'
          });
        } else {
          toast.error('Erro ao excluir categoria');
        }
      }
    }
  };

  const resetCategoryForm = () => {
    setCategoryFormData({
      name: '',
      description: '',
      color: '#3bb664',
      isActive: true
    });
    setEditingCategory(null);
    setShowCategoryForm(false);
  };

  const fetchTags = async () => {
    try {
      setLoadingTags(true);
      const response = await apiService.getTags();
      setTags(response.tags || []);
    } catch (error: any) {
      console.error('Erro ao carregar tags:', error);
      toast.error('Erro ao carregar tags');
    } finally {
      setLoadingTags(false);
    }
  };

  const handleTagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTag) {
        await apiService.updateTag(editingTag.id, tagFormData);
        toast.success('Tag atualizada com sucesso!');
      } else {
        await apiService.createTag(tagFormData);
        toast.success('Tag criada com sucesso!');
      }
      
      fetchTags();
      resetTagForm();
    } catch (error: any) {
      console.error('Erro ao salvar tag:', error);
      toast.error(error?.message || 'Erro ao salvar tag');
    }
  };

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag);
    setTagFormData({
      name: tag.name,
      description: tag.description || '',
      color: tag.color || '#6b7280',
      isActive: tag.isActive
    });
    setShowTagForm(true);
  };

  const handleDeleteTag = async (id: string) => {
    const result = await Swal.fire({
      title: 'Tem certeza?',
      text: 'Esta ação não pode ser desfeita!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await apiService.deleteTag(id);
        toast.success('Tag excluída com sucesso!');
        fetchTags();
      } catch (error: any) {
        console.error('Erro ao excluir tag:', error);
        if (error?.response?.status === 400) {
          Swal.fire({
            title: 'Erro',
            text: 'Não é possível excluir uma tag que possui posts associados.',
            icon: 'error'
          });
        } else {
          toast.error('Erro ao excluir tag');
        }
      }
    }
  };

  const resetTagForm = () => {
    setTagFormData({
      name: '',
      description: '',
      color: '#6b7280',
      isActive: true
    });
    setEditingTag(null);
    setShowTagForm(false);
  };

  const normalizePost = (post: any): BlogPost => {
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || undefined,
      content: post.content,
      featuredImageUrl: post.featured_image_url || post.featuredImageUrl || undefined,
      featured_image_url: post.featured_image_url || post.featuredImageUrl || undefined,
      author: post.author,
      isPublished: post.is_published !== undefined ? post.is_published : post.isPublished,
      is_published: post.is_published !== undefined ? post.is_published : post.isPublished,
      publishedAt: post.published_at ? new Date(post.published_at) : post.publishedAt,
      published_at: post.published_at || post.publishedAt,
      createdAt: post.created_at ? new Date(post.created_at) : new Date(post.createdAt || Date.now()),
      created_at: post.created_at || post.createdAt,
      updatedAt: post.updated_at ? new Date(post.updated_at) : new Date(post.updatedAt || Date.now()),
      updated_at: post.updated_at || post.updatedAt,
      categories: post.categories || [],
      tags: post.tags || []
    };
  };

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      const response = await fetch('/api/blog/posts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📝 Posts recebidos da API:', data);
        // Normalizar os dados recebidos da API
        const normalizedPosts = Array.isArray(data) ? data.map(normalizePost) : [];
        console.log('📝 Posts normalizados:', normalizedPosts);
        setPosts(normalizedPosts);
        setError(null);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erro ao carregar posts:', response.status, errorData);
        const errorMsg = errorData.error || `Erro ${response.status}: ${response.statusText}`;
        setError(errorMsg);
        toast.error('Erro ao carregar posts');
      }
    } catch (error: any) {
      console.error('❌ Erro ao carregar posts:', error);
      const errorMsg = error?.message || 'Erro de conexão ao carregar posts';
      setError(errorMsg);
      toast.error('Erro ao carregar posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      const url = editingPost 
        ? `/api/blog/posts/${editingPost.id}`
        : '/api/blog/posts';
      
      const method = editingPost ? 'PUT' : 'POST';

      // Converter categoryIds e tagIds para category_ids e tag_ids
      const requestData: any = {
        ...formData,
        category_ids: formData.categoryIds || [],
        tag_ids: formData.tagIds || []
      };
      delete requestData.categoryIds;
      delete requestData.tagIds;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        toast.success(editingPost ? 'Post atualizado com sucesso!' : 'Post criado com sucesso!');
        fetchPosts();
        resetForm();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao salvar post');
      }
    } catch (error) {
      console.error('Erro ao salvar post:', error);
      toast.error('Erro ao salvar post');
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    
    // Mapear categoryIds considerando diferentes estruturas
    const categoryIds = post.categories?.map(c => 
      c.category_id || c.category?.id
    ).filter(Boolean) || [];
    
    // Mapear tagIds considerando diferentes estruturas
    const tagIds = post.tags?.map(t => 
      t.tag_id || t.tag?.id
    ).filter(Boolean) || [];
    
    setFormData({
      title: post.title,
      excerpt: post.excerpt || '',
      content: post.content,
      featuredImageUrl: post.featuredImageUrl || '',
      author: post.author,
      isPublished: post.isPublished,
      categoryIds,
      tagIds
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este post?')) return;

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      const response = await fetch(`/api/blog/posts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Post excluído com sucesso!');
        fetchPosts();
      } else {
        toast.error('Erro ao excluir post');
      }
    } catch (error) {
      console.error('Erro ao excluir post:', error);
      toast.error('Erro ao excluir post');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      featuredImageUrl: '',
      author: 'Admin',
      isPublished: false,
      categoryIds: [],
      tagIds: [],
      publishToFacebook: false,
      publishToInstagram: false,
      publishToLinkedIn: false,
      publishToTwitter: false,
      publishToThreads: false
    });
    setEditingPost(null);
    setShowForm(false);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!editingPost) {
      toast.error('Crie o post primeiro antes de adicionar imagem');
      return;
    }

    setUploadingImage(true);
    try {
      const result = await apiService.uploadBlogPostImage(editingPost.id, file);
      setFormData({ ...formData, featuredImageUrl: result.data.url });
      toast.success('Imagem enviada com sucesso!');
      fetchPosts();
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      toast.error(error.message || 'Erro ao fazer upload da imagem');
    } finally {
      setUploadingImage(false);
      event.target.value = '';
    }
  };

  const handleDeleteImage = async () => {
    if (!editingPost) return;

    if (!window.confirm('Tem certeza que deseja remover a imagem destacada?')) {
      return;
    }

    setUploadingImage(true);
    try {
      await apiService.deleteBlogPostImage(editingPost.id);
      setFormData({ ...formData, featuredImageUrl: '' });
      toast.success('Imagem removida com sucesso!');
      fetchPosts();
    } catch (error: any) {
      console.error('Erro ao remover imagem:', error);
      toast.error(error.message || 'Erro ao remover imagem');
    } finally {
      setUploadingImage(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                           (filterStatus === 'published' && post.isPublished) ||
                           (filterStatus === 'draft' && !post.isPublished);
    
    const matchesCategory = filterCategory === 'all' || 
      (post.categories && post.categories.some(c => 
        c.category_id === filterCategory || c.category?.id === filterCategory
      ));
    
    return matchesSearch && matchesFilter && matchesCategory;
  });

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return 'Data não disponível';
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      if (isNaN(dateObj.getTime())) return 'Data inválida';
      return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: ptBR });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };

  if (showForm) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {editingPost ? 'Editar Post' : 'Novo Post'}
            </h1>
            <Button variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título *
                  </label>
                  <Input
                    type="text"
                    value={formData.title}
                    onChange={(value) => setFormData({ ...formData, title: value })}
                    required
                    placeholder="Digite o título do post"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resumo
                  </label>
                  <Textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    placeholder="Digite um resumo do post (opcional)"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagem Destacada
                  </label>
                  {formData.featuredImageUrl ? (
                    <div className="space-y-2">
                      <img
                        src={formData.featuredImageUrl}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                      <div className="flex gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={uploadingImage || !editingPost}
                          id="blog-image-upload"
                        />
                        <button
                          type="button"
                          onClick={() => document.getElementById('blog-image-upload')?.click()}
                          disabled={uploadingImage || !editingPost}
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
                          disabled={uploadingImage || !editingPost}
                          className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <DeleteIcon className="w-4 h-4" />
                        </button>
                      </div>
                      {!editingPost && (
                        <p className="text-xs text-gray-500">Salve o post primeiro para fazer upload de imagem</p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImage || !editingPost}
                        id="blog-image-upload-empty"
                      />
                      <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#3bb664] transition-colors"
                        onClick={() => {
                          if (!uploadingImage && editingPost) {
                            document.getElementById('blog-image-upload-empty')?.click();
                          } else if (!editingPost) {
                            toast.error('Salve o post primeiro antes de adicionar imagem');
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
                            <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-gray-600">Clique para fazer upload</p>
                            <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF ou WebP (máx. 5MB)</p>
                            {!editingPost && (
                              <p className="text-xs text-red-500 mt-2">Salve o post primeiro</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {/* Campo de URL como alternativa */}
                  <div className="mt-2">
                    <label className="block text-xs text-gray-500 mb-1">
                      Ou insira uma URL de imagem
                    </label>
                    <Input
                      type="text"
                      value={formData.featuredImageUrl}
                      onChange={(value) => setFormData({ ...formData, featuredImageUrl: value })}
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Autor
                  </label>
                  <Input
                    type="text"
                    value={formData.author}
                    onChange={(value) => setFormData({ ...formData, author: value })}
                    placeholder="Nome do autor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conteúdo *
                  </label>
                  <RichTextEditor
                    value={formData.content}
                    onChange={(value) => setFormData({ ...formData, content: value })}
                    placeholder="Digite o conteúdo do post..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categorias
                  </label>
                  {categories.length === 0 ? (
                    <p className="text-sm text-gray-500 mb-2">
                      Nenhuma categoria disponível. Crie categorias na aba "Categorias".
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {categories.filter(c => c.isActive).map((category) => (
                        <label
                          key={category.id}
                          className="flex items-center p-2 border border-gray-300 rounded cursor-pointer hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={formData.categoryIds?.includes(category.id) || false}
                            onChange={(e) => {
                              const currentIds = formData.categoryIds || [];
                              if (e.target.checked) {
                                setFormData({ ...formData, categoryIds: [...currentIds, category.id] });
                              } else {
                                setFormData({ ...formData, categoryIds: currentIds.filter(id => id !== category.id) });
                              }
                            }}
                            className="h-4 w-4 text-[#3bb664] focus:ring-[#3bb664] border-gray-300 rounded mr-2"
                          />
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: category.color || '#3bb664' }}
                          />
                          <span className="text-sm text-gray-900">{category.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  {tags.length === 0 ? (
                    <p className="text-sm text-gray-500 mb-2">
                      Nenhuma tag disponível. Crie tags na aba "Tags".
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {tags.filter(t => t.isActive).map((tag) => (
                        <label
                          key={tag.id}
                          className="flex items-center p-2 border border-gray-300 rounded cursor-pointer hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={formData.tagIds?.includes(tag.id) || false}
                            onChange={(e) => {
                              const currentIds = formData.tagIds || [];
                              if (e.target.checked) {
                                setFormData({ ...formData, tagIds: [...currentIds, tag.id] });
                              } else {
                                setFormData({ ...formData, tagIds: currentIds.filter(id => id !== tag.id) });
                              }
                            }}
                            className="h-4 w-4 text-[#6b7280] focus:ring-[#6b7280] border-gray-300 rounded mr-2"
                          />
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: tag.color || '#6b7280' }}
                          />
                          <span className="text-sm text-gray-900">{tag.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="h-4 w-4 text-[#3bb664] focus:ring-[#3bb664] border-gray-300 rounded"
                  />
                  <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-900">
                    Publicar post
                  </label>
                </div>

                {/* Publicação em Redes Sociais */}
                {(configuration?.facebook_api_enabled || 
                  configuration?.instagram_api_enabled || 
                  configuration?.linkedin_api_enabled || 
                  configuration?.twitter_api_enabled || 
                  configuration?.threads_api_enabled) && (
                  <div className="border-t pt-4 mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Publicar em Redes Sociais
                    </label>
                    <div className="space-y-2">
                      {configuration?.facebook_api_enabled && (
                        <label className="flex items-center p-2 border border-gray-300 rounded cursor-pointer hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={formData.publishToFacebook || false}
                            onChange={(e) => setFormData({ ...formData, publishToFacebook: e.target.checked })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                          />
                          <Facebook className="w-4 h-4 mr-2 text-blue-600" />
                          <span className="text-sm text-gray-900">Facebook</span>
                        </label>
                      )}
                      {configuration?.instagram_api_enabled && (
                        <label className="flex items-center p-2 border border-gray-300 rounded cursor-pointer hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={formData.publishToInstagram || false}
                            onChange={(e) => setFormData({ ...formData, publishToInstagram: e.target.checked })}
                            className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded mr-2"
                          />
                          <Instagram className="w-4 h-4 mr-2 text-pink-600" />
                          <span className="text-sm text-gray-900">Instagram</span>
                        </label>
                      )}
                      {configuration?.linkedin_api_enabled && (
                        <label className="flex items-center p-2 border border-gray-300 rounded cursor-pointer hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={formData.publishToLinkedIn || false}
                            onChange={(e) => setFormData({ ...formData, publishToLinkedIn: e.target.checked })}
                            className="h-4 w-4 text-blue-700 focus:ring-blue-700 border-gray-300 rounded mr-2"
                          />
                          <Linkedin className="w-4 h-4 mr-2 text-blue-700" />
                          <span className="text-sm text-gray-900">LinkedIn</span>
                        </label>
                      )}
                      {configuration?.twitter_api_enabled && (
                        <label className="flex items-center p-2 border border-gray-300 rounded cursor-pointer hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={formData.publishToTwitter || false}
                            onChange={(e) => setFormData({ ...formData, publishToTwitter: e.target.checked })}
                            className="h-4 w-4 text-blue-400 focus:ring-blue-400 border-gray-300 rounded mr-2"
                          />
                          <Twitter className="w-4 h-4 mr-2 text-blue-400" />
                          <span className="text-sm text-gray-900">X (Twitter)</span>
                        </label>
                      )}
                      {configuration?.threads_api_enabled && (
                        <label className="flex items-center p-2 border border-gray-300 rounded cursor-pointer hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={formData.publishToThreads || false}
                            onChange={(e) => setFormData({ ...formData, publishToThreads: e.target.checked })}
                            className="h-4 w-4 text-gray-800 focus:ring-gray-800 border-gray-300 rounded mr-2"
                          />
                          <span className="text-sm text-gray-900 ml-6">Threads</span>
                        </label>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingPost ? 'Atualizar' : 'Criar'} Post
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
            Gestão de Blog
          </h1>
          {activeTab === 'posts' ? (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Post
            </Button>
          ) : activeTab === 'categories' ? (
            <Button onClick={() => setShowCategoryForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Categoria
            </Button>
          ) : (
            <Button onClick={() => setShowTagForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Tag
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('posts')}
              className={`${
                activeTab === 'posts'
                  ? 'border-[#3bb664] text-[#3bb664]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              <FileText className="w-4 h-4" />
              Posts
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`${
                activeTab === 'categories'
                  ? 'border-[#3bb664] text-[#3bb664]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              <Folder className="w-4 h-4" />
              Categorias
            </button>
            <button
              onClick={() => setActiveTab('tags')}
              className={`${
                activeTab === 'tags'
                  ? 'border-[#3bb664] text-[#3bb664]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              <TagIcon className="w-4 h-4" />
              Tags
            </button>
          </nav>
        </div>

        {/* Category Form */}
        {showCategoryForm && (
          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle>{editingCategory ? 'Editar Categoria' : 'Nova Categoria'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCategorySubmit} className="space-y-4">
                  <Input
                    label="Nome *"
                    value={categoryFormData.name}
                    onChange={(value) => setCategoryFormData({ ...categoryFormData, name: value })}
                    required
                  />
                  <Textarea
                    label="Descrição"
                    value={categoryFormData.description || ''}
                    onChange={(value) => setCategoryFormData({ ...categoryFormData, description: value })}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cor
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="color"
                        value={categoryFormData.color}
                        onChange={(e) => setCategoryFormData({ ...categoryFormData, color: e.target.value })}
                        className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                      />
                      <Input
                        value={categoryFormData.color}
                        onChange={(value) => setCategoryFormData({ ...categoryFormData, color: value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="categoryIsActive"
                      checked={categoryFormData.isActive}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, isActive: e.target.checked })}
                      className="h-4 w-4 text-[#3bb664] focus:ring-[#3bb664] border-gray-300 rounded"
                    />
                    <label htmlFor="categoryIsActive" className="ml-2 block text-sm text-gray-900">
                      Categoria ativa
                    </label>
                  </div>
                  <div className="flex justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={resetCategoryForm}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {editingCategory ? 'Atualizar' : 'Criar'} Categoria
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Categories List */}
        {activeTab === 'categories' && (
          <>
            {loadingCategories ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3bb664]"></div>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12">
                <TagIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma categoria criada
                </h3>
                <p className="text-gray-500 mb-4">
                  Comece criando sua primeira categoria!
                </p>
                <Button onClick={() => setShowCategoryForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Categoria
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <Card key={category.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: category.color || '#3bb664' }}
                            />
                            <CardTitle className="text-lg">{category.name}</CardTitle>
                          </div>
                          {category.description && (
                            <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                          )}
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              category.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {category.isActive ? 'Ativa' : 'Inativa'}
                            </span>
                            {category._count && (
                              <span className="text-xs text-gray-500">
                                {category._count.posts} {category._count.posts === 1 ? 'post' : 'posts'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Tag Form */}
        {showTagForm && (
          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle>{editingTag ? 'Editar Tag' : 'Nova Tag'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTagSubmit} className="space-y-4">
                  <Input
                    label="Nome *"
                    value={tagFormData.name}
                    onChange={(value) => setTagFormData({ ...tagFormData, name: value })}
                    required
                  />
                  <Textarea
                    label="Descrição"
                    value={tagFormData.description || ''}
                    onChange={(value) => setTagFormData({ ...tagFormData, description: value })}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cor
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="color"
                        value={tagFormData.color}
                        onChange={(e) => setTagFormData({ ...tagFormData, color: e.target.value })}
                        className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                      />
                      <Input
                        value={tagFormData.color}
                        onChange={(value) => setTagFormData({ ...tagFormData, color: value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="tagIsActive"
                      checked={tagFormData.isActive}
                      onChange={(e) => setTagFormData({ ...tagFormData, isActive: e.target.checked })}
                      className="h-4 w-4 text-[#6b7280] focus:ring-[#6b7280] border-gray-300 rounded"
                    />
                    <label htmlFor="tagIsActive" className="ml-2 block text-sm text-gray-900">
                      Tag ativa
                    </label>
                  </div>
                  <div className="flex justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={resetTagForm}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {editingTag ? 'Atualizar' : 'Criar'} Tag
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tags List */}
        {activeTab === 'tags' && (
          <>
            {loadingTags ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3bb664]"></div>
              </div>
            ) : tags.length === 0 ? (
              <div className="text-center py-12">
                <TagIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma tag criada
                </h3>
                <p className="text-gray-500 mb-4">
                  Comece criando sua primeira tag!
                </p>
                <Button onClick={() => setShowTagForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Tag
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tags.map((tag) => (
                  <Card key={tag.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: tag.color || '#6b7280' }}
                            />
                            <CardTitle className="text-lg">{tag.name}</CardTitle>
                          </div>
                          {tag.description && (
                            <p className="text-sm text-gray-600 mb-2">{tag.description}</p>
                          )}
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              tag.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {tag.isActive ? 'Ativa' : 'Inativa'}
                            </span>
                            {tag._count && (
                              <span className="text-xs text-gray-500">
                                {tag._count.posts} {tag._count.posts === 1 ? 'post' : 'posts'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditTag(tag)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTag(tag.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Posts List */}
        {activeTab === 'posts' && (
          <>

        {/* Filtros */}
        {activeTab === 'posts' && (
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Buscar posts..."
                value={searchTerm}
                onChange={(value) => setSearchTerm(value)}
                className="pl-10"
              />
            </div>
            <div className="relative sm:w-48">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10 pointer-events-none" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full pl-10 pr-8 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3bb664] focus:border-[#3bb664] bg-white text-gray-900 transition-colors appearance-none cursor-pointer"
              >
                <option value="all">Todos</option>
                <option value="published">Publicados</option>
                <option value="draft">Rascunhos</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
            {categories.length > 0 && (
              <div className="relative sm:w-48">
                <TagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10 pointer-events-none" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full pl-10 pr-8 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3bb664] focus:border-[#3bb664] bg-white text-gray-900 transition-colors appearance-none cursor-pointer"
                >
                  <option value="all">Todas as categorias</option>
                  {categories.filter(c => c.isActive).map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            )}
          </div>
        )}

        {/* Mensagem de Erro */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">
              <strong>Erro:</strong> {error}
            </p>
          </div>
        )}

        {/* Lista de Posts */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3bb664]"></div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filterStatus !== 'all' ? 'Nenhum post encontrado' : 'Nenhum post criado'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterStatus !== 'all' 
                ? 'Tente ajustar seus filtros de busca'
                : 'Comece criando seu primeiro post!'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Post
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-all duration-300 ease-in-out hover:scale-105 flex flex-col relative overflow-hidden !p-6 !pb-3">
                {/* Background image com transparência diagonal */}
                {post.featuredImageUrl && (
                  <div 
                    className="absolute bottom-0 right-0 w-3/4 h-3/4 opacity-10 pointer-events-none"
                    style={{
                      backgroundImage: `url(${post.featuredImageUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      clipPath: 'polygon(100% 0%, 0% 100%, 100% 100%)',
                      transform: 'scale(1.2)',
                      transformOrigin: 'bottom right'
                    }}
                  />
                )}
                <CardHeader className="pb-3 relative z-10">
                  {/* Título e Status */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <CardTitle className="text-lg line-clamp-2 flex-1">{post.title}</CardTitle>
                    <span 
                      className={`px-2 py-1 text-xs rounded-full whitespace-nowrap flex-shrink-0 ${
                        post.isPublished 
                          ? 'text-white'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                      style={post.isPublished ? { backgroundColor: '#3bb664' } : {}}
                    >
                      {post.isPublished ? 'Publicado' : 'Rascunho'}
                    </span>
                  </div>
                  
                  {/* Categorias e Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {post.categories && post.categories.length > 0 && (
                      <>
                        {post.categories.map((postCategory) => {
                          const category = categories.find(c => c.id === postCategory.category_id || c.id === postCategory.category?.id);
                          if (!category) return null;
                          return (
                            <span
                              key={postCategory.id}
                              className="px-2 py-1 text-xs rounded-md text-white font-medium border border-white/30 flex items-center gap-1"
                              style={{ backgroundColor: category.color || '#3bb664' }}
                            >
                              <Folder className="w-3 h-3" />
                              {category.name}
                            </span>
                          );
                        })}
                      </>
                    )}
                    {post.tags && post.tags.length > 0 && (
                      <>
                        {post.tags.map((postTag) => {
                          const tag = tags.find(t => t.id === postTag.tag_id || t.id === postTag.tag?.id);
                          if (!tag) return null;
                          return (
                            <span
                              key={postTag.id}
                              className="px-2 py-1 text-xs rounded-md text-white border border-white/30 flex items-center gap-1"
                              style={{ backgroundColor: tag.color || '#6b7280' }}
                            >
                              <TagIcon className="w-3 h-3" />
                              {tag.name}
                            </span>
                          );
                        })}
                      </>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col relative z-10">
                  {/* Descrição */}
                  {post.excerpt && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-3 flex-1">
                      {post.excerpt}
                    </p>
                  )}
                  
                  {/* Autor e Data */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-6 mb-4">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{post.author}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{formatDate(post.createdAt || post.created_at)}</span>
                    </div>
                  </div>
                  
                  {/* Linha tracejada */}
                  <hr className="border-dashed border-gray-300 mb-3" />
                  
                  {/* Botões de ação */}
                  <div className="flex space-x-2 justify-end">
                    <a
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                      title="Ver"
                    >
                      <Eye className="h-4 w-4" />
                    </a>
                    <button
                      onClick={() => handleEdit(post)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
};