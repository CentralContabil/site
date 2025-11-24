import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Image,
  FileText, 
  Users, 
  MessageSquare,
  UserCheck
} from 'lucide-react';
import { apiService } from '../../services/api';

interface DashboardStats {
  slides: number;
  services: number;
  testimonials: number;
  messages: number;
  users: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    slides: 0,
    services: 0,
    testimonials: 0,
    messages: 0,
    users: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [slidesRes, servicesRes, testimonialsRes, usersRes, messagesRes] = await Promise.all([
        apiService.getAllSlides(),
        apiService.getAllServices(),
        apiService.getAllTestimonials(),
        apiService.getUsers(),
        apiService.getTotalContactMessagesCount()
      ]);

      setStats({
        slides: slidesRes.slides?.length || 0,
        services: servicesRes.services?.length || 0,
        testimonials: testimonialsRes.testimonials?.length || 0,
        messages: messagesRes.count || 0,
        users: usersRes.users?.length || 0
      });
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

      {/* Slides Card */}
      <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center">
          <div className="p-3 bg-blue-100 rounded-full">
            <Image className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Slides</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.slides}</p>
          </div>
        </div>
        <Link
          to="/admin/slides"
          className="mt-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Gerenciar slides →
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
  );
}