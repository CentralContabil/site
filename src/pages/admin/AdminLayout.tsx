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
  Activity,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Home,
  Star,
  ClipboardList,
  Target,
  DollarSign,
  BarChart3,
  Trophy,
  Mail as MailIcon,
  Building,
  Briefcase as BriefcaseIcon,
  FileCheck
} from 'lucide-react';
import { Toaster } from 'sonner';
import { useConfiguration } from '@/hooks/useConfiguration';
import { AdminRole } from '@/types';
import { apiService } from '@/services/api';

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { configuration } = useConfiguration();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<AdminRole>('administrator');
  
  // Estado do menu retrátil (persistido no localStorage)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true';
  });
  
  // Estado para controlar qual item está com hover (para tooltips)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  // Estado para controlar se "Seções do Site" está expandido
  const [sectionsExpanded, setSectionsExpanded] = useState(() => {
    const saved = localStorage.getItem('sectionsExpanded');
    return saved === 'true';
  });
  // Flag para saber se o usuário já interagiu manualmente com o grupo "Seções do Site"
  const [sectionsAutoExpandDisabled, setSectionsAutoExpandDisabled] = useState(false);
  
  // Estado para controlar se o dropdown de seções está aberto quando o menu está comprimido
  const [sectionsDropdownOpen, setSectionsDropdownOpen] = useState(false);
  
  // Estado para controlar se "Páginas" está expandido
  const [pagesExpanded, setPagesExpanded] = useState(() => {
    const saved = localStorage.getItem('pagesExpanded');
    return saved === 'true';
  });
  // Flag para saber se o usuário já interagiu manualmente com o grupo "Páginas"
  const [pagesAutoExpandDisabled, setPagesAutoExpandDisabled] = useState(false);
  
  // Estado para controlar se o dropdown de páginas está aberto quando o menu está comprimido
  const [pagesDropdownOpen, setPagesDropdownOpen] = useState(false);
  

  // Verificar autenticação ao carregar o layout
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin');
    }
  }, [navigate]);

  // Descobrir o papel (role) do usuário logado a partir do token / endpoint
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const [, payload] = token.split('.');
      if (!payload) return;
      const decoded = JSON.parse(atob(payload));
      if (decoded.role) {
        setCurrentRole(decoded.role as AdminRole);
      }
    } catch (error) {
      console.error('Erro ao decodificar token JWT:', error);
    }
  }, []);

  const handleLogout = () => {
    console.log('Fazendo logout...');
    localStorage.removeItem('token'); // O token está salvo como 'token', não 'adminToken'
    localStorage.removeItem('adminToken'); // Remover ambos por segurança
    console.log('Token removido, redirecionando para login');
    navigate('/admin');
  };

  // Salvar estado do menu no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);
  
  // Salvar estado de expansão das seções
  useEffect(() => {
    localStorage.setItem('sectionsExpanded', String(sectionsExpanded));
  }, [sectionsExpanded]);
  
  // Salvar estado de expansão das páginas
  useEffect(() => {
    localStorage.setItem('pagesExpanded', String(pagesExpanded));
  }, [pagesExpanded]);
  
  // Expandir automaticamente se estiver em uma subseção
  useEffect(() => {
    if (
      location.pathname === '/admin/sections' &&
      !sectionsExpanded &&
      !sidebarCollapsed &&
      !sectionsAutoExpandDisabled
    ) {
      setSectionsExpanded(true);
    }
  }, [location.pathname, location.search, sectionsExpanded, sidebarCollapsed, sectionsAutoExpandDisabled]);
  
  // Expandir automaticamente "Páginas" se estiver em uma de suas rotas
  useEffect(() => {
    const isInPages =
      location.pathname === '/admin/login-page' ||
      location.pathname === '/admin/careers-page' ||
      location.pathname === '/admin/privacy-policy';
    
    if (isInPages && !pagesExpanded && !sidebarCollapsed && !pagesAutoExpandDisabled) {
      setPagesExpanded(true);
    }
  }, [location.pathname, pagesExpanded, sidebarCollapsed, pagesAutoExpandDisabled]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Subitens de "Seções do Site"
  const sectionSubItems = [
    { path: '/admin/sections?section=hero', label: 'Hero / Início', icon: Home, section: 'hero' },
    { path: '/admin/sections?section=features', label: 'Diferenciais', icon: Star, section: 'features' },
    { path: '/admin/sections?section=about', label: 'Sobre', icon: ClipboardList, section: 'about' },
    { path: '/admin/sections?section=specialties', label: 'Especialidades', icon: Target, section: 'specialties' },
    { path: '/admin/sections?section=fiscal-benefits', label: 'Benefícios Fiscais', icon: DollarSign, section: 'fiscal-benefits' },
    { path: '/admin/sections?section=fun-facts', label: 'Números', icon: BarChart3, section: 'fun-facts' },
    { path: '/admin/sections?section=certifications', label: 'Certificações', icon: Trophy, section: 'certifications' },
    { path: '/admin/sections?section=newsletter', label: 'Newsletter', icon: MailIcon, section: 'newsletter' },
    { path: '/admin/sections?section=clients', label: 'Clientes', icon: Building, section: 'clients' },
    { path: '/admin/sections?section=services', label: 'Serviços', icon: BriefcaseIcon, section: 'services' },
  ];
  
  // Subitens de "Páginas"
  const pagesSubItems = [
    { path: '/admin/login-page', label: 'Página de Login', icon: Activity },
    { path: '/admin/careers-page', label: 'Trabalhe Conosco', icon: Briefcase },
    { path: '/admin/privacy-policy', label: 'Política de Privacidade', icon: Shield },
    { path: '/admin/blog', label: 'Blog', icon: FileText },
  ];

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { 
      path: '/admin/sections', 
      label: 'Seções do Site', 
      icon: Sliders,
      hasSubItems: true,
      subItems: sectionSubItems,
      groupType: 'sections' as const,
    },
    {
      path: '/admin/pages',
      label: 'Páginas',
      icon: FileText,
      hasSubItems: true,
      subItems: pagesSubItems,
      groupType: 'pages' as const,
    },
    { path: '/admin/services', label: 'Serviços', icon: Briefcase },
    { path: '/admin/testimonials', label: 'Depoimentos', icon: MessageSquare },
    { path: '/admin/clients', label: 'Clientes', icon: Building2 },
    { path: '/admin/messages', label: 'Mensagens', icon: MessageSquare },
    { path: '/admin/subscriptions', label: 'Inscrições', icon: Mail },
    { path: '/admin/users', label: 'Usuários', icon: Users },
    { path: '/admin/job-applications', label: 'Candidaturas', icon: FileCheck },
    { path: '/admin/access-logs', label: 'Logs de Acesso', icon: FileText },
    { path: '/admin/configuration', label: 'Configurações', icon: Settings },
  ];

  const getPageTitle = () => {
    // Verificar se está em uma subseção
    if (location.pathname === '/admin/sections' && location.search) {
      const params = new URLSearchParams(location.search);
      const section = params.get('section');
      const subItem = sectionSubItems.find(item => item.section === section);
      if (subItem) {
        return subItem.label;
      }
    }
    
    // Verificar se está em alguma página agrupada em "Páginas"
    const pageSubItem = pagesSubItems.find(item => item.path === location.pathname);
    if (pageSubItem) {
      return pageSubItem.label;
    }
    
    const currentItem = menuItems.find(item => item.path === location.pathname);
    return currentItem?.label || 'Dashboard';
  };
  
  // Verificar se alguma subseção está ativa
  const isSectionActive = () => {
    if (location.pathname === '/admin/sections') {
      return true;
    }
    return false;
  };
  
  // Verificar se uma subseção específica está ativa
  const isSubItemActive = (subItem: { path: string; section?: string }) => {
    // Para "Seções do Site", usa o parâmetro ?section=
    if (subItem.section) {
      if (location.pathname === '/admin/sections') {
        const params = new URLSearchParams(location.search);
        const section = params.get('section');
        return section === subItem.section;
      }
      return false;
    }

    // Para "Páginas", considera o próprio path
    return location.pathname === subItem.path;
  };

  // Verificar se alguma página agrupada está ativa
  const isPageGroupActive = () => {
    return pagesSubItems.some((item) => item.path === location.pathname);
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
      <div
        className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed inset-y-0 left-0 z-50 ${
          sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'
        } w-64 bg-gray-800 shadow-lg transition-all duration-300 ease-in-out lg:flex-shrink-0`}
        style={{ overflow: sidebarCollapsed ? 'visible' : 'hidden' }}
      >
        {/* Sidebar Header */}
        <div className="px-6 h-16 flex items-center justify-between" style={{ backgroundColor: '#3bb664' }}>
          {!sidebarCollapsed && <h1 className="text-white text-xl font-semibold">Admin</h1>}
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded text-white hover:bg-white/20 transition-colors"
            title={sidebarCollapsed ? 'Expandir menu' : 'Retrair menu'}
          >
            {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>
        
        {/* Navigation */}
        <nav className={`mt-6 flex flex-col flex-1 ${!sidebarCollapsed ? 'overflow-y-auto' : 'overflow-hidden'}`} style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 4rem)' }}>
          <ul className={`space-y-2 px-4 flex-1 ${!sidebarCollapsed ? 'overflow-y-auto' : 'overflow-hidden'}`}>
            {menuItems.map((item, index) => {
              // Controle de acesso tipo WordPress: apenas administradores veem o menu "Usuários"
              if (item.path === '/admin/users' && currentRole !== 'administrator') {
                return null;
              }

              const Icon = item.icon;
              // Item está ativo se:
              // - for um link direto para a rota atual, ou
              // - for um grupo EXPANDIDO que contém a rota atual
              let isActive = location.pathname === item.path;

              if (item.hasSubItems) {
                const groupHasActiveChild =
                  item.groupType === 'sections' ? isSectionActive() : isPageGroupActive();
                const groupIsExpanded =
                  item.groupType === 'sections' ? sectionsExpanded : pagesExpanded;

                if (groupIsExpanded && groupHasActiveChild) {
                  isActive = true;
                }
              }
              const isHovered = hoveredItem === item.path;
              const hasSubItems = item.hasSubItems && item.subItems;
              const isExpanded =
                hasSubItems &&
                (item.groupType === 'sections' ? sectionsExpanded : pagesExpanded);
              
              return (
                <li key={item.path} className="relative">
                  {hasSubItems ? (
                    <>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (!sidebarCollapsed) {
                            // Quando expandido, expandir/colapsar normalmente
                            if (item.groupType === 'sections') {
                              setSectionsExpanded(!sectionsExpanded);
                              setSectionsAutoExpandDisabled(true);
                            } else if (item.groupType === 'pages') {
                              setPagesExpanded(!pagesExpanded);
                              setPagesAutoExpandDisabled(true);
                            }
                          }
                        }}
                        className={`flex items-center w-full ${sidebarCollapsed ? 'justify-center px-2' : 'px-4'} py-3 text-sm font-medium rounded-lg transition-colors ${
                          isActive
                            ? 'text-white'
                            : 'text-gray-300 hover:bg-gray-700'
                        }`}
                        style={isActive ? { backgroundColor: '#3bb664' } : {}}
                        onMouseEnter={() => {
                          setHoveredItem(item.path);
                          if (sidebarCollapsed) {
                            if (item.groupType === 'sections') {
                              setSectionsDropdownOpen(true);
                            } else if (item.groupType === 'pages') {
                              setPagesDropdownOpen(true);
                            }
                          }
                        }}
                        onMouseLeave={() => {
                          if (!sidebarCollapsed) {
                            setHoveredItem(null);
                          }
                          // Quando comprimido, o dropdown fecha quando o mouse sai do botão E do dropdown
                          // Isso é controlado pelo onMouseLeave do dropdown
                        }}
                      >
                        <Icon className={`h-5 w-5 ${sidebarCollapsed ? '' : 'mr-3'}`} />
                        {!sidebarCollapsed && (
                          <>
                            <span className="flex-1 text-left">{item.label}</span>
                            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                          </>
                        )}
                      </button>
                      {/* Subitens quando menu expandido */}
                      {!sidebarCollapsed && isExpanded && (
                        <ul className="mt-1 ml-4 space-y-1 border-l-2 border-gray-700 pl-4">
                          {item.subItems?.map((subItem) => {
                            const SubIcon = subItem.icon;
                            const isSubActive = isSubItemActive(subItem);
                            
                            return (
                              <li key={subItem.path}>
                                <Link
                                  to={subItem.path}
                                  className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                                    isSubActive
                                      ? 'text-white bg-[#3bb664]'
                                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                                  }`}
                                  onClick={() => {
                                    setSidebarOpen(false);
                                  }}
                                >
                                  <SubIcon className="h-4 w-4 mr-2" />
                                  <span>{subItem.label}</span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                      {/* Dropdown de subitens quando menu comprimido */}
                      {sidebarCollapsed && (
                        <div 
                          className={`fixed bg-gray-800 rounded-lg shadow-xl py-2 min-w-[200px] border border-gray-700 transition-all duration-200 ease-in-out ${
                            ((item.groupType === 'sections' ? sectionsDropdownOpen : pagesDropdownOpen) &&
                              hoveredItem === item.path)
                              ? 'opacity-100 visible translate-x-0 pointer-events-auto' 
                              : 'opacity-0 invisible -translate-x-2 pointer-events-none'
                          }`}
                          style={{ 
                            left: sidebarCollapsed ? '80px' : '256px',
                            top: `${(index + 1) * 48 + 48}px`,
                            zIndex: 99999
                          }}
                          onMouseEnter={() => {
                            setHoveredItem(item.path);
                            if (item.groupType === 'sections') {
                              setSectionsDropdownOpen(true);
                            } else if (item.groupType === 'pages') {
                              setPagesDropdownOpen(true);
                            }
                          }}
                          onMouseLeave={() => {
                            setHoveredItem(null);
                            if (item.groupType === 'sections') {
                              setSectionsDropdownOpen(false);
                            } else if (item.groupType === 'pages') {
                              setPagesDropdownOpen(false);
                            }
                          }}
                        >
                          <ul 
                            className="space-y-1 max-h-[400px] overflow-y-auto" 
                            style={{ 
                              scrollbarWidth: 'none',
                              msOverflowStyle: 'none',
                              WebkitScrollbar: 'none'
                            }}
                          >
                            {item.subItems?.map((subItem) => {
                              const SubIcon = subItem.icon;
                              const isSubActive = isSubItemActive(subItem);
                              
                              return (
                                <li key={subItem.path}>
                                  <Link
                                    to={subItem.path}
                                    className={`flex items-center px-4 py-2 text-sm text-gray-300 rounded-lg transition-colors ${
                                      isSubActive
                                        ? 'text-white bg-[#3bb664]'
                                        : 'hover:text-white hover:bg-gray-700'
                                    }`}
                                    onClick={() => {
                                      setSidebarOpen(false);
                                      if (item.groupType === 'sections') {
                                        setSectionsDropdownOpen(false);
                                      } else if (item.groupType === 'pages') {
                                        setPagesDropdownOpen(false);
                                      }
                                    }}
                                  >
                                    <SubIcon className="h-4 w-4 mr-3" />
                                    <span>{subItem.label}</span>
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </>
                  ) : (
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
                  )}
                  {/* Tooltip quando menu está contraído (apenas se não tiver subitens ou se o dropdown não estiver aberto) */}
                  {sidebarCollapsed && !hasSubItems && (
                    <div className={`absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 pointer-events-none transition-opacity duration-200 ${
                      isHovered ? 'opacity-100' : 'opacity-0'
                    }`}>
                      <div className="bg-gray-800 text-white text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                        {item.label}
                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-800"></div>
                      </div>
                    </div>
                  )}
                  {/* Tooltip para "Seções do Site" quando menu está contraído e dropdown não está aberto */}
                  {sidebarCollapsed &&
                    hasSubItems &&
                    !(
                      item.groupType === 'sections'
                        ? sectionsDropdownOpen
                        : pagesDropdownOpen
                    ) && (
                    <div className={`absolute left-full ml-2 top-1/2 -translate-y-1/2 z-40 pointer-events-none transition-opacity duration-200 ${
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
          {/* Botão Sair na base - fixo no rodapé */}
          <div className="px-4 pb-4 mt-auto border-t border-gray-700 pt-4">
            <div className="relative">
              <button
                onClick={handleLogout}
                className={`flex items-center w-full ${sidebarCollapsed ? 'justify-center px-2' : 'px-4'} py-3 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-700 transition-colors`}
                onMouseEnter={() => setHoveredItem('logout')}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <LogOut className={`h-5 w-5 ${sidebarCollapsed ? '' : 'mr-3'}`} />
                {!sidebarCollapsed && <span>Sair</span>}
              </button>
              {/* Tooltip para botão Sair */}
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
        </nav>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Header fixo */}
        <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
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
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
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