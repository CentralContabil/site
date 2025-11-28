import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Save, Plus, Edit, Trash2, Upload, Image as ImageIcon, ChevronRight, Eye, EyeOff, X, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import * as LucideIcons from 'lucide-react';
import { apiService } from '../../services/api';
import { Hero, UpdateHeroRequest } from '../../types';
import { RichTextEditor } from '../../components/ui/RichTextEditor';

type SectionType = 'hero' | 'features' | 'about' | 'specialties' | 'fiscal-benefits' | 'fun-facts' | 'certifications' | 'newsletter' | 'clients' | 'services';

interface SectionItem {
  id: string;
  icon?: string;
  title?: string;
  name?: string;
  label?: string;
  value?: string;
  suffix?: string;
  acronym?: string;
  description: string;
  order?: number;
  is_active?: boolean;
  [key: string]: any;
}

const ICON_OPTIONS = [
  'Shield', 'Zap', 'Settings', 'TrendingUp', 'Users', 'Award', 'Store', 'ShoppingCart',
  'Building2', 'Package', 'Factory', 'FileText', 'Briefcase', 'Coffee', 'Trophy', 'CheckCircle',
  'Calculator', 'ChartBar', 'ClipboardList', 'Handshake', 'Wallet', 'TrendingDown'
];

// Componente de Select customizado com ícones
const IconSelect = ({ value, onChange, label }: { value: string; onChange: (value: string) => void; label: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getIconComponent = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    if (IconComponent) {
      return <IconComponent className="w-4 h-4" />;
    }
    return <LucideIcons.Circle className="w-4 h-4" />;
  };

  const selectedIcon = value ? getIconComponent(value) : null;
  const selectedLabel = value || 'Selecione um ícone';

  return (
    <div className="relative" ref={selectRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:border-[#3bb664] focus:outline-none focus:ring-2 focus:ring-[#3bb664] focus:ring-offset-2"
      >
        <div className="flex items-center gap-2">
          {selectedIcon}
          <span>{selectedLabel}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          <div
            className="px-3 py-2 text-gray-500 cursor-pointer hover:bg-gray-50 flex items-center gap-2"
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
          >
            <LucideIcons.Circle className="w-4 h-4 opacity-50" />
            <span>Selecione um ícone</span>
          </div>
          {ICON_OPTIONS.map(icon => {
            const IconComponent = getIconComponent(icon);
            return (
              <div
                key={icon}
                className={`px-3 py-2 cursor-pointer flex items-center gap-2 hover:bg-[#3bb664]/10 ${
                  value === icon ? 'bg-[#3bb664]/20' : ''
                }`}
                onClick={() => {
                  onChange(icon);
                  setIsOpen(false);
                }}
              >
                <div className="text-[#3bb664]">{IconComponent}</div>
                <span className={value === icon ? 'font-semibold text-[#3bb664]' : ''}>{icon}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default function SectionsAdmin() {
  const [searchParams, setSearchParams] = useSearchParams();
  const sectionParam = searchParams.get('section') as SectionType | null;
  const [activeSection, setActiveSection] = useState<SectionType>(sectionParam || 'hero');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Atualizar seção ativa quando o parâmetro da URL mudar
  useEffect(() => {
    const sectionParam = searchParams.get('section') as SectionType | null;
    if (sectionParam && ['hero', 'features', 'about', 'specialties', 'fiscal-benefits', 'fun-facts', 'certifications', 'newsletter', 'clients', 'services'].includes(sectionParam)) {
      setActiveSection(sectionParam);
    }
  }, [searchParams]);
  const [uploadingImage, setUploadingImage] = useState<'background' | 'hero' | 'about' | 'newsletter' | 'fiscal-benefit' | 'services' | null>(null);
  const [uploadingFiscalBenefitImage, setUploadingFiscalBenefitImage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Hero
  const [hero, setHero] = useState<Hero | null>(null);
  const [heroForm, setHeroForm] = useState<UpdateHeroRequest>({
    badgeText: '',
    titleLine1: '',
    titleLine2: '',
    description: '',
    backgroundImageUrl: '',
    heroImageUrl: '',
    button1Text: '',
    button1Link: '',
    button2Text: '',
    button2Link: '',
    statYears: '',
    statClients: '',
    statNetwork: '',
    indicator1Title: '',
    indicator1Value: '',
    indicator2Title: '',
    indicator2Value: '',
    indicator3Title: '',
    indicator3Value: '',
  });

  // Features
  const [features, setFeatures] = useState<SectionItem[]>([]);
  const [editingFeature, setEditingFeature] = useState<SectionItem | null>(null);
  const [featureForm, setFeatureForm] = useState({ icon: '', title: '', description: '', order: 0, is_active: true });

  // About
  const [about, setAbout] = useState<any>(null);
  const [aboutForm, setAboutForm] = useState({
    badge_text: '',
    title: '',
    subtitle: '',
    description: '',
    background_image_url: '',
    stat_years: '',
    stat_clients: '',
    stat_network: '',
    indicator1_title: '',
    indicator1_value: '',
    indicator2_title: '',
    indicator2_value: '',
    indicator3_title: '',
    indicator3_value: '',
  });
  const [aboutImages, setAboutImages] = useState<any[]>([]);
  const [editingAboutImage, setEditingAboutImage] = useState<any | null>(null);
  const [aboutImageForm, setAboutImageForm] = useState({ description: '', order: 0 });
  const [uploadingAboutImage, setUploadingAboutImage] = useState(false);
  const [showAboutImageModal, setShowAboutImageModal] = useState(false);
  const [isClosingImageModal, setIsClosingImageModal] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const baseUrl = 'http://localhost:3006/api/sections';

  // Specialties
  const [specialties, setSpecialties] = useState<SectionItem[]>([]);
  const [editingSpecialty, setEditingSpecialty] = useState<SectionItem | null>(null);
  const [specialtyForm, setSpecialtyForm] = useState({ icon: '', name: '', description: '', order: 0, is_active: true });

  // Fiscal Benefits
  const [fiscalBenefits, setFiscalBenefits] = useState<SectionItem[]>([]);
  const [editingFiscalBenefit, setEditingFiscalBenefit] = useState<SectionItem | null>(null);
  const [fiscalBenefitForm, setFiscalBenefitForm] = useState({ 
    icon: '', 
    name: '', 
    description: '', 
    slug: '',
    excerpt: '',
    content: '',
    featured_image_url: '',
    order: 0, 
    is_active: true 
  });

  // Fun Facts
  const [funFacts, setFunFacts] = useState<SectionItem[]>([]);
  const [editingFunFact, setEditingFunFact] = useState<SectionItem | null>(null);
  const [funFactForm, setFunFactForm] = useState({ icon: '', label: '', value: '', suffix: '', order: 0, is_active: true });

  // Certifications
  const [certifications, setCertifications] = useState<SectionItem[]>([]);
  const [editingCertification, setEditingCertification] = useState<SectionItem | null>(null);
  const [certificationForm, setCertificationForm] = useState({ icon: '', name: '', acronym: '', description: '', order: 0, is_active: true });

  // Newsletter
  const [newsletter, setNewsletter] = useState<any>(null);
  const [newsletterForm, setNewsletterForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    button_text: '',
    background_image_url: '',
  });

  // Clients
  const [clients, setClients] = useState<any>(null);
  const [clientsForm, setClientsForm] = useState({
    title: '',
    background_image_url: '',
  });

  // Services
  const [services, setServices] = useState<any>(null);
  const [servicesForm, setServicesForm] = useState({
    badge_text: '',
    title_line1: '',
    title_line2: '',
    years_highlight: '',
    description: '',
    background_image_url: '',
  });

  useEffect(() => {
    loadSectionData();
  }, [activeSection]);

  const loadSectionData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      switch (activeSection) {
        case 'hero':
          const heroRes = await apiService.getHero();
          const heroData = heroRes.hero;
          setHero(heroData);
          setHeroForm({
            badgeText: heroData.badgeText || '',
            titleLine1: heroData.titleLine1 || '',
            titleLine2: heroData.titleLine2 || '',
            description: heroData.description || '',
            backgroundImageUrl: heroData.backgroundImageUrl || '',
            heroImageUrl: heroData.heroImageUrl || '',
            button1Text: heroData.button1Text || '',
            button1Link: heroData.button1Link || '',
            button2Text: heroData.button2Text || '',
            button2Link: heroData.button2Link || '',
            statYears: heroData.statYears || '',
            statClients: heroData.statClients || '',
            statNetwork: heroData.statNetwork || '',
            indicator1Title: heroData.indicator1Title || '',
            indicator1Value: heroData.indicator1Value || '',
            indicator2Title: heroData.indicator2Title || '',
            indicator2Value: heroData.indicator2Value || '',
            indicator3Title: heroData.indicator3Title || '',
            indicator3Value: heroData.indicator3Value || '',
          });
          break;

        case 'features':
          const featuresRes = await fetch(`${baseUrl}/features/all`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          const featuresData = await featuresRes.json();
          if (featuresData.success) setFeatures(featuresData.features || []);
          break;

        case 'about':
          const aboutRes = await fetch(`${baseUrl}/about`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          const aboutData = await aboutRes.json();
          if (aboutData.success && aboutData.about) {
            setAbout(aboutData.about);
            setAboutForm({
              badge_text: aboutData.about.badge_text || '',
              title: aboutData.about.title || '',
              subtitle: aboutData.about.subtitle || '',
              description: aboutData.about.description || '',
              background_image_url: aboutData.about.background_image_url || '',
              stat_years: aboutData.about.stat_years || '',
              stat_clients: aboutData.about.stat_clients || '',
              stat_network: aboutData.about.stat_network || '',
              indicator1_title: aboutData.about.indicator1_title || 'Anos',
              indicator1_value: aboutData.about.indicator1_value || aboutData.about.stat_years || '34+',
              indicator2_title: aboutData.about.indicator2_title || 'Clientes',
              indicator2_value: aboutData.about.indicator2_value || aboutData.about.stat_clients || '500+',
              indicator3_title: aboutData.about.indicator3_title || 'Rede',
              indicator3_value: aboutData.about.indicator3_value || aboutData.about.stat_network || 'RNC',
            });
            // Carregar imagens do carrossel
            const imagesRes = await fetch(`${baseUrl}/about/images`);
            const imagesData = await imagesRes.json();
            if (imagesData.success) {
              setAboutImages(imagesData.images || []);
            }
          }
          break;

        case 'specialties':
          const specialtiesRes = await fetch(`${baseUrl}/specialties/all`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          const specialtiesData = await specialtiesRes.json();
          if (specialtiesData.success) setSpecialties(specialtiesData.specialties || []);
          break;

        case 'fiscal-benefits':
          const benefitsRes = await fetch(`${baseUrl}/fiscal-benefits/all`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          const benefitsData = await benefitsRes.json();
          if (benefitsData.success) setFiscalBenefits(benefitsData.benefits || []);
          break;

        case 'fun-facts':
          const funFactsRes = await fetch(`${baseUrl}/fun-facts/all`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          const funFactsData = await funFactsRes.json();
          if (funFactsData.success) setFunFacts(funFactsData.funFacts || []);
          break;

        case 'certifications':
          const certsRes = await fetch(`${baseUrl}/certifications/all`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          const certsData = await certsRes.json();
          if (certsData.success) setCertifications(certsData.certifications || []);
          break;

        case 'newsletter':
          const newsletterRes = await fetch(`${baseUrl}/newsletter`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          const newsletterData = await newsletterRes.json();
          if (newsletterData.success && newsletterData.newsletter) {
            setNewsletter(newsletterData.newsletter);
            setNewsletterForm({
              title: newsletterData.newsletter.title || '',
              subtitle: newsletterData.newsletter.subtitle || '',
              description: newsletterData.newsletter.description || '',
              button_text: newsletterData.newsletter.button_text || '',
              background_image_url: newsletterData.newsletter.background_image_url || '',
            });
          }
          break;

        case 'clients':
          const clientsRes = await fetch(`${baseUrl}/clients`);
          const clientsData = await clientsRes.json();
          if (clientsData.success && clientsData.clients) {
            setClients(clientsData.clients);
            setClientsForm({
              title: clientsData.clients.title || '',
              background_image_url: clientsData.clients.background_image_url || '',
            });
          }
          break;
        case 'services':
          const servicesRes = await fetch(`${baseUrl}/services`);
          const servicesData = await servicesRes.json();
          if (servicesData.success && servicesData.services) {
            setServices(servicesData.services);
            setServicesForm({
              badge_text: servicesData.services.badge_text || '',
              title_line1: servicesData.services.title_line1 || '',
              title_line2: servicesData.services.title_line2 || '',
              description: servicesData.services.description || '',
              years_highlight: servicesData.services.years_highlight || '',
              background_image_url: servicesData.services.background_image_url || '',
            });
          }
          break;
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados da seção');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHero = async () => {
    setSaving(true);
    try {
      const dataToSend: UpdateHeroRequest = {
        ...heroForm,
        backgroundImageUrl: heroForm.backgroundImageUrl?.trim() || null,
        heroImageUrl: heroForm.heroImageUrl?.trim() || null,
        button1Text: heroForm.button1Text?.trim() || null,
        button1Link: heroForm.button1Link?.trim() || null,
        button2Text: heroForm.button2Text?.trim() || null,
        button2Link: heroForm.button2Link?.trim() || null,
        statYears: heroForm.statYears?.trim() || null,
        statClients: heroForm.statClients?.trim() || null,
        statNetwork: heroForm.statNetwork?.trim() || null,
        indicator1Title: heroForm.indicator1Title?.trim() || null,
        indicator1Value: heroForm.indicator1Value?.trim() || null,
        indicator2Title: heroForm.indicator2Title?.trim() || null,
        indicator2Value: heroForm.indicator2Value?.trim() || null,
        indicator3Title: heroForm.indicator3Title?.trim() || null,
        indicator3Value: heroForm.indicator3Value?.trim() || null,
      };
      
      const response = await apiService.updateHero(dataToSend);
      setHero(response.hero);
      setHeroForm({
        badgeText: response.hero.badgeText || '',
        titleLine1: response.hero.titleLine1 || '',
        titleLine2: response.hero.titleLine2 || '',
        description: response.hero.description || '',
        backgroundImageUrl: response.hero.backgroundImageUrl || '',
        heroImageUrl: response.hero.heroImageUrl || '',
        button1Text: response.hero.button1Text || '',
        button1Link: response.hero.button1Link || '',
        button2Text: response.hero.button2Text || '',
        button2Link: response.hero.button2Link || '',
        statYears: response.hero.statYears || '',
        statClients: response.hero.statClients || '',
        statNetwork: response.hero.statNetwork || '',
        indicator1Title: response.hero.indicator1Title || '',
        indicator1Value: response.hero.indicator1Value || '',
        indicator2Title: response.hero.indicator2Title || '',
        indicator2Value: response.hero.indicator2Value || '',
        indicator3Title: response.hero.indicator3Title || '',
        indicator3Value: response.hero.indicator3Value || '',
      });
      toast.success('✅ Hero atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar Hero:', error);
      toast.error('Erro ao salvar dados do Hero');
    } finally {
      setSaving(false);
    }
  };

  const handleHeroImageUpload = async (type: 'background' | 'hero', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(type);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3006/api/hero/image', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        setHeroForm(prev => ({
          ...prev,
          [type === 'background' ? 'backgroundImageUrl' : 'heroImageUrl']: result.data.url
        }));
        if (result.hero) {
          setHero(result.hero);
        }
        toast.success('Imagem enviada com sucesso!');
      } else {
        toast.error(result.error || 'Erro ao enviar imagem');
      }
    } catch (error) {
      console.error('Erro ao enviar imagem:', error);
      toast.error('Erro ao enviar imagem');
    } finally {
      setUploadingImage(null);
      event.target.value = '';
    }
  };

  const handleDeleteHeroImage = async (type: 'background' | 'hero') => {
    if (!window.confirm('Tem certeza que deseja remover esta imagem?')) return;

    setUploadingImage(type);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3006/api/hero/image/${type}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const result = await response.json();
      if (result.success) {
        setHeroForm(prev => ({
          ...prev,
          [type === 'background' ? 'backgroundImageUrl' : 'heroImageUrl']: null
        }));
        if (result.hero) {
          setHero(result.hero);
        }
        toast.success('Imagem removida com sucesso!');
      } else {
        toast.error(result.error || 'Erro ao remover imagem');
      }
    } catch (error) {
      console.error('Erro ao remover imagem:', error);
      toast.error('Erro ao remover imagem');
    } finally {
      setUploadingImage(null);
    }
  };

  const handleSaveAbout = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/about`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          badge_text: aboutForm.badge_text,
          title: aboutForm.title,
          subtitle: aboutForm.subtitle || null,
          description: aboutForm.description,
          background_image_url: aboutForm.background_image_url || null,
          stat_years: aboutForm.stat_years || null,
          stat_clients: aboutForm.stat_clients || null,
          stat_network: aboutForm.stat_network || null,
          indicator1_title: aboutForm.indicator1_title || null,
          indicator1_value: aboutForm.indicator1_value || null,
          indicator2_title: aboutForm.indicator2_title || null,
          indicator2_value: aboutForm.indicator2_value || null,
          indicator3_title: aboutForm.indicator3_title || null,
          indicator3_value: aboutForm.indicator3_value || null,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setAbout(data.about);
        toast.success('✅ Seção Sobre atualizada com sucesso!');
      } else {
        toast.error(data.error || 'Erro ao salvar');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar dados');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNewsletter = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3006/api/sections/newsletter', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newsletterForm.title,
          subtitle: newsletterForm.subtitle || null,
          description: newsletterForm.description || null,
          button_text: newsletterForm.button_text || null,
          background_image_url: newsletterForm.background_image_url || null,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNewsletter(data.newsletter);
        toast.success('✅ Seção Newsletter atualizada com sucesso!');
      } else {
        toast.error(data.error || 'Erro ao salvar');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar dados');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveClients = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3006/api/sections/clients', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: clientsForm.title,
          background_image_url: clientsForm.background_image_url || null,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setClients(data.clients);
        toast.success('✅ Seção Clientes atualizada com sucesso!');
      } else {
        toast.error(data.error || 'Erro ao salvar');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar dados');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveServices = async () => {
    setSaving(true);
    try {
      const response = await apiService.updateServicesSection({
        badge_text: servicesForm.badge_text,
        title_line1: servicesForm.title_line1,
        title_line2: servicesForm.title_line2,
        description: servicesForm.description,
        years_highlight: servicesForm.years_highlight || null,
        background_image_url: servicesForm.background_image_url || null,
      });

      if (response.success) {
        setServices(response.services);
        toast.success('✅ Seção de Serviços atualizada com sucesso!');
      } else {
        toast.error('Erro ao salvar');
      }
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast.error(error.message || 'Erro ao salvar dados');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (section: 'about' | 'newsletter' | 'clients' | 'services', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tamanho do arquivo (5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      Swal.fire({
        icon: 'error',
        title: 'Arquivo muito grande',
        html: `
          <p>A imagem selecionada é muito grande.</p>
          <p><strong>Tamanho do arquivo:</strong> ${fileSizeMB} MB</p>
          <p><strong>Tamanho máximo permitido:</strong> 5 MB</p>
          <p class="mt-3">Por favor, escolha uma imagem menor ou comprima a imagem antes de enviar.</p>
        `,
        confirmButtonText: 'Entendi',
        confirmButtonColor: '#3bb664',
      });
      event.target.value = '';
      return;
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      Swal.fire({
        icon: 'error',
        title: 'Tipo de arquivo inválido',
        text: 'Por favor, selecione uma imagem nos formatos JPG, PNG, GIF ou WebP.',
        confirmButtonText: 'Entendi',
        confirmButtonColor: '#3bb664',
      });
      event.target.value = '';
      return;
    }

        setUploadingImage(section === 'services' ? 'services' : section);
    const formData = new FormData();
    formData.append('file', file);

    try {
      let response;
      if (section === 'services') {
        const result = await apiService.uploadServicesImage(file);
        if (result.success) {
          setServicesForm(prev => ({ ...prev, background_image_url: result.data.url }));
          setServices(result.services);
          toast.success('Imagem enviada com sucesso!');
        }
        setUploadingImage(null);
        return;
      }

      const token = localStorage.getItem('token');
      response = await fetch(`http://localhost:3006/api/sections/${section}/image`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        if (section === 'about') {
          setAboutForm(prev => ({ ...prev, background_image_url: result.data.url }));
          setAbout(result.about);
        } else if (section === 'newsletter') {
          setNewsletterForm(prev => ({ ...prev, background_image_url: result.data.url }));
          setNewsletter(result.newsletter);
        } else if (section === 'clients') {
          setClientsForm(prev => ({ ...prev, background_image_url: result.data.url }));
          setClients(result.clients);
        } else if (section === 'services') {
          setServicesForm(prev => ({ ...prev, background_image_url: result.data.url }));
          setServices(result.services);
        }
        toast.success('Imagem enviada com sucesso!');
      } else {
        // Verificar se é erro de tamanho de arquivo
        if (result.error && (result.error.includes('muito grande') || result.error.includes('LIMIT_FILE_SIZE'))) {
          Swal.fire({
            icon: 'error',
            title: 'Arquivo muito grande',
            html: `
              <p>${result.error}</p>
              <p class="mt-3">Por favor, escolha uma imagem menor ou comprima a imagem antes de enviar.</p>
            `,
            confirmButtonText: 'Entendi',
            confirmButtonColor: '#3bb664',
          });
        } else {
          toast.error(result.error || 'Erro ao enviar imagem');
        }
      }
    } catch (error: any) {
      console.error('Erro ao enviar imagem:', error);
      // Verificar se é erro de tamanho de arquivo
      if (error.message && (error.message.includes('muito grande') || error.message.includes('LIMIT_FILE_SIZE'))) {
        Swal.fire({
          icon: 'error',
          title: 'Arquivo muito grande',
          text: 'O arquivo excede o tamanho máximo permitido de 5MB. Por favor, escolha uma imagem menor.',
          confirmButtonText: 'Entendi',
          confirmButtonColor: '#3bb664',
        });
      } else {
        toast.error('Erro ao enviar imagem. Tente novamente.');
      }
    } finally {
      setUploadingImage(false);
      event.target.value = '';
    }
  };

  const handleFiscalBenefitImageUpload = async (benefitId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tamanho do arquivo (5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      Swal.fire({
        icon: 'error',
        title: 'Arquivo muito grande',
        html: `
          <p>A imagem selecionada é muito grande.</p>
          <p><strong>Tamanho do arquivo:</strong> ${fileSizeMB} MB</p>
          <p><strong>Tamanho máximo permitido:</strong> 5 MB</p>
          <p class="mt-3">Por favor, escolha uma imagem menor ou comprima a imagem antes de enviar.</p>
        `,
        confirmButtonText: 'Entendi',
        confirmButtonColor: '#3bb664',
      });
      event.target.value = '';
      return;
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      Swal.fire({
        icon: 'error',
        title: 'Tipo de arquivo inválido',
        text: 'Por favor, selecione uma imagem nos formatos JPG, PNG, GIF ou WebP.',
        confirmButtonText: 'Entendi',
        confirmButtonColor: '#3bb664',
      });
      event.target.value = '';
      return;
    }

    setUploadingFiscalBenefitImage(benefitId);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/fiscal-benefits/${benefitId}/image`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        // Atualizar o benefício na lista
        setFiscalBenefits(prev => prev.map(b => 
          b.id === benefitId 
            ? { ...b, featured_image_url: result.data.url }
            : b
        ));
        // Se estiver editando, atualizar o formulário também
        if (editingFiscalBenefit && editingFiscalBenefit.id === benefitId) {
          setFiscalBenefitForm(prev => ({ ...prev, featured_image_url: result.data.url }));
        }
        toast.success('Imagem enviada com sucesso!');
        loadSectionData('fiscal-benefits');
      } else {
        if (result.error && (result.error.includes('muito grande') || result.error.includes('LIMIT_FILE_SIZE'))) {
          Swal.fire({
            icon: 'error',
            title: 'Arquivo muito grande',
            html: `
              <p>${result.error}</p>
              <p class="mt-3">Por favor, escolha uma imagem menor ou comprima a imagem antes de enviar.</p>
            `,
            confirmButtonText: 'Entendi',
            confirmButtonColor: '#3bb664',
          });
        } else {
          toast.error(result.error || 'Erro ao enviar imagem');
        }
      }
    } catch (error: any) {
      console.error('Erro ao enviar imagem:', error);
      if (error.message && (error.message.includes('muito grande') || error.message.includes('LIMIT_FILE_SIZE'))) {
        Swal.fire({
          icon: 'error',
          title: 'Arquivo muito grande',
          text: 'O arquivo excede o tamanho máximo permitido de 5MB. Por favor, escolha uma imagem menor.',
          confirmButtonText: 'Entendi',
          confirmButtonColor: '#3bb664',
        });
      } else {
        toast.error('Erro ao enviar imagem. Tente novamente.');
      }
    } finally {
      setUploadingFiscalBenefitImage(null);
      event.target.value = '';
    }
  };

  const handleImageFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tamanho do arquivo (5MB = 5 * 1024 * 1024 bytes)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        Swal.fire({
          icon: 'error',
          title: 'Arquivo muito grande',
          html: `
            <p>A imagem selecionada é muito grande.</p>
            <p><strong>Tamanho do arquivo:</strong> ${fileSizeMB} MB</p>
            <p><strong>Tamanho máximo permitido:</strong> 5 MB</p>
            <p class="mt-3">Por favor, escolha uma imagem menor ou comprima a imagem antes de enviar.</p>
          `,
          confirmButtonText: 'Entendi',
          confirmButtonColor: '#3bb664',
        });
        // Limpar o input
        event.target.value = '';
        setSelectedImageFile(null);
        setImagePreviewUrl(null);
        return;
      }
      
      // Validar tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        Swal.fire({
          icon: 'error',
          title: 'Tipo de arquivo inválido',
          text: 'Por favor, selecione uma imagem nos formatos JPG, PNG, GIF ou WebP.',
          confirmButtonText: 'Entendi',
          confirmButtonColor: '#3bb664',
        });
        event.target.value = '';
        setSelectedImageFile(null);
        setImagePreviewUrl(null);
        return;
      }
      
      setSelectedImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    } else {
      setSelectedImageFile(null);
      setImagePreviewUrl(null);
    }
  };

  const handleAboutImageSubmit = async () => {
    if (!selectedImageFile && !editingAboutImage) {
      toast.error('Por favor, selecione uma imagem');
      return;
    }

    setUploadingAboutImage(true);

    try {
      const token = localStorage.getItem('token');
      
      if (editingAboutImage) {
        // Atualizar imagem existente (sem novo arquivo)
        const response = await fetch(`${baseUrl}/about/images/${editingAboutImage.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            description: aboutImageForm.description,
            order: parseInt(aboutImageForm.order.toString()),
            is_active: true
          }),
        });

        const result = await response.json();
        if (result.success) {
          toast.success('Imagem atualizada com sucesso!');
          handleCloseImageModal();
          loadSectionData('about');
        } else {
          toast.error(result.error || 'Erro ao atualizar imagem');
        }
      } else {
        // Criar nova imagem com upload
        const formData = new FormData();
        formData.append('file', selectedImageFile!);
        formData.append('description', aboutImageForm.description);
        formData.append('order', aboutImageForm.order.toString());

        const response = await fetch(`${baseUrl}/about/images`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
        });

        const result = await response.json();
        if (result.success) {
          toast.success('Imagem adicionada com sucesso!');
          handleCloseImageModal();
          setEditingAboutImage(null);
          setAboutImageForm({ description: '', order: 0 });
          setSelectedImageFile(null);
          setImagePreviewUrl(null);
          loadSectionData('about');
        } else {
          // Verificar se é erro de tamanho de arquivo
          if (result.error && (result.error.includes('muito grande') || result.error.includes('LIMIT_FILE_SIZE'))) {
            Swal.fire({
              icon: 'error',
              title: 'Arquivo muito grande',
              html: `
                <p>${result.error}</p>
                <p class="mt-3">Por favor, escolha uma imagem menor ou comprima a imagem antes de enviar.</p>
              `,
              confirmButtonText: 'Entendi',
              confirmButtonColor: '#3bb664',
            });
          } else {
            toast.error(result.error || 'Erro ao adicionar imagem');
          }
        }
      }
    } catch (error: any) {
      console.error('Erro ao salvar imagem:', error);
      // Verificar se é erro de tamanho de arquivo
      if (error.message && (error.message.includes('muito grande') || error.message.includes('LIMIT_FILE_SIZE'))) {
        Swal.fire({
          icon: 'error',
          title: 'Arquivo muito grande',
          text: 'O arquivo excede o tamanho máximo permitido de 5MB. Por favor, escolha uma imagem menor.',
          confirmButtonText: 'Entendi',
          confirmButtonColor: '#3bb664',
        });
      } else {
        toast.error('Erro ao salvar imagem. Tente novamente.');
      }
    } finally {
      setUploadingAboutImage(false);
    }
  };

  // Funções genéricas para gerenciar itens de lista
  const handleCreateItem = async (type: 'features' | 'specialties' | 'fiscal-benefits' | 'fun-facts' | 'certifications') => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      let formData: any;
      let endpoint: string;

      switch (type) {
        case 'features':
          formData = featureForm;
          endpoint = '/features';
          break;
        case 'specialties':
          formData = specialtyForm;
          endpoint = '/specialties';
          break;
        case 'fiscal-benefits':
          formData = fiscalBenefitForm;
          endpoint = '/fiscal-benefits';
          break;
        case 'fun-facts':
          formData = funFactForm;
          endpoint = '/fun-facts';
          break;
        case 'certifications':
          formData = certificationForm;
          endpoint = '/certifications';
          break;
      }

      const response = await fetch(`http://localhost:3006/api/sections${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Item criado com sucesso!');
        handleCloseModal();
        resetForm(type);
        loadSectionData();
      } else {
        toast.error(data.error || 'Erro ao criar item');
      }
    } catch (error) {
      console.error('Erro ao criar item:', error);
      toast.error('Erro ao criar item');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateItem = async (type: 'features' | 'specialties' | 'fiscal-benefits' | 'fun-facts' | 'certifications', id: string) => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      let formData: any;
      let endpoint: string;

      switch (type) {
        case 'features':
          formData = featureForm;
          endpoint = `/features/${id}`;
          break;
        case 'specialties':
          formData = specialtyForm;
          endpoint = `/specialties/${id}`;
          break;
        case 'fiscal-benefits':
          formData = fiscalBenefitForm;
          endpoint = `/fiscal-benefits/${id}`;
          break;
        case 'fun-facts':
          formData = funFactForm;
          endpoint = `/fun-facts/${id}`;
          break;
        case 'certifications':
          formData = certificationForm;
          endpoint = `/certifications/${id}`;
          break;
      }

      const response = await fetch(`http://localhost:3006/api/sections${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Item atualizado com sucesso!');
        handleCloseModal();
        resetForm(type);
        loadSectionData();
      } else {
        toast.error(data.error || 'Erro ao atualizar item');
      }
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      toast.error('Erro ao atualizar item');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (type: 'features' | 'specialties' | 'fiscal-benefits' | 'fun-facts' | 'certifications', id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este item?')) return;

    try {
      const token = localStorage.getItem('token');
      let endpoint: string;

      switch (type) {
        case 'features':
          endpoint = `/features/${id}`;
          break;
        case 'specialties':
          endpoint = `/specialties/${id}`;
          break;
        case 'fiscal-benefits':
          endpoint = `/fiscal-benefits/${id}`;
          break;
        case 'fun-facts':
          endpoint = `/fun-facts/${id}`;
          break;
        case 'certifications':
          endpoint = `/certifications/${id}`;
          break;
      }

      const response = await fetch(`http://localhost:3006/api/sections${endpoint}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Item excluído com sucesso!');
        loadSectionData();
      } else {
        toast.error(data.error || 'Erro ao excluir item');
      }
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      toast.error('Erro ao excluir item');
    }
  };

  const handleToggleStatus = async (type: 'features' | 'specialties' | 'fiscal-benefits' | 'fun-facts' | 'certifications', item: SectionItem) => {
    try {
      await handleUpdateItem(type, item.id);
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  };

  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosing(false);
    }, 200);
  };

  const handleCloseImageModal = () => {
    setIsClosingImageModal(true);
    setTimeout(() => {
      setShowAboutImageModal(false);
      setIsClosingImageModal(false);
      setEditingAboutImage(null);
      setAboutImageForm({ description: '', order: 0 });
      setSelectedImageFile(null);
      setImagePreviewUrl(null);
    }, 200);
  };

  const resetForm = (type: 'features' | 'specialties' | 'fiscal-benefits' | 'fun-facts' | 'certifications') => {
    switch (type) {
      case 'features':
        setFeatureForm({ icon: '', title: '', description: '', order: 0, is_active: true });
        setEditingFeature(null);
        break;
      case 'specialties':
        setSpecialtyForm({ icon: '', name: '', description: '', order: 0, is_active: true });
        setEditingSpecialty(null);
        break;
      case 'fiscal-benefits':
        setFiscalBenefitForm({ 
          icon: '', 
          name: '', 
          description: '', 
          slug: '',
          excerpt: '',
          content: '',
          featured_image_url: '',
          order: 0, 
          is_active: true 
        });
        setEditingFiscalBenefit(null);
        break;
      case 'fun-facts':
        setFunFactForm({ icon: '', label: '', value: '', suffix: '', order: 0, is_active: true });
        setEditingFunFact(null);
        break;
      case 'certifications':
        setCertificationForm({ icon: '', name: '', acronym: '', description: '', order: 0, is_active: true });
        setEditingCertification(null);
        break;
    }
    setShowModal(false);
  };

  const handleEdit = (type: 'features' | 'specialties' | 'fiscal-benefits' | 'fun-facts' | 'certifications', item: SectionItem) => {
    switch (type) {
      case 'features':
        setEditingFeature(item);
        setFeatureForm({
          icon: item.icon || '',
          title: item.title || '',
          description: item.description || '',
          order: item.order || 0,
          is_active: item.is_active !== undefined ? item.is_active : true,
        });
        break;
      case 'specialties':
        setEditingSpecialty(item);
        setSpecialtyForm({
          icon: item.icon || '',
          name: item.name || '',
          description: item.description || '',
          order: item.order || 0,
          is_active: item.is_active !== undefined ? item.is_active : true,
        });
        break;
      case 'fiscal-benefits':
        setEditingFiscalBenefit(item);
        setFiscalBenefitForm({
          icon: item.icon || '',
          name: item.name || '',
          description: item.description || '',
          slug: item.slug || '',
          excerpt: item.excerpt || '',
          content: item.content || '',
          featured_image_url: item.featured_image_url || '',
          order: item.order || 0,
          is_active: item.is_active !== undefined ? item.is_active : true,
        });
        break;
      case 'fun-facts':
        setEditingFunFact(item);
        setFunFactForm({
          icon: item.icon || '',
          label: item.label || '',
          value: item.value || '',
          suffix: item.suffix || '',
          order: item.order || 0,
          is_active: item.is_active !== undefined ? item.is_active : true,
        });
        break;
      case 'certifications':
        setEditingCertification(item);
        setCertificationForm({
          icon: item.icon || '',
          name: item.name || '',
          acronym: item.acronym || '',
          description: item.description || '',
          order: item.order || 0,
          is_active: item.is_active !== undefined ? item.is_active : true,
        });
        break;
    }
    setIsClosing(false);
    setShowModal(true);
  };

  const renderIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    if (IconComponent) {
      return <IconComponent className="w-5 h-5" />;
    }
    return <LucideIcons.Circle className="w-5 h-5" />;
  };

  const sections = [
    { id: 'hero' as SectionType, label: 'Hero / Início', icon: '🏠' },
    { id: 'features' as SectionType, label: 'Diferenciais', icon: '⭐' },
    { id: 'about' as SectionType, label: 'Sobre', icon: '📋' },
    { id: 'specialties' as SectionType, label: 'Especialidades', icon: '🎯' },
    { id: 'fiscal-benefits' as SectionType, label: 'Benefícios Fiscais', icon: '💰' },
    { id: 'fun-facts' as SectionType, label: 'Números', icon: '📊' },
    { id: 'certifications' as SectionType, label: 'Certificações', icon: '🏆' },
    { id: 'newsletter' as SectionType, label: 'Newsletter', icon: '📧' },
    { id: 'clients' as SectionType, label: 'Clientes', icon: '🏢' },
    { id: 'services' as SectionType, label: 'Serviços', icon: '💼' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3bb664] mb-4"></div>
          <div className="text-gray-500">Carregando dados...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
        {/* Hero Section */}
        {activeSection === 'hero' && (
          <div className="space-y-4">
            <AdminPageHeader
              title="Hero / Início"
              subtitle="Configure a seção principal da home page"
              onSave={handleSaveHero}
              saving={saving}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <Card>
                <CardHeader>
                  <CardTitle>Textos Principais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    label="Badge (Texto Superior)"
                    value={heroForm.badgeText}
                    onChange={(value) => setHeroForm({ ...heroForm, badgeText: value })}
                  />
                  <Input
                    label="Título - Linha 1"
                    value={heroForm.titleLine1}
                    onChange={(value) => setHeroForm({ ...heroForm, titleLine1: value })}
                  />
                  <Input
                    label="Título - Linha 2"
                    value={heroForm.titleLine2}
                    onChange={(value) => setHeroForm({ ...heroForm, titleLine2: value })}
                  />
                  <Textarea
                    label="Descrição"
                    value={heroForm.description}
                    onChange={(value) => setHeroForm({ ...heroForm, description: value })}
                    rows={4}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Botões de Ação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    label="Botão 1 - Texto"
                    value={heroForm.button1Text || ''}
                    onChange={(value) => setHeroForm({ ...heroForm, button1Text: value })}
                  />
                  <Input
                    label="Botão 1 - Link"
                    value={heroForm.button1Link || ''}
                    onChange={(value) => setHeroForm({ ...heroForm, button1Link: value })}
                  />
                  <Input
                    label="Botão 2 - Texto"
                    value={heroForm.button2Text || ''}
                    onChange={(value) => setHeroForm({ ...heroForm, button2Text: value })}
                  />
                  <Input
                    label="Botão 2 - Link"
                    value={heroForm.button2Link || ''}
                    onChange={(value) => setHeroForm({ ...heroForm, button2Link: value })}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Indicadores</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Indicator 1 */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">INDICADOR 1</h4>
                    <Input
                      label="Título do Indicador 1"
                      value={heroForm.indicator1Title || ''}
                      onChange={(value) => setHeroForm({ ...heroForm, indicator1Title: value })}
                      placeholder="Ex: Anos"
                    />
                    <Input
                      label="Valor do Indicador 1"
                      value={heroForm.indicator1Value || ''}
                      onChange={(value) => setHeroForm({ ...heroForm, indicator1Value: value })}
                      placeholder="Ex: 36+"
                    />
                  </div>
                  {/* Indicator 2 */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">INDICADOR 2</h4>
                    <Input
                      label="Título do Indicador 2"
                      value={heroForm.indicator2Title || ''}
                      onChange={(value) => setHeroForm({ ...heroForm, indicator2Title: value })}
                      placeholder="Ex: Clientes"
                    />
                    <Input
                      label="Valor do Indicador 2"
                      value={heroForm.indicator2Value || ''}
                      onChange={(value) => setHeroForm({ ...heroForm, indicator2Value: value })}
                      placeholder="Ex: 500+"
                    />
                  </div>
                  {/* Indicator 3 */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">INDICADOR 3</h4>
                    <Input
                      label="Título do Indicador 3"
                      value={heroForm.indicator3Title || ''}
                      onChange={(value) => setHeroForm({ ...heroForm, indicator3Title: value })}
                      placeholder="Ex: Associado"
                    />
                    <Input
                      label="Valor do Indicador 3"
                      value={heroForm.indicator3Value || ''}
                      onChange={(value) => setHeroForm({ ...heroForm, indicator3Value: value })}
                      placeholder="Ex: RNC"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ImageIcon className="mr-2 h-5 w-5" />
                    Imagens
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Imagem de Fundo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Imagem de Fundo
                    </label>
                    {heroForm.backgroundImageUrl ? (
                      <div className="space-y-2">
                        <img
                          src={heroForm.backgroundImageUrl}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded border"
                        />
                        <div className="flex gap-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleHeroImageUpload('background', e)}
                            className="hidden"
                            disabled={uploadingImage === 'background'}
                            id="hero-background-upload"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            disabled={uploadingImage === 'background'}
                            onClick={() => document.getElementById('hero-background-upload')?.click()}
                          >
                            {uploadingImage === 'background' ? 'Enviando...' : 'Trocar Imagem'}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteHeroImage('background')}
                            disabled={uploadingImage === 'background'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleHeroImageUpload('background', e)}
                          className="hidden"
                          disabled={uploadingImage === 'background'}
                          id="hero-background-upload-empty"
                        />
                        <div
                          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#3bb664] transition-colors"
                          onClick={() => document.getElementById('hero-background-upload-empty')?.click()}
                        >
                          {uploadingImage === 'background' ? (
                            <div className="flex flex-col items-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3bb664] mb-2"></div>
                              <span className="text-sm text-gray-600">Enviando...</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <Upload className="h-8 w-8 text-gray-400 mb-2" />
                              <p className="text-gray-600">Clique para fazer upload</p>
                              <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF ou WebP (máx. 5MB)</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Imagem do Hero (Lateral Direita) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Imagem do Hero (Lateral Direita)
                    </label>
                    {heroForm.heroImageUrl ? (
                      <div className="space-y-2">
                        <img
                          src={heroForm.heroImageUrl}
                          alt="Preview"
                          className="w-full h-64 object-contain rounded border"
                        />
                        <div className="flex gap-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleHeroImageUpload('hero', e)}
                            className="hidden"
                            disabled={uploadingImage === 'hero'}
                            id="hero-image-upload"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            disabled={uploadingImage === 'hero'}
                            onClick={() => document.getElementById('hero-image-upload')?.click()}
                          >
                            {uploadingImage === 'hero' ? 'Enviando...' : 'Trocar Imagem'}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteHeroImage('hero')}
                            disabled={uploadingImage === 'hero'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleHeroImageUpload('hero', e)}
                          className="hidden"
                          disabled={uploadingImage === 'hero'}
                          id="hero-image-upload-empty"
                        />
                        <div
                          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#3bb664] transition-colors"
                          onClick={() => document.getElementById('hero-image-upload-empty')?.click()}
                        >
                          {uploadingImage === 'hero' ? (
                            <div className="flex flex-col items-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3bb664] mb-2"></div>
                              <span className="text-sm text-gray-600">Enviando...</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <Upload className="h-8 w-8 text-gray-400 mb-2" />
                              <p className="text-gray-600">Clique para fazer upload</p>
                              <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF ou WebP (máx. 5MB)</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* About Section */}
        {activeSection === 'about' && (
          <div className="space-y-4">
            <AdminPageHeader
              title="Seção Sobre"
              subtitle="Configure a seção Sobre Nós"
              onSave={handleSaveAbout}
              saving={saving}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <Card>
                <CardHeader>
                  <CardTitle>Textos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    label="Badge"
                    value={aboutForm.badge_text}
                    onChange={(value) => setAboutForm({ ...aboutForm, badge_text: value })}
                  />
                  <Input
                    label="Título"
                    value={aboutForm.title}
                    onChange={(value) => setAboutForm({ ...aboutForm, title: value })}
                  />
                  <Input
                    label="Subtítulo"
                    value={aboutForm.subtitle || ''}
                    onChange={(value) => setAboutForm({ ...aboutForm, subtitle: value })}
                  />
                  <Textarea
                    label="Descrição"
                    value={aboutForm.description}
                    onChange={(value) => setAboutForm({ ...aboutForm, description: value })}
                    rows={6}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Indicadores</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-700 mb-3">INDICADOR 1</h4>
                    <Input
                      label="Título"
                      value={aboutForm.indicator1_title || ''}
                      onChange={(value) => setAboutForm({ ...aboutForm, indicator1_title: value })}
                      placeholder="Ex: Anos"
                    />
                    <Input
                      label="Valor"
                      value={aboutForm.indicator1_value || ''}
                      onChange={(value) => setAboutForm({ ...aboutForm, indicator1_value: value })}
                      placeholder="Ex: 34+"
                    />
                  </div>
                  
                  <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-700 mb-3">INDICADOR 2</h4>
                    <Input
                      label="Título"
                      value={aboutForm.indicator2_title || ''}
                      onChange={(value) => setAboutForm({ ...aboutForm, indicator2_title: value })}
                      placeholder="Ex: Clientes"
                    />
                    <Input
                      label="Valor"
                      value={aboutForm.indicator2_value || ''}
                      onChange={(value) => setAboutForm({ ...aboutForm, indicator2_value: value })}
                      placeholder="Ex: 500+"
                    />
                  </div>
                  
                  <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-700 mb-3">INDICADOR 3</h4>
                    <Input
                      label="Título"
                      value={aboutForm.indicator3_title || ''}
                      onChange={(value) => setAboutForm({ ...aboutForm, indicator3_title: value })}
                      placeholder="Ex: Rede"
                    />
                    <Input
                      label="Valor"
                      value={aboutForm.indicator3_value || ''}
                      onChange={(value) => setAboutForm({ ...aboutForm, indicator3_value: value })}
                      placeholder="Ex: RNC"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <ImageIcon className="mr-2 h-5 w-5" />
                      Carrossel de Imagens
                    </span>
                    <Button
                      onClick={() => {
                        setAboutImageForm({ description: '', order: aboutImages.length });
                        setEditingAboutImage(null);
                        setSelectedImageFile(null);
                        setImagePreviewUrl(null);
                        setIsClosingImageModal(false);
                        setShowAboutImageModal(true);
                      }}
                      size="sm"
                      className="bg-[#3bb664] hover:bg-[#2d9a4f] text-white"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Imagem
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {aboutImages.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Nenhuma imagem no carrossel</p>
                      <p className="text-sm text-gray-500 mt-1">Clique em "Adicionar Imagem" para começar</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {aboutImages.map((image) => {
                        const imageUrl = image.image_url?.startsWith('http') 
                          ? image.image_url 
                          : `http://localhost:3006${image.image_url}`;
                        return (
                          <div key={image.id} className="relative group border border-gray-200 rounded-lg overflow-hidden">
                            <img
                              src={imageUrl}
                              alt={image.description || 'Imagem do carrossel'}
                              className="w-full h-48 object-cover"
                            />
                            <div className="p-3 bg-white">
                              <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                                {image.description || 'Sem descrição'}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">Ordem: {image.order}</span>
                                <div className="flex space-x-1">
                                  <button
                                    onClick={() => {
                                      setEditingAboutImage(image);
                                      setAboutImageForm({ description: image.description || '', order: image.order });
                                      setSelectedImageFile(null);
                                      setImagePreviewUrl(null);
                                      setIsClosingImageModal(false);
                        setShowAboutImageModal(true);
                                    }}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                    title="Editar"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={async () => {
                                      if (confirm('Tem certeza que deseja excluir esta imagem?')) {
                                        try {
                                          const token = localStorage.getItem('token');
                                          const response = await fetch(`${baseUrl}/about/images/${image.id}`, {
                                            method: 'DELETE',
                                            headers: { 'Authorization': `Bearer ${token}` },
                                          });
                                          const result = await response.json();
                                          if (result.success) {
                                            toast.success('Imagem removida com sucesso!');
                                            loadSectionData('about');
                                          } else {
                                            toast.error(result.error || 'Erro ao remover imagem');
                                          }
                                        } catch (error) {
                                          console.error('Erro ao remover imagem:', error);
                                          toast.error('Erro ao remover imagem');
                                        }
                                      }
                                    }}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="Excluir"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ImageIcon className="mr-2 h-5 w-5" />
                    Imagem de Fundo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <label className="block cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload('about', e)}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                    {aboutForm.background_image_url ? (
                      <div className="space-y-2">
                        <img
                          src={aboutForm.background_image_url}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded border"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={(e) => {
                            e.preventDefault();
                            const input = e.currentTarget.parentElement?.parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
                            input?.click();
                          }}
                          disabled={uploadingImage}
                        >
                          {uploadingImage ? 'Enviando...' : 'Trocar Imagem'}
                        </Button>
                      </div>
                    ) : (
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#3bb664] transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          const input = e.currentTarget.parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
                          if (!uploadingImage) input?.click();
                        }}
                      >
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <span className="text-sm text-gray-600">Clique para fazer upload</span>
                      </div>
                    )}
                  </label>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Newsletter Section */}
        {activeSection === 'newsletter' && (
          <div className="space-y-4">
            <AdminPageHeader
              title="Seção Newsletter"
              subtitle="Configure a seção de Newsletter"
              onSave={handleSaveNewsletter}
              saving={saving}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <Card>
                <CardHeader>
                  <CardTitle>Textos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    label="Título"
                    value={newsletterForm.title}
                    onChange={(value) => setNewsletterForm({ ...newsletterForm, title: value })}
                  />
                  <Input
                    label="Subtítulo"
                    value={newsletterForm.subtitle || ''}
                    onChange={(value) => setNewsletterForm({ ...newsletterForm, subtitle: value })}
                  />
                  <Textarea
                    label="Descrição"
                    value={newsletterForm.description || ''}
                    onChange={(value) => setNewsletterForm({ ...newsletterForm, description: value })}
                    rows={4}
                  />
                  <Input
                    label="Texto do Botão"
                    value={newsletterForm.button_text || ''}
                    onChange={(value) => setNewsletterForm({ ...newsletterForm, button_text: value })}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ImageIcon className="mr-2 h-5 w-5" />
                    Imagem de Fundo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <label className="block cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload('newsletter', e)}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                    {newsletterForm.background_image_url ? (
                      <div className="space-y-2">
                        <img
                          src={newsletterForm.background_image_url}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded border"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={(e) => {
                            e.preventDefault();
                            const input = e.currentTarget.parentElement?.parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
                            input?.click();
                          }}
                          disabled={uploadingImage}
                        >
                          {uploadingImage ? 'Enviando...' : 'Trocar Imagem'}
                        </Button>
                      </div>
                    ) : (
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#3bb664] transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          const input = e.currentTarget.parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
                          if (!uploadingImage) input?.click();
                        }}
                      >
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <span className="text-sm text-gray-600">Clique para fazer upload</span>
                      </div>
                    )}
                  </label>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Clients Section */}
        {activeSection === 'clients' && (
          <div className="space-y-4">
            <AdminPageHeader
              title="Seção Clientes"
              subtitle="Configure a seção de Clientes"
              onSave={handleSaveClients}
              saving={saving}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações da Seção</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título
                    </label>
                    <Input
                      value={clientsForm.title}
                      onChange={(e) => setClientsForm({ ...clientsForm, title: e.target.value })}
                      placeholder="Empresas que Confiam em Nosso Trabalho"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ImageIcon className="mr-2 h-5 w-5" />
                    Imagem de Fundo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <label className="block cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload('clients', e)}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                    {clientsForm.background_image_url ? (
                      <div className="space-y-2">
                        <img
                          src={clientsForm.background_image_url}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded border"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={(e) => {
                            e.preventDefault();
                            const input = e.currentTarget.parentElement?.parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
                            input?.click();
                          }}
                          disabled={uploadingImage}
                        >
                          {uploadingImage ? 'Enviando...' : 'Trocar Imagem'}
                        </Button>
                      </div>
                    ) : (
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#3bb664] transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          const input = e.currentTarget.parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
                          if (!uploadingImage) input?.click();
                        }}
                      >
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <span className="text-sm text-gray-600">Clique para fazer upload</span>
                      </div>
                    )}
                  </label>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Services Section */}
        {activeSection === 'services' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Seção de Serviços</h1>
                <p className="text-gray-600 mt-1">Configure os textos e imagem de fundo da seção de serviços</p>
              </div>
              <Button
                onClick={handleSaveServices}
                disabled={saving}
                className="bg-[#3bb664] hover:bg-[#2d9a4f] text-white"
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Textos da Seção</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Badge (Texto Superior)
                    </label>
                    <Input
                      value={servicesForm.badge_text}
                      onChange={(value) => setServicesForm({ ...servicesForm, badge_text: value })}
                      placeholder="Nossos Serviços"
                      className="bg-white text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título - Linha 1
                    </label>
                    <Input
                      value={servicesForm.title_line1}
                      onChange={(value) => setServicesForm({ ...servicesForm, title_line1: value })}
                      placeholder="Nossas Soluções Vão"
                      className="bg-white text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título - Linha 2
                    </label>
                    <Input
                      value={servicesForm.title_line2}
                      onChange={(value) => setServicesForm({ ...servicesForm, title_line2: value })}
                      placeholder="Além da Contabilidade"
                      className="bg-white text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição
                    </label>
                    <Textarea
                      value={servicesForm.description}
                      onChange={(value) => setServicesForm({ ...servicesForm, description: value })}
                      placeholder="Atuamos de forma integrada e estratégica para que o seu negócio tenha a melhor performance contábil, fiscal e tributária com 34 anos de experiência."
                      rows={4}
                      className="bg-white text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Anos Destacado
                    </label>
                    <Input
                      value={servicesForm.years_highlight}
                      onChange={(value) => setServicesForm({ ...servicesForm, years_highlight: value })}
                      placeholder="34"
                      className="bg-white text-gray-900 placeholder:text-gray-400"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Este número será destacado em laranja na descrição (ex: "34 anos")
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ImageIcon className="mr-2 h-5 w-5" />
                    Imagem de Fundo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <label className="block cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload('services', e)}
                      className="hidden"
                      disabled={uploadingImage === 'services'}
                    />
                    {servicesForm.background_image_url ? (
                      <div className="space-y-2">
                        <img
                          src={servicesForm.background_image_url}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded border"
                        />
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={(e) => {
                              e.preventDefault();
                              const input = e.currentTarget.parentElement?.parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
                              input?.click();
                            }}
                            disabled={uploadingImage === 'services'}
                            className="flex-1"
                          >
                            {uploadingImage === 'services' ? 'Enviando...' : 'Trocar Imagem'}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={async () => {
                              try {
                                await apiService.deleteServicesImage();
                                setServicesForm(prev => ({ ...prev, background_image_url: '' }));
                                toast.success('Imagem removida com sucesso!');
                              } catch (error: any) {
                                toast.error(error.message || 'Erro ao remover imagem');
                              }
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#3bb664] transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          const input = e.currentTarget.parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
                          if (uploadingImage !== 'services') input?.click();
                        }}
                      >
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <span className="text-sm text-gray-600">Clique para fazer upload</span>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG ou GIF até 5MB</p>
                      </div>
                    )}
                  </label>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Features, Specialties, Fiscal Benefits, Fun Facts, Certifications - List Management */}
        {(activeSection === 'features' || activeSection === 'specialties' || activeSection === 'fiscal-benefits' || activeSection === 'fun-facts' || activeSection === 'certifications') && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {sections.find(s => s.id === activeSection)?.label}
                </h1>
                <p className="text-gray-600 mt-1">Gerencie os itens desta seção</p>
              </div>
              <Button
                onClick={() => {
                  resetForm(activeSection as any);
                  setShowModal(true);
                }}
                className="bg-[#3bb664] hover:bg-[#2d9a4f] text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Novo Item
              </Button>
            </div>

            {/* Lista de Itens */}
            <Card>
              <CardContent className="p-6">
                {(() => {
                  const items = activeSection === 'features' ? features :
                               activeSection === 'specialties' ? specialties :
                               activeSection === 'fiscal-benefits' ? fiscalBenefits :
                               activeSection === 'fun-facts' ? funFacts :
                               certifications;
                  
                  if (items.length === 0) {
                    return (
                      <div className="text-center py-8">
                        <p className="text-gray-600">Nenhum item cadastrado</p>
                        <p className="text-sm text-gray-500 mt-1">Clique em "Novo Item" para adicionar</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                          <div className="flex items-center space-x-4">
                            {item.icon && (
                              <div className="w-10 h-10 bg-[#3bb664] bg-opacity-10 rounded-lg flex items-center justify-center">
                                {renderIcon(item.icon)}
                              </div>
                            )}
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {item.title || item.name || item.label}
                              </h3>
                              <p className="text-sm text-gray-600 line-clamp-1">
                                {item.description}
                              </p>
                              {item.value && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Valor: {item.value}{item.suffix}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {activeSection === 'fiscal-benefits' && (
                              <label className="cursor-pointer">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleFiscalBenefitImageUpload(item.id, e)}
                                  className="hidden"
                                  disabled={uploadingFiscalBenefitImage === item.id}
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    const input = e.currentTarget.parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
                                    if (uploadingFiscalBenefitImage !== item.id) input?.click();
                                  }}
                                  disabled={uploadingFiscalBenefitImage === item.id}
                                  title="Upload de imagem"
                                >
                                  {uploadingFiscalBenefitImage === item.id ? (
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                                  ) : (
                                    <ImageIcon className="h-3 w-3" />
                                  )}
                                </Button>
                              </label>
                            )}
                            <button
                              onClick={() => handleToggleStatus(activeSection as any, { ...item, is_active: !item.is_active })}
                              className={`px-2.5 py-1.5 rounded-full text-xs font-medium ${
                                item.is_active
                                  ? 'text-white'
                                  : 'bg-red-100 text-red-800'
                              }`}
                              style={item.is_active ? { backgroundColor: '#3bb664' } : {}}
                            >
                              {item.is_active ? 'Ativo' : 'Inativo'}
                            </button>
                            <button
                              onClick={() => handleEdit(activeSection as any, item)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(activeSection as any, item.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Modal de Edição/Criação */}
            {showModal && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop"
                onClick={(e) => {
                  // Só fecha se o clique for diretamente no backdrop (fora do card)
                  if (e.target === e.currentTarget) {
                    handleCloseModal();
                  }
                }}
              >
                <Card
                  className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto modal-content ${isClosing ? 'closing' : ''}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <CardHeader>
                    <CardTitle>
                      {(() => {
                        const editing = activeSection === 'features' ? editingFeature :
                                       activeSection === 'specialties' ? editingSpecialty :
                                       activeSection === 'fiscal-benefits' ? editingFiscalBenefit :
                                       activeSection === 'fun-facts' ? editingFunFact :
                                       editingCertification;
                        return editing ? 'Editar Item' : 'Novo Item';
                      })()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {activeSection === 'features' && (
                      <>
                        <IconSelect
                          label="Ícone"
                          value={featureForm.icon}
                          onChange={(value) => setFeatureForm({ ...featureForm, icon: value })}
                        />
                        <Input
                          label="Título"
                          value={featureForm.title}
                          onChange={(value) => setFeatureForm({ ...featureForm, title: value })}
                        />
                        <Textarea
                          label="Descrição"
                          value={featureForm.description}
                          onChange={(value) => setFeatureForm({ ...featureForm, description: value })}
                          rows={3}
                        />
                        <Input
                          label="Ordem"
                          type="number"
                          value={featureForm.order.toString()}
                          onChange={(value) => setFeatureForm({ ...featureForm, order: parseInt(value) || 0 })}
                        />
                      </>
                    )}

                    {activeSection === 'specialties' && (
                      <>
                        <IconSelect
                          label="Ícone"
                          value={specialtyForm.icon}
                          onChange={(value) => setSpecialtyForm({ ...specialtyForm, icon: value })}
                        />
                        <Input
                          label="Nome"
                          value={specialtyForm.name}
                          onChange={(value) => setSpecialtyForm({ ...specialtyForm, name: value })}
                        />
                        <Textarea
                          label="Descrição"
                          value={specialtyForm.description}
                          onChange={(value) => setSpecialtyForm({ ...specialtyForm, description: value })}
                          rows={3}
                        />
                        <Input
                          label="Ordem"
                          type="number"
                          value={specialtyForm.order.toString()}
                          onChange={(value) => setSpecialtyForm({ ...specialtyForm, order: parseInt(value) || 0 })}
                        />
                      </>
                    )}

                    {activeSection === 'fiscal-benefits' && (
                      <>
                        <IconSelect
                          label="Ícone"
                          value={fiscalBenefitForm.icon}
                          onChange={(value) => setFiscalBenefitForm({ ...fiscalBenefitForm, icon: value })}
                        />
                        <Input
                          label="Nome"
                          value={fiscalBenefitForm.name}
                          onChange={(value) => {
                            setFiscalBenefitForm({ 
                              ...fiscalBenefitForm, 
                              name: value,
                              // Gerar slug automaticamente se estiver vazio
                              slug: fiscalBenefitForm.slug || value
                                .toLowerCase()
                                .normalize('NFD')
                                .replace(/[\u0300-\u036f]/g, '')
                                .replace(/[^a-z0-9]+/g, '-')
                                .replace(/^-+|-+$/g, '')
                            });
                          }}
                        />
                        <Input
                          label="Slug (URL amigável)"
                          value={fiscalBenefitForm.slug}
                          onChange={(value) => setFiscalBenefitForm({ ...fiscalBenefitForm, slug: value })}
                          placeholder="ex: compete-es"
                        />
                        <Textarea
                          label="Descrição (resumo curto)"
                          value={fiscalBenefitForm.description}
                          onChange={(value) => setFiscalBenefitForm({ ...fiscalBenefitForm, description: value })}
                          rows={3}
                        />
                        <Textarea
                          label="Excerpt (texto de destaque)"
                          value={fiscalBenefitForm.excerpt}
                          onChange={(value) => setFiscalBenefitForm({ ...fiscalBenefitForm, excerpt: value })}
                          rows={2}
                        />
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Conteúdo Detalhado (HTML)</label>
                          <RichTextEditor
                            value={fiscalBenefitForm.content || ''}
                            onChange={(value) =>
                              setFiscalBenefitForm({ ...fiscalBenefitForm, content: value })
                            }
                            placeholder="Digite o conteúdo detalhado em HTML..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Imagem de Destaque</label>
                          <label className="block cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                if (editingFiscalBenefit) {
                                  handleFiscalBenefitImageUpload(editingFiscalBenefit.id, e);
                                }
                              }}
                              className="hidden"
                              disabled={uploadingFiscalBenefitImage === editingFiscalBenefit?.id}
                            />
                            {fiscalBenefitForm.featured_image_url ? (
                              <div className="space-y-2">
                                <img
                                  src={fiscalBenefitForm.featured_image_url.startsWith('http') 
                                    ? fiscalBenefitForm.featured_image_url 
                                    : `http://localhost:3006${fiscalBenefitForm.featured_image_url}`}
                                  alt="Preview"
                                  className="w-full h-48 object-cover rounded border"
                                />
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      const input = e.currentTarget.parentElement?.parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
                                      if (uploadingFiscalBenefitImage !== editingFiscalBenefit?.id) input?.click();
                                    }}
                                    disabled={uploadingFiscalBenefitImage === editingFiscalBenefit?.id || !editingFiscalBenefit}
                                  >
                                    {uploadingFiscalBenefitImage === editingFiscalBenefit?.id ? 'Enviando...' : 'Trocar Imagem'}
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setFiscalBenefitForm({ ...fiscalBenefitForm, featured_image_url: '' })}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    Remover
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div 
                                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#3bb664] transition-colors"
                                onClick={(e) => {
                                  e.preventDefault();
                                  const input = e.currentTarget.parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
                                  if (uploadingFiscalBenefitImage !== editingFiscalBenefit?.id && editingFiscalBenefit) input?.click();
                                }}
                              >
                                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">Clique para fazer upload da imagem</p>
                                <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF ou WebP (máx. 5MB)</p>
                                {!editingFiscalBenefit && (
                                  <p className="text-xs text-red-500 mt-2">Salve o item primeiro para fazer upload</p>
                                )}
                              </div>
                            )}
                          </label>
                          <div className="mt-2">
                            <Input
                              label="Ou cole a URL da imagem"
                              value={fiscalBenefitForm.featured_image_url}
                              onChange={(value) => setFiscalBenefitForm({ ...fiscalBenefitForm, featured_image_url: value })}
                              placeholder="https://..."
                            />
                          </div>
                        </div>
                        <Input
                          label="Ordem"
                          type="number"
                          value={fiscalBenefitForm.order.toString()}
                          onChange={(value) => setFiscalBenefitForm({ ...fiscalBenefitForm, order: parseInt(value) || 0 })}
                        />
                      </>
                    )}

                    {activeSection === 'fun-facts' && (
                      <>
                        <IconSelect
                          label="Ícone"
                          value={funFactForm.icon}
                          onChange={(value) => setFunFactForm({ ...funFactForm, icon: value })}
                        />
                        <Input
                          label="Label"
                          value={funFactForm.label}
                          onChange={(value) => setFunFactForm({ ...funFactForm, label: value })}
                        />
                        <Input
                          label="Valor"
                          value={funFactForm.value}
                          onChange={(value) => setFunFactForm({ ...funFactForm, value: value })}
                        />
                        <Input
                          label="Sufixo (ex: +, %)"
                          value={funFactForm.suffix || ''}
                          onChange={(value) => setFunFactForm({ ...funFactForm, suffix: value })}
                        />
                        <Input
                          label="Ordem"
                          type="number"
                          value={funFactForm.order.toString()}
                          onChange={(value) => setFunFactForm({ ...funFactForm, order: parseInt(value) || 0 })}
                        />
                      </>
                    )}

                    {activeSection === 'certifications' && (
                      <>
                        <IconSelect
                          label="Ícone"
                          value={certificationForm.icon}
                          onChange={(value) => setCertificationForm({ ...certificationForm, icon: value })}
                        />
                        <Input
                          label="Nome"
                          value={certificationForm.name}
                          onChange={(value) => setCertificationForm({ ...certificationForm, name: value })}
                        />
                        <Input
                          label="Sigla/Acrônimo"
                          value={certificationForm.acronym || ''}
                          onChange={(value) => setCertificationForm({ ...certificationForm, acronym: value })}
                        />
                        <Textarea
                          label="Descrição"
                          value={certificationForm.description}
                          onChange={(value) => setCertificationForm({ ...certificationForm, description: value })}
                          rows={3}
                        />
                        <Input
                          label="Ordem"
                          type="number"
                          value={certificationForm.order.toString()}
                          onChange={(value) => setCertificationForm({ ...certificationForm, order: parseInt(value) || 0 })}
                        />
                      </>
                    )}

                    <div className="flex justify-end space-x-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => resetForm(activeSection as any)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={() => {
                          const editing = activeSection === 'features' ? editingFeature :
                                         activeSection === 'specialties' ? editingSpecialty :
                                         activeSection === 'fiscal-benefits' ? editingFiscalBenefit :
                                         activeSection === 'fun-facts' ? editingFunFact :
                                         editingCertification;
                          if (editing) {
                            handleUpdateItem(activeSection as any, editing.id);
                          } else {
                            handleCreateItem(activeSection as any);
                          }
                        }}
                        disabled={saving}
                        className="bg-[#3bb664] hover:bg-[#2d9a4f] text-white"
                      >
                        {saving ? 'Salvando...' : editingFeature || editingSpecialty || editingFiscalBenefit || editingFunFact || editingCertification ? 'Atualizar' : 'Criar'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Modal para Carrossel de Imagens do About */}
        {showAboutImageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop" onClick={handleCloseImageModal}>
            <Card 
              className={`w-full max-w-2xl modal-content ${isClosingImageModal ? 'closing' : ''}`}
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader>
                <CardTitle>{editingAboutImage ? 'Editar Imagem' : 'Adicionar Imagem ao Carrossel'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!editingAboutImage && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Imagem *</label>
                    <label className="block cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileSelect}
                        className="hidden"
                        disabled={uploadingAboutImage}
                      />
                      {imagePreviewUrl ? (
                        <div className="relative">
                          <img
                            src={imagePreviewUrl}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedImageFile(null);
                              setImagePreviewUrl(null);
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#3bb664] transition-colors">
                          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Clique para selecionar uma imagem</p>
                          <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF ou WebP (máx. 5MB)</p>
                        </div>
                      )}
                    </label>
                  </div>
                )}
                {editingAboutImage && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Imagem Atual</label>
                    <img
                      src={editingAboutImage.image_url?.startsWith('http') 
                        ? editingAboutImage.image_url 
                        : `http://localhost:3006${editingAboutImage.image_url}`}
                      alt={editingAboutImage.description || 'Imagem'}
                      className="w-full h-48 object-cover rounded border"
                    />
                  </div>
                )}
                <Textarea
                  label="Descrição"
                  value={aboutImageForm.description}
                  onChange={(value) => setAboutImageForm({ ...aboutImageForm, description: value })}
                  rows={3}
                  placeholder="Descreva a imagem (opcional)"
                />
                <Input
                  label="Ordem"
                  type="number"
                  value={aboutImageForm.order.toString()}
                  onChange={(value) => setAboutImageForm({ ...aboutImageForm, order: parseInt(value) || 0 })}
                />
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleCloseImageModal}
                  >
                    Cancelar
                  </Button>
                  {editingAboutImage ? (
                    <Button
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem('token');
                          const response = await fetch(`${baseUrl}/about/images/${editingAboutImage.id}`, {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                              description: aboutImageForm.description,
                              order: parseInt(aboutImageForm.order.toString()),
                              is_active: true
                            }),
                          });
                          const result = await response.json();
                          if (result.success) {
                            toast.success('Imagem atualizada com sucesso!');
                            setShowAboutImageModal(false);
                            setEditingAboutImage(null);
                            setAboutImageForm({ description: '', order: 0 });
                            loadSectionData('about');
                          } else {
                            toast.error(result.error || 'Erro ao atualizar imagem');
                          }
                        } catch (error) {
                          console.error('Erro ao atualizar imagem:', error);
                          toast.error('Erro ao atualizar imagem');
                        }
                      }}
                      className="bg-[#3bb664] hover:bg-[#2d9a4f] text-white"
                    >
                      Atualizar
                    </Button>
                  ) : (
                    <Button
                      onClick={handleAboutImageSubmit}
                      disabled={uploadingAboutImage || !selectedImageFile}
                      className="bg-[#3bb664] hover:bg-[#2d9a4f] text-white"
                    >
                      {uploadingAboutImage ? 'Enviando...' : 'Adicionar'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
    </div>
  );
}
