import React, { useState, useEffect } from 'react';
import { AccessLog } from '../../types';
import { apiService } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Search, CheckCircle, XCircle, Shield, Clock, User, Mail, Globe } from 'lucide-react';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';

export default function AccessLogsAdmin() {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [searchEmail, setSearchEmail] = useState('');
  const [filterSuccess, setFilterSuccess] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  useEffect(() => {
    loadLogs();
    loadStats();
  }, [page, searchEmail, filterSuccess]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: 50,
      };
      
      if (searchEmail) {
        params.email = searchEmail;
      }
      
      if (filterSuccess !== 'all') {
        params.success = filterSuccess === 'true';
      }

      const response = await apiService.getAccessLogs(params);
      setLogs(response.logs || []);
      setPagination(response.pagination);
    } catch (error: any) {
      console.error('Erro ao carregar logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiService.getAccessLogStats();
      setStats(response);
    } catch (error: any) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadLogs();
  };

  return (
    <div>
      <AdminPageHeader
        title="Logs de Acesso"
        subtitle="Visualize todos os acessos ao sistema"
      />

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Acessos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Shield className="w-8 h-8 text-[#3bb664]" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Logins Bem-sucedidos</p>
                  <p className="text-2xl font-bold text-green-600">{stats.successful}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tentativas Falhadas</p>
                  <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Últimos 30 Dias</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.recent}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                label="Buscar por email"
                value={searchEmail}
                onChange={(value) => setSearchEmail(value)}
                placeholder="Digite o email..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
            </div>
            <div className="w-full md:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filterSuccess}
                onChange={(e) => {
                  setFilterSuccess(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3bb664]"
              >
                <option value="all">Todos</option>
                <option value="true">Bem-sucedidos</option>
                <option value="false">Falhados</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-[#3bb664] text-white rounded-lg hover:bg-[#2d9a4f] transition-colors flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Buscar
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Acessos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3bb664]"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Nenhum log de acesso encontrado.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Data/Hora</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Usuário</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Método</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">IP</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {format(new Date(log.created_at), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            {log.name || 'N/A'}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            {log.email}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            log.login_method === '2fa' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {log.login_method === '2fa' ? '2FA' : 'Senha'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-gray-400" />
                            {log.ip_address || 'N/A'}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            log.success
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {log.success ? (
                              <>
                                <CheckCircle className="w-3 h-3" />
                                Sucesso
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3" />
                                Falhou
                              </>
                            )}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginação */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} registros
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={pagination.page === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    <span className="px-4 py-2 text-sm text-gray-600">
                      Página {pagination.page} de {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                      disabled={pagination.page === pagination.totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Próxima
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


