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
  Shield,
  ChevronLeft,
  ChevronRight,
  Activity,
  Sparkles
} from 'lucide-react';
import { Toaster } from 'sonner';
import { useConfiguration } from '@/hooks/useConfiguration';

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { configuration } = useConfiguration();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Estado para menu retraído (desktop)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('adminSidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });
  
  // Estado para controlar qual tooltip está visível
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

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
    { path: '/admin/login-page', label: 'Página de Login', icon: Sparkles },
    { path: '/admin/sections', label: 'Seções do Site', icon: Sliders },
    { path: '/admin/services', label: 'Serviços', icon: Briefcase },
    { path: '/admin/testimonials', label: 'Depoimentos', icon: MessageSquare },
    { path: '/admin/blog', label: 'Blog', icon: FileText },
    { path: '/admin/clients', label: 'Clientes', icon: Building2 },
    { path: '/admin/messages', label: 'Mensagens', icon: MessageSquare },
    { path: '/admin/privacy-policy', label: 'Política de Privacidade', icon: Shield },
    { path: '/admin/subscriptions', label: 'Inscrições', icon: Mail },
    { path: '/admin/users', label: 'Usuários', icon: Users },
    { path: '/admin/access-logs', label: 'Logs de Acesso', icon: Activity },
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

  // Salvar estado do menu retraído
  useEffect(() => {
    localStorage.setItem('adminSidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Toaster position="top-right" />
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'} bg-gray-800 shadow-lg transition-all duration-300 ease-in-out lg:flex-shrink-0 group flex flex-col`}>
        {/* Sidebar Header */}
        <div className={`h-16 flex items-center relative ${sidebarCollapsed ? 'justify-center' : 'justify-between px-6'}`} style={{ backgroundColor: '#3bb664' }}>
          {!sidebarCollapsed ? (
            <>
              <h1 className="text-white text-xl font-semibold">Admin</h1>
              {/* Botão para retrair (apenas desktop) */}
              <button
                onClick={toggleSidebar}
                className="hidden lg:flex items-center justify-center w-8 h-8 rounded hover:bg-white/20 transition-colors text-white"
                title="Retrair menu"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            </>
          ) : (
            <>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              {/* Botão para expandir (apenas desktop) */}
              <button
                onClick={toggleSidebar}
                className="hidden lg:flex items-center justify-center w-8 h-8 rounded hover:bg-white/20 transition-colors text-white absolute right-2"
                title="Expandir menu"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
        
        {/* Navigation */}
        <nav className={`mt-6 flex-1 ${sidebarCollapsed ? '' : 'overflow-y-auto'}`}>
          <ul className={`space-y-2 ${sidebarCollapsed ? 'px-2' : 'px-4'}`}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              const isHovered = hoveredItem === item.path;
              
              return (
                <li key={item.path} className="relative">
                  <Link
                    to={item.path}
                    className={`flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'px-4'} py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                    style={isActive ? { backgroundColor: '#3bb664' } : {}}
                    onClick={() => {
                      console.log('Clicando em:', item.path);
                      setSidebarOpen(false);
                    }}
                    onMouseEnter={() => setHoveredItem(item.path)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <Icon className={`h-5 w-5 ${sidebarCollapsed ? '' : 'mr-3'}`} />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </Link>
                  {/* Tooltip quando menu está contraído */}
                  {sidebarCollapsed && (
                    <div className={`absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 pointer-events-none transition-opacity duration-200 ${
                      isHovered ? 'opacity-100' : 'opacity-0'
                    }`}>
                      <div className="bg-gray-800 text-white text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                        {item.label}
                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-800"></div>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* Botão Sair na base */}
        <div className={`border-t border-gray-700 ${sidebarCollapsed ? 'px-2' : 'px-4'} py-4 relative`}>
          <button
            onClick={handleLogout}
            className={`flex items-center w-full ${sidebarCollapsed ? 'justify-center px-2' : 'px-4'} py-3 text-sm font-medium rounded-lg transition-colors text-gray-300 hover:bg-gray-700`}
            onMouseEnter={() => setHoveredItem('logout')}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <LogOut className={`h-5 w-5 ${sidebarCollapsed ? '' : 'mr-3'}`} />
            {!sidebarCollapsed && <span>Sair</span>}
          </button>
              {/* Tooltip quando menu está contraído */}
              {sidebarCollapsed && (
                <div className={`absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 pointer-events-none transition-opacity duration-200 ${
                  hoveredItem === 'logout' ? 'opacity-100' : 'opacity-0'
                }`}>
                  <div className="bg-gray-800 text-white text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                    Sair
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-800"></div>
                  </div>
                </div>
              )}
        </div>
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