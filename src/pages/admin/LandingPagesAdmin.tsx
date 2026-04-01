import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, FileText, Settings, GripVertical, ExternalLink } from 'lucide-react';
import { apiService } from '../../services/api';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { LandingPage, FormField, FormSubmission } from '../../types';
import { LandingPageModal } from '../../components/admin/LandingPageModal';

export default function LandingPagesAdmin() {
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPage, setEditingPage] = useState<LandingPage | null>(null);
  const [activeTab, setActiveTab] = useState<'pages' | 'submissions'>('pages');
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [selectedLandingPage, setSelectedLandingPage] = useState<string>('all');

  useEffect(() => {
    loadLandingPages();
  }, []);

  useEffect(() => {
    if (activeTab === 'submissions') {
      loadSubmissions();
    }
  }, [activeTab, selectedLandingPage]);

  const loadSubmissions = async () => {
    try {
      setLoadingSubmissions(true);
      const landingPageId = selectedLandingPage === 'all' ? undefined : selectedLandingPage;
      const response = await apiService.getFormSubmissions(landingPageId);
      setSubmissions(response.submissions || []);
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast.error('Erro ao carregar submissões');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const loadLandingPages = async () => {
    try {
      setLoading(true);
      const response = await apiService.getLandingPages();
      setLandingPages(response.landingPages || []);
    } catch (error) {
      console.error('Error loading landing pages:', error);
      toast.error('Erro ao carregar landing pages');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
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
        await apiService.deleteLandingPage(id);
        toast.success('Landing page excluída com sucesso!');
        loadLandingPages();
      } catch (error) {
        console.error('Error deleting landing page:', error);
        toast.error('Erro ao excluir landing page');
      }
    }
  };

  const handleEdit = (page: LandingPage) => {
    setEditingPage(page);
    setShowModal(true);
  };

  const handleNew = () => {
    setEditingPage(null);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Landing Pages</h1>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-4 py-2 bg-[#3bb664] text-white rounded-lg hover:bg-[#2d9550] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nova Landing Page
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('pages')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'pages'
                  ? 'border-b-2 border-[#3bb664] text-[#3bb664]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Landing Pages
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'submissions'
                  ? 'border-b-2 border-[#3bb664] text-[#3bb664]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Submissões
            </button>
          </nav>
        </div>

        {activeTab === 'pages' && (
          <div className="p-6">
            {landingPages.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                Nenhuma landing page criada ainda.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Título
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Slug
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Campos
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {landingPages.map((page) => (
                      <tr key={page.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{page.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {page.is_published && page.is_active ? (
                              <>
                                <a
                                  href={`/${page.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-[#3bb664] hover:text-[#2d9550] hover:underline flex items-center gap-1"
                                >
                                  /{page.slug}
                                </a>
                                <a
                                  href={`/${page.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#3bb664] hover:text-[#2d9550] p-1"
                                  title="Abrir em nova aba"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              </>
                            ) : (
                              <div className="text-sm text-gray-400">/{page.slug}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              page.is_published && page.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {page.is_published && page.is_active ? 'Publicada' : 'Rascunho'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {page.form_fields?.length || 0} campos
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(page)}
                              className="text-blue-600 hover:text-blue-900 p-2"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(page.id)}
                              className="text-red-600 hover:text-red-900 p-2"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'submissions' && (
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Submissões de Formulários</h2>
              <select
                value={selectedLandingPage}
                onChange={(e) => setSelectedLandingPage(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3bb664] focus:border-transparent"
              >
                <option value="all">Todas as Landing Pages</option>
                {landingPages.map((page) => (
                  <option key={page.id} value={page.id}>
                    {page.title}
                  </option>
                ))}
              </select>
            </div>

            {loadingSubmissions ? (
              <div className="text-center py-12 text-gray-500">Carregando...</div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                Nenhuma submissão encontrada
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Landing Page
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dados
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IP
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {submissions.map((submission) => {
                      const formData = typeof submission.form_data === 'string' 
                        ? JSON.parse(submission.form_data) 
                        : submission.form_data;
                      const landingPage = landingPages.find(p => p.id === submission.landing_page_id);
                      
                      return (
                        <tr key={submission.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {landingPage?.title || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500 max-w-md">
                              {Object.entries(formData || {}).map(([key, value]) => (
                                <div key={key} className="mb-1">
                                  <span className="font-medium">{key}:</span>{' '}
                                  <span>{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {submission.ip_address || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(submission.created_at).toLocaleString('pt-BR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={async () => {
                                const result = await Swal.fire({
                                  title: 'Detalhes da Submissão',
                                  html: `
                                    <div class="text-left">
                                      <p><strong>Landing Page:</strong> ${landingPage?.title || 'N/A'}</p>
                                      <p><strong>Data:</strong> ${new Date(submission.created_at).toLocaleString('pt-BR')}</p>
                                      <p><strong>IP:</strong> ${submission.ip_address || 'N/A'}</p>
                                      <hr class="my-3">
                                      <p><strong>Dados do Formulário:</strong></p>
                                      <pre class="text-left mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-96">${JSON.stringify(formData, null, 2)}</pre>
                                    </div>
                                  `,
                                  width: '600px',
                                  confirmButtonText: 'Fechar'
                                });
                              }}
                              className="text-[#3bb664] hover:text-[#2d9550] mr-4"
                            >
                              <Eye className="w-4 h-4 inline" />
                            </button>
                            <button
                              onClick={async () => {
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
                                    await apiService.deleteFormSubmission(submission.id);
                                    toast.success('Submissão excluída com sucesso!');
                                    loadSubmissions();
                                  } catch (error) {
                                    console.error('Error deleting submission:', error);
                                    toast.error('Erro ao excluir submissão');
                                  }
                                }
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4 inline" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <LandingPageModal
          page={editingPage}
          onClose={() => {
            setShowModal(false);
            setEditingPage(null);
          }}
          onSave={() => {
            setShowModal(false);
            setEditingPage(null);
            loadLandingPages();
          }}
        />
      )}
    </div>
  );
}


