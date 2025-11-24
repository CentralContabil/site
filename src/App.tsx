import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Home from "@/pages/Home";
import HomeBlake from "@/pages/HomeBlake";
import { BlogPage } from "@/pages/BlogPage";
import { BlogPostPage } from "@/pages/BlogPostPage";
import { ServicePage } from "@/pages/ServicePage";
import { FiscalBenefitPage } from "@/pages/FiscalBenefitPage";
import { PrivacyPolicyPage } from "@/pages/PrivacyPolicyPage";
import { BlogAdmin } from "@/pages/admin/BlogAdmin";
import AdminLogin from "@/pages/AdminLogin";
import Dashboard from "@/pages/admin/Dashboard";
import SectionsAdmin from "@/pages/admin/SectionsAdmin";
import ServicesAdmin from "@/pages/admin/ServicesAdmin";
import TestimonialsAdmin from "@/pages/admin/TestimonialsAdmin";
import MessagesAdmin from "@/pages/admin/MessagesAdmin";
import UsersAdmin from "@/pages/admin/UsersAdmin";
import ConfigurationPage from "@/pages/admin/ConfigurationPage";
import SubscriptionsAdmin from "@/pages/admin/SubscriptionsAdmin";
import ClientsAdmin from "@/pages/admin/ClientsAdmin";
import { PrivacyPolicyAdmin } from "@/pages/admin/PrivacyPolicyAdmin";
import AdminLayout from "@/pages/admin/AdminLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { useConfiguration } from "@/hooks/useConfiguration";
import { PageTransition } from "@/components/PageTransition";
import "@/styles/modern.css";
import { Toaster } from "sonner";
import { useEffect } from "react";
import { FloatingWhatsAppButton } from "@/components/FloatingWhatsAppButton";
import { LGPDConsentBanner } from "@/components/LGPDConsentBanner";

// Layout component that includes global header and footer
function AppLayout({ children }: { children: React.ReactNode }) {
  const { configuration, loading: configLoading } = useConfiguration();
  const location = useLocation();

  const slugToTitle = (slug: string) =>
    slug
      .split(/[-_]/g)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  useEffect(() => {
    if (!configuration) return;
    const companyName = configuration.companyName || 'Central Contábil';
    const pageTitle = (() => {
      const pathname = location.pathname;
      if (pathname === '/' || pathname === '/original') {
        return 'Início';
      }
      if (pathname === '/blog') {
        return 'Blog';
      }
      if (pathname.startsWith('/blog/')) {
        const slug = pathname.replace('/blog/', '');
        return slug ? `Post: ${slugToTitle(slug)}` : 'Blog';
      }
      if (pathname.startsWith('/servicos/')) {
        const slug = pathname.replace('/servicos/', '');
        return slug ? `Serviço: ${slugToTitle(slug)}` : 'Serviços';
      }
      if (pathname.startsWith('/beneficios-fiscais/')) {
        const slug = pathname.replace('/beneficios-fiscais/', '');
        return slug ? `Benefício: ${slugToTitle(slug)}` : 'Benefícios Fiscais';
      }
      if (pathname === '/politica-de-privacidade') {
        return 'Política de Privacidade';
      }
      return '';
    })();
    document.title = pageTitle ? `${pageTitle} — ${companyName}` : companyName;

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
  
  // Mostrar loading apenas se ainda estiver carregando e não houver configuração
  if (configLoading && !configuration) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3bb664] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Toaster position="top-right" />
      <GlobalHeader configuration={configuration} />
      <main>
        <PageTransition>
          {children}
        </PageTransition>
      </main>
      <FloatingWhatsAppButton />
      <LGPDConsentBanner />
    </div>
  );
}

export default function App() {
  console.log('📱 App component renderizando...');
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <AppLayout>
            <HomeBlake />
          </AppLayout>
        } />
        <Route path="/original" element={
          <AppLayout>
            <Home />
          </AppLayout>
        } />
        <Route path="/blog" element={
          <AppLayout>
            <BlogPage />
          </AppLayout>
        } />
        <Route path="/blog/:slug" element={
          <AppLayout>
            <BlogPostPage />
          </AppLayout>
        } />
        <Route path="/servicos/:slug" element={
          <AppLayout>
            <ServicePage />
          </AppLayout>
        } />
        <Route path="/beneficios-fiscais/:slug" element={
          <AppLayout>
            <FiscalBenefitPage />
          </AppLayout>
        } />
        <Route path="/politica-de-privacidade" element={
          <AppLayout>
            <PrivacyPolicyPage />
          </AppLayout>
        } />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="sections" element={<ProtectedRoute><SectionsAdmin /></ProtectedRoute>} />
          <Route path="services" element={<ProtectedRoute><ServicesAdmin /></ProtectedRoute>} />
          <Route path="testimonials" element={<ProtectedRoute><TestimonialsAdmin /></ProtectedRoute>} />
          <Route path="blog" element={<ProtectedRoute><BlogAdmin /></ProtectedRoute>} />
          <Route path="messages" element={<ProtectedRoute><MessagesAdmin /></ProtectedRoute>} />
          <Route path="subscriptions" element={<ProtectedRoute><SubscriptionsAdmin /></ProtectedRoute>} />
          <Route path="clients" element={<ProtectedRoute><ClientsAdmin /></ProtectedRoute>} />
          <Route path="privacy-policy" element={<ProtectedRoute><PrivacyPolicyAdmin /></ProtectedRoute>} />
          <Route path="users" element={<ProtectedRoute><UsersAdmin /></ProtectedRoute>} />
          <Route path="configuration" element={<ProtectedRoute><ConfigurationPage /></ProtectedRoute>} />
        </Route>
      </Routes>
    </Router>
  );
}
