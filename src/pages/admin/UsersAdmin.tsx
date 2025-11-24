import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, User as UserIcon, Mail, Calendar, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { apiService } from '../../services/api';
import { toast } from 'sonner';
import { User } from '../../types';

interface UserFormData {
  email: string;
  name: string;
  password: string;
}

const UsersAdmin: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    name: '',
    password: '',
  });

  // Carregar usuários ao montar o componente
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUsers();
      console.log('📋 Resposta getUsers:', response);
      setUsers(response.users || []);
    } catch (error: any) {
      console.error('❌ Erro ao carregar usuários:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Erro ao carregar usuários';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.name || (!editingUser && !formData.password)) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    try {
      if (editingUser) {
        // Atualizar usuário existente
        const updateData: any = {
          email: formData.email,
          name: formData.name,
        };
        
        if (formData.password) {
          updateData.password = formData.password;
        }

        await apiService.updateUser(editingUser.id, updateData);
        
        toast.success('Usuário atualizado com sucesso!');
      } else {
        // Criar novo usuário
        await apiService.createUser(formData);
        
        toast.success('Usuário criado com sucesso!');
      }
      
      resetForm();
      loadUsers();
    } catch (error: any) {
      console.error('Erro ao salvar usuário:', error);
      toast.error(error.message || 'Erro ao salvar usuário');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      name: user.name,
      password: '', // Não preenchemos a senha por segurança
    });
    setShowForm(true);
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('Tem certeza que deseja remover este usuário? Esta ação não pode ser desfeita.')) {
      try {
        await apiService.deleteUser(userId);
        
        toast.success('Usuário removido com sucesso!');
        loadUsers();
      } catch (error: any) {
        console.error('Erro ao remover usuário:', error);
        toast.error(error.message || 'Erro ao remover usuário');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      name: '',
      password: '',
    });
    setEditingUser(null);
    setShowForm(false);
  };

  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return 'Data não disponível';
    try {
      const date = dateString instanceof Date ? dateString : new Date(dateString);
      if (isNaN(date.getTime())) return 'Data inválida';
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3bb664] mb-4"></div>
          <div className="text-gray-500">Carregando usuários...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Usuários</h1>
          <p className="text-gray-600 mt-1">Adicione e gerencie os administradores do sistema</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center">
          <Plus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      {/* Formulário de Usuário */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserIcon className="mr-2 h-5 w-5" />
              {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Nome Completo"
                type="text"
                placeholder="João Silva"
                value={formData.name}
                onChange={(value) => setFormData({ ...formData, name: value })}
                required
              />
              
              <Input
                label="Email"
                type="email"
                placeholder="joao@empresa.com"
                value={formData.email}
                onChange={(value) => setFormData({ ...formData, email: value })}
                required
              />
              
              <Input
                label={editingUser ? 'Nova Senha (deixe vazio para manter atual)' : 'Senha'}
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(value) => setFormData({ ...formData, password: value })}
                required={!editingUser}
              />
              
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingUser ? 'Atualizar' : 'Criar'} Usuário
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Administradores ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8">
              <UserIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">Nenhum usuário encontrado</p>
              <p className="text-gray-500 text-sm mt-1">Clique em "Novo Usuário" para adicionar o primeiro administrador</p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#3bb66420' }}>
                      <UserIcon className="h-5 w-5" style={{ color: '#3bb664' }} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-600 flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {user.email}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        Criado em {formatDate(user.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(user)}
                      className="flex items-center"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(user.id)}
                      className="flex items-center text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Remover
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersAdmin;