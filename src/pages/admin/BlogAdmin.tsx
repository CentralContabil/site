import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BlogPost, CreateBlogPostRequest, UpdateBlogPostRequest } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { RichTextEditor } from '../../components/ui/RichTextEditor';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, Edit, Trash2, Eye, Calendar, User, FileText, Search, Filter, Upload, Image as ImageIcon, Trash2 as DeleteIcon } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '../../services/api';

export const BlogAdmin: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState<CreateBlogPostRequest>({
    title: '',
    excerpt: '',
    content: '',
    featuredImageUrl: '',
    author: 'Admin',
    isPublished: false
  });

  useEffect(() => {
    fetchPosts();
  }, []);

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

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
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
    setFormData({
      title: post.title,
      excerpt: post.excerpt || '',
      content: post.content,
      featuredImageUrl: post.featuredImageUrl || '',
      author: post.author,
      isPublished: post.isPublished
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
      isPublished: false
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
    
    return matchesSearch && matchesFilter;
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
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Post
          </Button>
        </div>

        {/* Filtros */}
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
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-[#3bb664] focus:border-[#3bb664] bg-white"
            >
              <option value="all">Todos</option>
              <option value="published">Publicados</option>
              <option value="draft">Rascunhos</option>
            </select>
          </div>
        </div>

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
              <Card key={post.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                      <div className="flex items-center text-sm text-gray-500 mt-2">
                        <User className="w-4 h-4 mr-1" />
                        <span className="mr-4">{post.author}</span>
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(post.createdAt || post.created_at)}
                      </div>
                    </div>
                    <span 
                      className={`px-2 py-1 text-xs rounded-full ${
                        post.isPublished 
                          ? 'text-white'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                      style={post.isPublished ? { backgroundColor: '#3bb664' } : {}}
                    >
                      {post.isPublished ? 'Publicado' : 'Rascunho'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  {post.excerpt && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="flex space-x-2">
                    <a
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                    </a>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEdit(post)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDelete(post.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};