import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Sliders, 
  Briefcase, 
  MessageSquare, 
  Settings, 
  LogOut,
  Menu,
  X,
  Users,
  FileText,
  Mail,
  Building2,
  Shield
} from 'lucide-react';
import { Toaster } from 'sonner';
import { useConfiguration } from '@/hooks/useConfiguration';

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { configuration } = useConfiguration();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Verificar autenticação ao carregar o layout
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin');
    }
  }, [navigate]);

  const handleLogout = () => {
    console.log('Fazendo logout...');
    localStorage.removeItem('token'); // O token está salvo como 'token', não 'adminToken'
    localStorage.removeItem('adminToken'); // Remover ambos por segurança
    console.log('Token removido, redirecionando para login');
    navigate('/admin');
  };

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/sections', label: 'Seções do Site', icon: Sliders },
    { path: '/admin/services', label: 'Serviços', icon: Briefcase },
    { path: '/admin/testimonials', label: 'Depoimentos', icon: MessageSquare },
    { path: '/admin/blog', label: 'Blog', icon: FileText },
    { path: '/admin/clients', label: 'Clientes', icon: Building2 },
    { path: '/admin/messages', label: 'Mensagens', icon: MessageSquare },
    { path: '/admin/privacy-policy', label: 'Política de Privacidade', icon: Shield },
    { path: '/admin/subscriptions', label: 'Inscrições', icon: Mail },
    { path: '/admin/users', label: 'Usuários', icon: Users },
    { path: '/admin/configuration', label: 'Configurações', icon: Settings },
  ];

  const getPageTitle = () => {
    const currentItem = menuItems.find(item => item.path === location.pathname);
    return currentItem?.label || 'Dashboard';
  };

  useEffect(() => {
    if (!configuration) return;
    const companyName = configuration.companyName || 'Central Contábil';
    const pageTitle = `${getPageTitle()} (Admin)`;
    document.title = `${pageTitle} — ${companyName}`;

    if (configuration.favicon_url) {
      let iconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
      if (!iconLink) {
        iconLink = document.createElement('link');
        iconLink.rel = 'icon';
        document.head.appendChild(iconLink);
      }
      iconLink.href = configuration.favicon_url;
    }
  }, [configuration, location.pathname]);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Toaster position="top-right" />
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out lg:flex-shrink-0`}>
        {/* Sidebar Header */}
        <div className="px-6 h-16 flex items-center" style={{ backgroundColor: '#3bb664' }}>
          <h1 className="text-white text-xl font-semibold">Admin</h1>
        </div>
        
        {/* Navigation */}
        <nav className="mt-6">
          <ul className="space-y-2 px-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    style={isActive ? { backgroundColor: '#3bb664' } : {}}
                    onClick={() => {
                      console.log('Clicando em:', item.path);
                      setSidebarOpen(false);
                    }}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
            <li>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sair
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 h-16">
            <div className="flex items-center">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <h2 className="ml-4 lg:ml-0 text-2xl font-semibold text-gray-900">
                {getPageTitle()}
              </h2>
            </div>
            
            {/* User Avatar */}
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#3bb664' }}>
                <span className="text-white font-medium">A</span>
              </div>
            </div>
          </div>
        </header>

          {/* Page Content */}
          <main className={`flex-1 ${location.pathname === '/admin/sections' ? '' : 'p-6'}`}>
            {location.pathname === '/admin/sections' ? (
              <Outlet />
            ) : (
              <div className="max-w-7xl mx-auto">
                <Outlet />
              </div>
            )}
          </main>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;