import React, { useEffect, useState } from 'react';
import { JobApplication } from '../../types';
import { apiService } from '../../services/api';
import { Eye, Trash2, Mail, Phone, Calendar, FileText, Linkedin } from 'lucide-react';
import Swal from 'sweetalert2';

export default function JobApplicationsAdmin() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<JobApplication | null>(null);
  const [isClosingDetails, setIsClosingDetails] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const response = await apiService.getJobApplications();
      setApplications(response.applications || []);
    } catch (error) {
      console.error('Erro ao carregar candidaturas:', error);
      Swal.fire('Erro', 'Erro ao carregar candidaturas. Tente novamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | string) => {
    try {
      const d = date instanceof Date ? date : new Date(date);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Data inválida';
    }
  };

  const handleView = async (application: JobApplication) => {
    if (selected) {
      setIsClosingDetails(true);
      setTimeout(() => {
        setSelected(null);
        setIsClosingDetails(false);
        openDetails(application);
      }, 200);
    } else {
      openDetails(application);
    }
  };

  const openDetails = async (application: JobApplication) => {
    setSelected(application);
    if (!application.isRead) {
      try {
        await apiService.markJobApplicationAsRead(application.id);
        setApplications((prev) =>
          prev.map((a) => (a.id === application.id ? { ...a, isRead: true } : a)),
        );
        setSelected((prev) => (prev ? { ...prev, isRead: true } : prev));
      } catch (error) {
        console.error('Erro ao marcar candidatura como lida:', error);
      }
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
      cancelButtonText: 'Cancelar',
    });

    if (!result.isConfirmed) return;

    try {
      await apiService.deleteJobApplication(id);
      setApplications((prev) => prev.filter((a) => a.id !== id));
      if (selected?.id === id) {
        setSelected(null);
      }
      Swal.fire('Excluído!', 'A candidatura foi excluída.', 'success');
    } catch (error) {
      console.error('Erro ao excluir candidatura:', error);
      Swal.fire('Erro', 'Erro ao excluir candidatura. Tente novamente.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3bb664]"></div>
      </div>
    );
  }

  const unreadCount = applications.filter((a) => !a.isRead).length;

  return (
    <div className="grid lg:grid-cols-[2fr,1.2fr] gap-6">
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Trabalhe Conosco</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {unreadCount} candidatura(s) não lida(s)
              </p>
            )}
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            Nenhuma candidatura recebida ainda.
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Candidato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Posição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Data
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.map((app) => (
                  <tr key={app.id} className={app.isRead ? '' : 'bg-green-50'}>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{app.name}</span>
                        <span className="text-xs text-gray-500">{app.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">
                        {app.position || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {formatDate(app.createdAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleView(app)}
                        className="inline-flex items-center px-2 py-1 text-green-600 hover:bg-green-50 rounded"
                        title="Visualizar"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </button>
                      <button
                        onClick={() => handleDelete(app.id)}
                        className="inline-flex items-center px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detalhes */}
      <div className="space-y-4">
        {selected ? (
          <div
            className={`bg-white rounded-lg shadow border border-gray-200 p-6 transform transition-all duration-200 ${
              isClosingDetails ? 'opacity-0 translate-x-2' : 'opacity-100 translate-x-0'
            }`}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Detalhes da Candidatura
            </h2>

            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-center text-gray-900">
                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                <span>{selected.email}</span>
              </div>
              {selected.phone && (
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{selected.phone}</span>
                </div>
              )}
              {selected.position && (
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-gray-400" />
                  <span>Posição de interesse: {selected.position}</span>
                </div>
              )}
              {selected.linkedinUrl && (
                <div className="flex items-center">
                  <Linkedin className="w-4 h-4 mr-2 text-blue-500" />
                  <a
                    href={selected.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Perfil no LinkedIn
                  </a>
                </div>
              )}
              <div className="flex items-center text-gray-500">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Enviado em {formatDate(selected.createdAt)}</span>
              </div>
              {selected.cvUrl && (
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-green-600" />
                  <a
                    href={selected.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-700 hover:underline"
                  >
                    Baixar currículo
                  </a>
                </div>
              )}
            </div>

            {selected.message && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Mensagem / Apresentação
                </h3>
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {selected.message}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow border border-dashed border-gray-300 p-6 text-sm text-gray-500 flex items-center justify-center h-full">
            Selecione uma candidatura na lista para ver os detalhes.
          </div>
        )}
      </div>
    </div>
  );
}




