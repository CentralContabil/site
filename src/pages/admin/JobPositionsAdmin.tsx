import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, X, Download, Upload } from 'lucide-react';
import { apiService } from '../../services/api';
import { JobPosition } from '../../types';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/textarea';

export default function JobPositionsAdmin() {
  const [positions, setPositions] = useState<JobPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [editingPosition, setEditingPosition] = useState<JobPosition | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    order: 0,
    isActive: true,
  });
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPositions = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllJobPositions();
      setPositions(response.positions || []);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar áreas de interesse');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  useEffect(() => {
    if (editingPosition && showModal) {
      setFormData({
        name: editingPosition.name || '',
        description: editingPosition.description || '',
        order: editingPosition.order || 0,
        isActive: editingPosition.isActive !== undefined ? editingPosition.isActive : true,
      });
    }
  }, [editingPosition, showModal]);

  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosing(false);
      setEditingPosition(null);
      setFormData({ name: '', description: '', order: 0, isActive: true });
    }, 200);
  };

  const handleOpenModal = (position?: JobPosition) => {
    if (position) {
      setEditingPosition(position);
    } else {
      setEditingPosition(null);
      setFormData({ name: '', description: '', order: 0, isActive: true });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('O nome da área é obrigatório');
      return;
    }

    try {
      if (editingPosition) {
        await apiService.updateJobPosition(editingPosition.id, {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          order: formData.order,
          isActive: formData.isActive,
        });
        toast.success('Área de interesse atualizada com sucesso!');
      } else {
        await apiService.createJobPosition({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          order: formData.order,
          isActive: formData.isActive,
        });
        toast.success('Área de interesse criada com sucesso!');
      }

      handleCloseModal();
      fetchPositions();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar área de interesse');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta área de interesse?')) {
      return;
    }

    try {
      await apiService.deleteJobPosition(id);
      toast.success('Área de interesse removida com sucesso!');
      fetchPositions();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao remover área de interesse');
    }
  };

  const handleExport = () => {
    try {
      if (positions.length === 0) {
        toast.warning('Não há áreas de interesse para exportar');
        return;
      }

      const dataToExport = positions.map((pos) => ({
        name: pos.name,
        description: pos.description || '',
        order: pos.order,
        isActive: pos.isActive,
      }));

      // Garantir que é um array válido
      if (!Array.isArray(dataToExport) || dataToExport.length === 0) {
        toast.error('Erro ao preparar dados para exportação');
        return;
      }

      const dataStr = JSON.stringify(dataToExport, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `areas-de-interesse-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Exportadas ${dataToExport.length} área(s) de interesse!`);
    } catch (error: any) {
      console.error('Erro ao exportar:', error);
      toast.error('Erro ao exportar dados: ' + error.message);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      toast.error('Por favor, selecione um arquivo JSON válido');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setImporting(true);
    try {
      const text = await file.text();
      
      // Verificar se o arquivo está vazio
      if (!text || text.trim().length === 0) {
        toast.error('O arquivo está vazio');
        setImporting(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError: any) {
        console.error('Erro ao fazer parse do JSON:', parseError);
        toast.error(`Erro ao ler o arquivo JSON: ${parseError.message || 'Formato inválido'}`);
        setImporting(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      // Validar se é um array
      if (!Array.isArray(data)) {
        console.error('Dados não são um array:', typeof data, data);
        toast.error('O arquivo deve conter um array de áreas de interesse. Formato esperado: [{ "name": "...", ... }]');
        setImporting(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      // Validar se o array não está vazio
      if (data.length === 0) {
        toast.error('O arquivo está vazio. Adicione pelo menos uma área de interesse.');
        setImporting(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      let successCount = 0;
      let errorCount = 0;
      let duplicateCount = 0;

      // Verificar nomes existentes para evitar duplicatas
      const existingNames = new Set(positions.map(p => p.name.toLowerCase().trim()));

      for (const item of data) {
        try {
          if (!item.name || typeof item.name !== 'string') {
            errorCount++;
            continue;
          }

          const normalizedName = item.name.trim().toLowerCase();
          if (existingNames.has(normalizedName)) {
            duplicateCount++;
            continue;
          }

          await apiService.createJobPosition({
            name: item.name.trim(),
            description: item.description?.trim() || undefined,
            order: typeof item.order === 'number' ? item.order : 0,
            isActive: item.isActive !== undefined ? item.isActive : true,
          });
          
          existingNames.add(normalizedName);
          successCount++;
        } catch (error: any) {
          console.error('Erro ao importar item:', item, error);
          // Se o erro for de duplicata, contar como duplicata
          if (error.message?.includes('já existe') || error.message?.includes('duplicate')) {
            duplicateCount++;
          } else {
            errorCount++;
          }
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} área(s) importada(s) com sucesso!`);
        fetchPositions();
      }

      if (duplicateCount > 0) {
        toast.warning(`${duplicateCount} área(s) já existem e foram ignoradas`);
      }

      if (errorCount > 0) {
        toast.error(`${errorCount} área(s) não puderam ser importadas`);
      }

      if (successCount === 0 && errorCount === 0 && duplicateCount > 0) {
        toast.warning('Todas as áreas já existem no sistema');
      } else if (successCount === 0 && errorCount > 0) {
        toast.error('Nenhuma área foi importada. Verifique o formato do arquivo e tente novamente.');
      }
    } catch (error: any) {
      console.error('Erro ao importar arquivo:', error);
      toast.error(`Erro ao importar arquivo: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3bb664]"></div>
      </div>
    );
  }

  const activePositions = positions.filter((p) => p.isActive);
  const inactivePositions = positions.filter((p) => !p.isActive);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Áreas de Interesse / Posições</h1>
          <p className="text-sm text-gray-600 mt-1">
            Gerencie as áreas de interesse disponíveis para candidaturas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleExport}
            variant="outline"
            className="flex items-center gap-2"
            disabled={positions.length === 0}
          >
            <Download className="w-4 h-4" />
            Exportar
          </Button>
          <Button
            onClick={handleImportClick}
            variant="outline"
            className="flex items-center gap-2"
            disabled={importing}
          >
            <Upload className="w-4 h-4" />
            {importing ? 'Importando...' : 'Importar'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nova Área
          </Button>
        </div>
      </div>

      {/* Áreas Ativas */}
      {activePositions.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Áreas Ativas</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ordem
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activePositions.map((position) => (
                  <tr key={position.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{position.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {position.description || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{position.order}</div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleOpenModal(position)}
                        className="inline-flex items-center px-2 py-1 text-green-600 hover:bg-green-50 rounded"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(position.id)}
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
        </div>
      )}

      {/* Áreas Inativas */}
      {inactivePositions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Áreas Inativas</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ordem
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inactivePositions.map((position) => (
                  <tr key={position.id} className="opacity-60">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{position.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {position.description || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{position.order}</div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleOpenModal(position)}
                        className="inline-flex items-center px-2 py-1 text-green-600 hover:bg-green-50 rounded"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(position.id)}
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
        </div>
      )}

      {positions.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          Nenhuma área de interesse cadastrada ainda.
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${
            isClosing ? 'opacity-0' : 'opacity-100'
          }`}
          onClick={handleCloseModal}
        >
          <div
            className={`bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-200 ${
              isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingPosition ? 'Editar Área de Interesse' : 'Nova Área de Interesse'}
              </h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Área <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(value) => setFormData({ ...formData, name: value })}
                  placeholder="Ex: Contador, Analista Fiscal, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição (opcional)
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição da área de interesse..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ordem
                  </label>
                  <Input
                    type="number"
                    value={formData.order.toString()}
                    onChange={(value) => setFormData({ ...formData, order: parseInt(value) || 0 })}
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.isActive ? 'active' : 'inactive'}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.value === 'active' })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3bb664] focus:border-[#3bb664] transition-colors text-gray-900"
                  >
                    <option value="active">Ativa</option>
                    <option value="inactive">Inativa</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingPosition ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

