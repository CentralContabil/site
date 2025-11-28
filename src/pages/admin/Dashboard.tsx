import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Users, 
  MessageSquare,
  UserCheck,
  TrendingUp
} from 'lucide-react';
import { apiService } from '../../services/api';
import { format, subMonths, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface DashboardStats {
  services: number;
  testimonials: number;
  messages: number;
  users: number;
}

interface MessageChartData {
  date: string;
  count: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    services: 0,
    testimonials: 0,
    messages: 0,
    users: 0
  });
  const [messageChartData, setMessageChartData] = useState<MessageChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [servicesRes, testimonialsRes, usersRes, messagesRes, messagesListRes] = await Promise.all([
        apiService.getAllServices(),
        apiService.getAllTestimonials(),
        apiService.getUsers(),
        apiService.getTotalContactMessagesCount(),
        apiService.getContactMessages()
      ]);

      setStats({
        services: servicesRes.services?.length || 0,
        testimonials: testimonialsRes.testimonials?.length || 0,
        messages: messagesRes.count || 0,
        users: usersRes.users?.length || 0
      });

      // Processar dados para o gráfico (últimos 12 meses)
      const messages = messagesListRes.messages || [];
      const last12Months = Array.from({ length: 12 }, (_, i) => {
        const date = startOfMonth(subMonths(new Date(), 11 - i));
        return {
          date: format(date, 'MMM/yyyy', { locale: ptBR }),
          dateKey: format(date, 'yyyy-MM'),
          count: 0
        };
      });

      messages.forEach((msg: any) => {
        const msgDate = msg.createdAt || msg.created_at;
        if (msgDate) {
          const date = new Date(msgDate);
          const dateKey = format(startOfMonth(date), 'yyyy-MM');
          const monthData = last12Months.find(d => d.dateKey === dateKey);
          if (monthData) {
            monthData.count++;
          }
        }
      });

      setMessageChartData(last12Months.map(d => ({ date: d.date, count: d.count })));
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
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

      {/* Messages Chart */}
      <div className="col-span-full bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Mensagens Recebidas</h3>
            <p className="text-sm text-gray-500 mt-1">Últimos 12 meses</p>
          </div>
          <Link
            to="/admin/messages"
            className="text-sm font-medium transition-colors hover:underline"
            style={{ color: '#3bb664' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#2d9a4f'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#3bb664'}
          >
            Ver todas →
          </Link>
        </div>
        
        {messageChartData.length > 0 ? (
          <div className="w-full">
            {/* Estatísticas rápidas */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {messageChartData.reduce((sum, d) => sum + d.count, 0)}
                    </p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-gray-400" />
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Média Mensal</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {Math.round(messageChartData.reduce((sum, d) => sum + d.count, 0) / 12)}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-gray-400" />
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Mês Atual</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {messageChartData[messageChartData.length - 1]?.count || 0}
                    </p>
                  </div>
                  <div className="h-8 w-8 flex items-center justify-center rounded-full bg-green-100">
                    <div className="h-2 w-2 rounded-full bg-green-600"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gráfico */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={messageChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    interval={0}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    label={{ value: 'Mensagens', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6b7280' } }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value: number) => [
                      `${value} mensagem${value !== 1 ? 's' : ''}`,
                      'Mensagens'
                    ]}
                    labelStyle={{ fontWeight: 600, color: '#111827' }}
                  />
                  <Bar
                    dataKey="count"
                    radius={[8, 8, 0, 0]}
                    style={{ cursor: 'pointer' }}
                  >
                    {messageChartData.map((entry, index) => {
                      const maxCount = Math.max(...messageChartData.map(d => d.count), 1);
                      const intensity = entry.count / maxCount;
                      const opacity = Math.max(0.6, intensity);
                      const color = entry.count > 0 
                        ? `rgba(59, 182, 100, ${opacity})` 
                        : '#e5e7eb';
                      
                      return (
                        <Cell key={`cell-${index}`} fill={color} />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-gray-500">
            <MessageSquare className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-lg font-medium">Nenhuma mensagem nos últimos 12 meses</p>
            <p className="text-sm mt-2">As mensagens recebidas aparecerão aqui</p>
          </div>
        )}
      </div>
    </div>
  );
}