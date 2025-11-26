import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Users, 
  MessageSquare,
  UserCheck
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { apiService } from '../../services/api';

interface DashboardStats {
  services: number;
  testimonials: number;
  messages: number;
  users: number;
}

interface MonthlyMessageData {
  month: string;
  count: number;
  fullMonth: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    services: 0,
    testimonials: 0,
    messages: 0,
    users: 0
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyMessageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
    loadMonthlyData();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Carregando estatísticas do dashboard...');
      
      const [servicesRes, testimonialsRes, usersRes, messagesRes] = await Promise.all([
        apiService.getAllServices(),
        apiService.getAllTestimonials(),
        apiService.getUsers(),
        apiService.getTotalContactMessagesCount()
      ]);

      console.log('✅ Dados recebidos:', {
        services: servicesRes,
        testimonials: testimonialsRes,
        users: usersRes,
        messages: messagesRes
      });

      setStats({
        services: servicesRes.services?.length || 0,
        testimonials: testimonialsRes.testimonials?.length || 0,
        messages: messagesRes.count || 0,
        users: usersRes.users?.length || 0
      });
    } catch (error: any) {
      console.error('❌ Erro ao carregar estatísticas:', error);
      setError(error?.message || 'Erro ao carregar dados do dashboard');
      // Mesmo com erro, definir valores padrão para não quebrar a UI
      setStats({
        services: 0,
        testimonials: 0,
        messages: 0,
        users: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMonthlyData = async () => {
    try {
      setChartLoading(true);
      console.log('🔄 Carregando dados mensais...');
      const response = await apiService.getContactMessagesByMonth();
      console.log('✅ Dados mensais recebidos:', response);
      setMonthlyData(response.data || []);
    } catch (error: any) {
      console.error('❌ Erro ao carregar dados mensais:', error);
      setMonthlyData([]);
    } finally {
      setChartLoading(false);
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
    <div>
    {error && (
      <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-semibold">Erro ao carregar dados</p>
        <p className="text-sm">{error}</p>
        <button
          onClick={() => {
            setError(null);
            loadStats();
            loadMonthlyData();
          }}
          className="mt-2 text-sm underline hover:no-underline"
        >
          Tentar novamente
        </button>
      </div>
    )}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Users Card */}
      <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center">
          <div className="p-3 rounded-full" style={{ backgroundColor: '#3bb66420' }}>
            <UserCheck className="h-6 w-6" style={{ color: '#3bb664' }} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Usuários</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.users}</p>
          </div>
        </div>
        <Link
          to="/admin/users"
          className="mt-4 inline-flex items-center text-sm font-medium transition-colors"
          style={{ color: '#3bb664' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#2d9a4f'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#3bb664'}
        >
          Gerenciar usuários →
        </Link>
      </div>

      {/* Services Card */}
      <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center">
          <div className="p-3 rounded-full" style={{ backgroundColor: '#3bb66420' }}>
            <FileText className="h-6 w-6" style={{ color: '#3bb664' }} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Serviços</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.services}</p>
          </div>
        </div>
        <Link
          to="/admin/services"
          className="mt-4 inline-flex items-center text-sm font-medium transition-colors"
          style={{ color: '#3bb664' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#2d9a4f'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#3bb664'}
        >
          Gerenciar serviços →
        </Link>
      </div>

      {/* Testimonials Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 bg-purple-100 rounded-full">
            <Users className="h-6 w-6 text-purple-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Depoimentos</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.testimonials}</p>
          </div>
        </div>
        <Link
          to="/admin/testimonials"
          className="mt-4 inline-flex items-center text-sm text-purple-600 hover:text-purple-800"
        >
          Gerenciar depoimentos →
        </Link>
      </div>

      {/* Messages Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 bg-yellow-100 rounded-full">
            <MessageSquare className="h-6 w-6 text-yellow-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Mensagens</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.messages}</p>
          </div>
        </div>
        <Link
          to="/admin/messages"
          className="mt-4 inline-flex items-center text-sm text-yellow-600 hover:text-yellow-800"
        >
          Ver mensagens →
        </Link>
      </div>
    </div>

    {/* Gráfico de Mensagens */}
    <div className="mt-8 bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Mensagens de Contato - Últimos 12 Meses
      </h2>
      {chartLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3bb664]"></div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="month" 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
              labelStyle={{ color: '#374151', fontWeight: 'bold' }}
            />
            <Line 
              type="monotone" 
              dataKey="count" 
              stroke="#3bb664" 
              strokeWidth={3}
              dot={{ fill: '#3bb664', r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  </div>
  );
}