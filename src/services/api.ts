import { 
  Slide, 
  Service, 
  Testimonial, 
  Configuration, 
  ContactRequest, 
  LoginRequest, 
  AuthResponse,
  SendCodeRequest,
  VerifyCodeRequest,
  SendCodeResponse,
  VerifyCodeResponse,
  User,
  CreateUserRequest,
  UpdateUserRequest,
  Hero,
  UpdateHeroRequest,
  LoginPage,
  UpdateLoginPageRequest,
  NewsletterSubscription,
  Client,
  CreateClientRequest,
  Feature,
  UpdateClientRequest,
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  Tag,
  CreateTagRequest,
  UpdateTagRequest
} from '../types';

// Em desenvolvimento, usar o proxy do Vite (/api)
// Em produção, usar a variável de ambiente ou fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'http://localhost:3006/api');

class ApiService {
  private toUser(db: any): User {
    return {
      id: db.id,
      email: db.email,
      name: db.name,
      createdAt: db.createdAt || db.created_at || new Date(),
      updatedAt: db.updatedAt || db.updated_at || new Date(),
    };
  }

  private toService(db: any): Service {
    if (!db) return null as any;
    
    return {
      id: db.id || '',
      name: db.name || '',
      slug: db.slug || db.id || '',
      description: db.description || '',
      content: db.content || undefined,
      icon: db.icon || undefined,
      imageUrl: db.image_url || db.imageUrl || undefined,
      image_url: db.image_url || db.imageUrl || undefined,
      order: db.order ?? 0,
      isActive: db.is_active !== undefined ? db.is_active : (db.isActive !== undefined ? db.isActive : true),
      is_active: db.is_active !== undefined ? db.is_active : (db.isActive !== undefined ? db.isActive : true),
      createdAt: db.created_at ? new Date(db.created_at) : (db.createdAt ? new Date(db.createdAt) : new Date()),
      created_at: db.created_at || db.createdAt,
      updatedAt: db.updated_at ? new Date(db.updated_at) : (db.updatedAt ? new Date(db.updatedAt) : new Date()),
      updated_at: db.updated_at || db.updatedAt,
    };
  }

  private toSlide(db: any): Slide {
    return {
      id: db.id,
      title: db.title,
      subtitle: db.subtitle,
      imageUrl: db.image_url,
      buttonText: db.button_text,
      buttonLink: db.button_link,
      order: db.order,
      isActive: db.is_active,
      createdAt: new Date(db.created_at),
      updatedAt: new Date(db.updated_at),
    };
  }

  private toTestimonial(db: any): Testimonial {
    return {
      id: db.id,
      clientName: db.client_name,
      company: db.company,
      testimonialText: db.testimonial_text,
      clientImageUrl: db.client_image_url,
      mediaType: db.media_type || (db.client_image_url ? 'image' : undefined),
      mediaUrl: db.media_url || db.client_image_url,
      order: db.order,
      isActive: db.is_active,
      createdAt: new Date(db.created_at),
      updatedAt: new Date(db.updated_at),
    };
  }
  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const headers = {
        ...this.getHeaders(),
        ...options.headers,
      };
      
      console.log(`📡 Requisição: ${options.method || 'GET'} ${url}`);
      console.log('📡 Headers:', headers);
      
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log(`📡 Resposta: ${response.status} ${response.statusText}`);

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        // Cria um erro com informações da resposta
        const error: any = new Error(data.error || data.message || 'Erro na requisição');
        error.response = { data };
        error.status = response.status;
        console.error(`❌ Erro na requisição ${endpoint}:`, error);
        throw error;
      }
      
      console.log(`✅ Sucesso na requisição ${endpoint}:`, data);

      return data;
    } catch (error: any) {
      // Se já é um erro criado acima, apenas propaga
      if (error.response) {
        throw error;
      }
      // Erro de rede ou outro erro
      console.error('Erro na requisição:', error);
      throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
    }
  }

  // Auth
  async login(data: LoginRequest): Promise<AuthResponse> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async sendCode(data: SendCodeRequest): Promise<SendCodeResponse> {
    try {
      const response = await this.request<SendCodeResponse>('/auth/send-code', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      console.log('📧 Resposta sendCode (tipo):', typeof response);
      console.log('📧 Resposta sendCode (success):', response?.success);
      console.log('📧 Resposta sendCode completa:', JSON.stringify(response, null, 2));
      
      // Garante que a resposta tenha o formato correto
      if (response && typeof response === 'object') {
        return {
          success: response.success === true || response.success === 'true',
          message: response.message || '',
          email: response.email || data.email
        };
      }
      
      return response;
    } catch (error: any) {
      console.error('❌ Erro em sendCode:', error);
      throw error;
    }
  }

  async verifyCode(data: VerifyCodeRequest): Promise<VerifyCodeResponse> {
    return this.request('/auth/verify-code', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMe() {
    return this.request('/auth/me');
  }

  // Users
  async getUsers(): Promise<{ users: User[] }> {
    try {
      const resp = await this.request<any>('/users');
      console.log('📋 Resposta bruta getUsers:', resp);
      
      // Verificar se a resposta tem a estrutura esperada
      if (!resp || !resp.users) {
        console.warn('⚠️ Resposta inesperada:', resp);
        return { users: [] };
      }
      
      // A API já retorna os dados normalizados, mas vamos garantir compatibilidade
      const users = (resp.users || []).map((u: any) => ({
        id: u.id,
        email: u.email || '',
        name: u.name || '',
        createdAt: u.createdAt || u.created_at || new Date(),
        updatedAt: u.updatedAt || u.updated_at || new Date(),
      }));
      console.log('📋 Usuários normalizados:', users);
      return { users };
    } catch (error: any) {
      console.error('❌ Erro em getUsers:', error);
      console.error('❌ Detalhes do erro:', {
        message: error?.message,
        status: error?.status,
        response: error?.response,
      });
      throw error;
    }
  }

  async createUser(user: CreateUserRequest): Promise<{ success: boolean; message: string; user: User }> {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  async updateUser(id: string, user: UpdateUserRequest): Promise<{ success: boolean; message: string; user: User }> {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    });
  }

  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Slides
  async getSlides(): Promise<{ slides: Slide[] }> {
    const resp = await this.request<any>('/slides');
    return { slides: (resp.slides || []).map((s: any) => this.toSlide(s)) };
  }

  async getAllSlides(): Promise<{ slides: Slide[] }> {
    const resp = await this.request<any>('/slides/all');
    return { slides: (resp.slides || []).map((s: any) => this.toSlide(s)) };
  }

  async createSlide(formData: FormData): Promise<{ slide: Slide }> {
    const resp = await this.request<any>('/slides', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set content-type for multipart
    });
    return { slide: this.toSlide(resp.slide) };
  }

  async updateSlide(id: string, formData: FormData): Promise<{ slide: Slide }> {
    const resp = await this.request<any>(`/slides/${id}`, {
      method: 'PUT',
      body: formData,
      headers: {}, // Let browser set content-type for multipart
    });
    return { slide: this.toSlide(resp.slide) };
  }

  async deleteSlide(id: string): Promise<{ message: string }> {
    return this.request(`/slides/${id}`, {
      method: 'DELETE',
    });
  }

  // Services
  async getServices(): Promise<{ services: Service[] }> {
    try {
      const resp = await this.request<any>('/services');
      const services = (resp.services || []).map((s: any) => this.toService(s)).filter((s: Service) => s !== null);
      return { services };
    } catch (error) {
      console.error('Error fetching services:', error);
      return { services: [] };
    }
  }

  async getAllServices(): Promise<{ services: Service[] }> {
    try {
      const resp = await this.request<any>('/services/all');
      const services = (resp.services || []).map((s: any) => this.toService(s)).filter((s: Service) => s !== null);
      return { services };
    } catch (error) {
      console.error('Error fetching all services:', error);
      return { services: [] };
    }
  }

  async createService(service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ service: Service }> {
    const resp = await this.request<any>('/services', {
      method: 'POST',
      body: JSON.stringify(service),
    });
    return { service: this.toService(resp.service) };
  }

  async updateService(id: string, service: Partial<Omit<Service, 'id' | 'createdAt' | 'updatedAt'>>): Promise<{ service: Service }> {
    const resp = await this.request<any>(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(service),
    });
    return { service: this.toService(resp.service) };
  }

  async deleteService(id: string): Promise<{ message: string }> {
    return this.request(`/services/${id}`, {
      method: 'DELETE',
    });
  }

  // Testimonials
  async getTestimonials(): Promise<{ testimonials: Testimonial[] }> {
    const resp = await this.request<any>('/testimonials');
    return { testimonials: (resp.testimonials || []).map((t: any) => this.toTestimonial(t)) };
  }

  async getAllTestimonials(): Promise<{ testimonials: Testimonial[] }> {
    const resp = await this.request<any>('/testimonials/all');
    return { testimonials: (resp.testimonials || []).map((t: any) => this.toTestimonial(t)) };
  }

  async createTestimonial(testimonial: Omit<Testimonial, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ testimonial: Testimonial }> {
    const resp = await this.request<any>('/testimonials', {
      method: 'POST',
      body: JSON.stringify(testimonial),
    });
    return { testimonial: this.toTestimonial(resp.testimonial) };
  }

  async updateTestimonial(id: string, testimonial: Partial<Omit<Testimonial, 'id' | 'createdAt' | 'updatedAt'>>): Promise<{ testimonial: Testimonial }> {
    const resp = await this.request<any>(`/testimonials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(testimonial),
    });
    return { testimonial: this.toTestimonial(resp.testimonial) };
  }

  async deleteTestimonial(id: string): Promise<{ message: string }> {
    return this.request(`/testimonials/${id}`, {
      method: 'DELETE',
    });
  }

  async uploadTestimonialMedia(id: string, file: File, mediaType: 'image' | 'video'): Promise<{ data: { url: string }, testimonial: Testimonial }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mediaType', mediaType);

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/testimonials/${id}/media`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao fazer upload');
    }

    const resp = await response.json();
    return { data: resp.data, testimonial: this.toTestimonial(resp.testimonial) };
  }

  // Configuration
  async getConfiguration(): Promise<{ configuration: Configuration }> {
    const response = await this.request<any>('/configurations');
    const data = response.configuration || response;
    
    // Normalizar dados do backend (snake_case) para o formato do frontend
    const normalized: Configuration = {
      id: data.id || 'default',
      companyName: data.company_name || data.companyName || 'Central Contábil',
      company_name: data.company_name || data.companyName,
      phone: data.phone,
      email: data.email,
      contact_email: data.contact_email || data.contactEmail,
      contactEmail: data.contact_email || data.contactEmail,
      address: data.address,
      businessHours: data.business_hours || data.businessHours,
      business_hours: data.business_hours || data.businessHours,
      facebookUrl: data.facebook_url || data.facebookUrl,
      facebook_url: data.facebook_url || data.facebookUrl,
      instagramUrl: data.instagram_url || data.instagramUrl,
      instagram_url: data.instagram_url || data.instagramUrl,
      linkedinUrl: data.linkedin_url || data.linkedinUrl,
      linkedin_url: data.linkedin_url || data.linkedinUrl,
      logo_url: data.logo_url,
      logo_dark_url: data.logo_dark_url,
      favicon_url: data.favicon_url,
      whatsappNumber: data.whatsapp_number || data.whatsappNumber,
      whatsapp_number: data.whatsapp_number || data.whatsappNumber,
      footer_years_text: data.footer_years_text || data.footerYearsText,
      footerYearsText: data.footer_years_text || data.footerYearsText,
      head_scripts: data.head_scripts || data.headScripts,
      headScripts: data.head_scripts || data.headScripts,
      body_scripts: data.body_scripts || data.bodyScripts,
      bodyScripts: data.body_scripts || data.bodyScripts,
      facebook_api_enabled: data.facebook_api_enabled,
      facebook_access_token: data.facebook_access_token,
      facebook_page_id: data.facebook_page_id,
      instagram_api_enabled: data.instagram_api_enabled,
      instagram_access_token: data.instagram_access_token,
      instagram_account_id: data.instagram_account_id,
      linkedin_api_enabled: data.linkedin_api_enabled,
      linkedin_access_token: data.linkedin_access_token,
      linkedin_organization_id: data.linkedin_organization_id,
      twitter_api_enabled: data.twitter_api_enabled,
      twitter_api_key: data.twitter_api_key,
      twitter_api_secret: data.twitter_api_secret,
      twitter_access_token: data.twitter_access_token,
      twitter_access_token_secret: data.twitter_access_token_secret,
      threads_api_enabled: data.threads_api_enabled,
      threads_access_token: data.threads_access_token,
      threads_account_id: data.threads_account_id,
      updatedAt: data.updated_at ? new Date(data.updated_at) : (data.updatedAt ? new Date(data.updatedAt) : new Date())
    };
    
    return { configuration: normalized };
  }

  async updateConfiguration(config: Partial<Configuration>): Promise<{ configuration: Configuration }> {
    return this.request('/configuracoes', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  // Contact
  async sendContactMessage(data: ContactRequest): Promise<{ message: string }> {
    // Converter camelCase para snake_case para o backend
    const backendData = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      service_type: data.serviceType, // Converter serviceType para service_type
      message: data.message,
      captchaToken: data.captchaToken,
      honeypot: data.honeypot,
    };
    
    return this.request('/configurations/contact', {
      method: 'POST',
      body: JSON.stringify(backendData),
    });
  }

  // Transformar resposta do backend para o formato do frontend
  private toContactMessageReply(db: any): ContactMessageReply {
    return {
      id: db.id,
      message: db.message,
      createdAt: db.created_at ? new Date(db.created_at) : (db.createdAt ? new Date(db.createdAt) : new Date()),
    };
  }

  // Transformar mensagem do backend para o formato do frontend
  private toContactMessage(db: any): ContactMessage {
    return {
      id: db.id,
      name: db.name,
      email: db.email,
      phone: db.phone || undefined,
      serviceType: db.service_type || db.serviceType || undefined,
      message: db.message,
      isRead: db.is_read !== undefined ? db.is_read : (db.isRead !== undefined ? db.isRead : false),
      createdAt: db.created_at ? new Date(db.created_at) : (db.createdAt ? new Date(db.createdAt) : new Date()),
      replies: db.replies ? db.replies.map((reply: any) => this.toContactMessageReply(reply)) : undefined,
    };
  }

  // Contact Messages
  async getContactMessages(): Promise<{ messages: ContactMessage[] }> {
    const response = await this.request<{ messages: any[] }>('/contact-messages');
    return {
      messages: (response.messages || []).map(msg => this.toContactMessage(msg)),
    };
  }

  async getContactMessage(id: string): Promise<{ message: ContactMessage }> {
    const response = await this.request<{ message: any }>(`/contact-messages/${id}`);
    return {
      message: this.toContactMessage(response.message),
    };
  }

  async markContactMessageAsRead(id: string): Promise<{ message: ContactMessage }> {
    const response = await this.request<{ message: any }>(`/contact-messages/${id}/read`, {
      method: 'PUT',
    });
    return {
      message: this.toContactMessage(response.message),
    };
  }

  async deleteContactMessage(id: string): Promise<{ message: string }> {
    return this.request(`/contact-messages/${id}`, {
      method: 'DELETE',
    });
  }

  async getUnreadContactMessagesCount(): Promise<{ count: number }> {
    return this.request('/contact-messages/unread-count');
  }

  async getTotalContactMessagesCount(): Promise<{ count: number }> {
    return this.request('/contact-messages/total-count');
  }

  async getContactMessagesByMonth(): Promise<{ data: Array<{ month: string; count: number; fullMonth: string }> }> {
    return this.request('/contact-messages/by-month');
  }

  async getAccessLogs(params?: { page?: number; limit?: number; adminId?: string; success?: boolean }): Promise<{
    logs: Array<{
      id: string;
      admin_id: string;
      admin_email: string;
      admin_name: string;
      ip_address: string | null;
      user_agent: string | null;
      login_method: string;
      success: boolean;
      created_at: string;
      admin: {
        id: string;
        email: string;
        name: string;
      };
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.adminId) queryParams.append('adminId', params.adminId);
    if (params?.success !== undefined) queryParams.append('success', params.success.toString());
    
    const query = queryParams.toString();
    return this.request(`/access-logs${query ? `?${query}` : ''}`);
  }

  async getAccessLogsStats(): Promise<{
    total: number;
    successful: number;
    failed: number;
    uniqueUsers: number;
    recentLogs: Array<any>;
  }> {
    return this.request('/access-logs/stats');
  }

  async sendContactMessageReply(id: string, message: string): Promise<{ message: string }> {
    return this.request(`/contact-messages/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  // Privacy Policy
  async getPrivacyPolicy(): Promise<{ success: boolean; policy: { id: string; title: string; content: string; background_image_url?: string | null } }> {
    return this.request('/privacy-policy');
  }

  async getPrivacyPolicyAdmin(): Promise<{ success: boolean; policy: { id: string; title: string; content: string; background_image_url?: string | null } }> {
    return this.request('/privacy-policy/admin');
  }

  async updatePrivacyPolicy(data: { title?: string; content?: string; background_image_url?: string | null }): Promise<{ success: boolean; policy: any }> {
    return this.request('/privacy-policy/admin', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async uploadPrivacyPolicyBackgroundImage(file: File): Promise<{ success: boolean; data: { url: string }; policy: any }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE_URL}/privacy-policy/admin/background-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erro ao fazer upload' }));
      throw new Error(error.error || 'Erro ao fazer upload');
    }

    return response.json();
  }

  async subscribeNewsletter(payload: { email: string; name?: string }): Promise<{ subscription: NewsletterSubscription }> {
    const resp = await this.request<any>('/newsletter/subscriptions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return {
      subscription: {
        id: resp.subscription.id,
        email: resp.subscription.email,
        name: resp.subscription.name,
        createdAt: resp.subscription.created_at ? new Date(resp.subscription.created_at) : new Date(),
        updatedAt: resp.subscription.updated_at ? new Date(resp.subscription.updated_at) : new Date(),
      }
    };
  }

  async getNewsletterSubscriptions(): Promise<{ subscriptions: NewsletterSubscription[] }> {
    const resp = await this.request<any>('/newsletter/subscriptions');
    const subscriptions = (resp.subscriptions || []).map((item: any) => ({
      id: item.id,
      email: item.email,
      name: item.name,
      createdAt: item.created_at ? new Date(item.created_at) : new Date(),
      updatedAt: item.updated_at ? new Date(item.updated_at) : new Date(),
    }));
    return { subscriptions };
  }

  async deleteNewsletterSubscription(id: string): Promise<{ message: string }> {
    return this.request(`/newsletter/subscriptions/${id}`, {
      method: 'DELETE',
    });
  }

  async exportNewsletterSubscriptions(): Promise<string> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/newsletter/subscriptions/export`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Erro ao exportar as inscrições');
      }

      return await response.text();
    } catch (error: any) {
      console.error('Erro ao exportar inscrições:', error);
      throw error;
    }
  }

  // Hero
  async getHero(): Promise<{ hero: Hero }> {
    const resp = await this.request<any>('/hero');
    return { hero: resp.hero };
  }

  async updateHero(data: UpdateHeroRequest): Promise<{ hero: Hero }> {
    // Converter camelCase para snake_case e tratar valores vazios
    const requestData: any = {};
    if (data.badgeText !== undefined && data.badgeText !== null) requestData.badge_text = data.badgeText;
    if (data.welcomeText !== undefined) requestData.welcome_text = data.welcomeText || null;
    if (data.titleLine1 !== undefined && data.titleLine1 !== null) requestData.title_line1 = data.titleLine1;
    if (data.titleLine2 !== undefined && data.titleLine2 !== null) requestData.title_line2 = data.titleLine2;
    if (data.description !== undefined && data.description !== null) requestData.description = data.description;
    if (data.backgroundImageUrl !== undefined) requestData.background_image_url = data.backgroundImageUrl || null;
    if (data.heroImageUrl !== undefined) requestData.hero_image_url = data.heroImageUrl || null;
    if (data.button1Text !== undefined) requestData.button1_text = data.button1Text || null;
    if (data.button1Link !== undefined) requestData.button1_link = data.button1Link || null;
    if (data.button1Icon !== undefined) requestData.button1_icon = data.button1Icon || null;
    if (data.button2Text !== undefined) requestData.button2_text = data.button2Text || null;
    if (data.button2Link !== undefined) requestData.button2_link = data.button2Link || null;
    if (data.button2Icon !== undefined) requestData.button2_icon = data.button2Icon || null;
    if (data.statYears !== undefined) requestData.stat_years = data.statYears || null;
    if (data.statClients !== undefined) requestData.stat_clients = data.statClients || null;
    if (data.statNetwork !== undefined) requestData.stat_network = data.statNetwork || null;
    if (data.indicator1Title !== undefined) requestData.indicator1_title = data.indicator1Title || null;
    if (data.indicator1Value !== undefined) requestData.indicator1_value = data.indicator1Value || null;
    if (data.indicator2Title !== undefined) requestData.indicator2_title = data.indicator2Title || null;
    if (data.indicator2Value !== undefined) requestData.indicator2_value = data.indicator2Value || null;
    if (data.indicator3Title !== undefined) requestData.indicator3_title = data.indicator3Title || null;
    if (data.indicator3Value !== undefined) requestData.indicator3_value = data.indicator3Value || null;

    const resp = await this.request<any>('/hero', {
      method: 'PUT',
      body: JSON.stringify(requestData),
    });
    return { hero: resp.hero };
  }

  // LoginPage
  async getLoginPage(): Promise<{ loginPage: LoginPage }> {
    const resp = await this.request<any>('/login-page');
    return { loginPage: resp.loginPage };
  }

  async updateLoginPage(data: UpdateLoginPageRequest): Promise<{ loginPage: LoginPage }> {
    // Converter camelCase para snake_case e tratar valores vazios
    const requestData: any = {};
    if (data.backgroundImageUrl !== undefined) requestData.background_image_url = data.backgroundImageUrl || null;
    if (data.welcomeText !== undefined) requestData.welcome_text = data.welcomeText || null;
    if (data.titleLine1 !== undefined) requestData.title_line1 = data.titleLine1 || null;
    if (data.titleLine2 !== undefined) requestData.title_line2 = data.titleLine2 || null;
    if (data.buttonText !== undefined) requestData.button_text = data.buttonText || null;
    if (data.buttonLink !== undefined) requestData.button_link = data.buttonLink || null;
    if (data.buttonIcon !== undefined) requestData.button_icon = data.buttonIcon || null;

    const resp = await this.request<any>('/login-page', {
      method: 'PUT',
      body: JSON.stringify(requestData),
    });
    return { loginPage: resp.loginPage };
  }

  // Blog Post Image Upload
  async uploadBlogPostImage(id: string, file: File): Promise<{ data: { url: string }, post: any }> {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/blog/posts/${id}/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao fazer upload');
    }

    const resp = await response.json();
    return { data: resp.data, post: resp.post };
  }

  async deleteBlogPostImage(id: string): Promise<{ post: any }> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/blog/posts/${id}/image`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao remover imagem');
    }

    const resp = await response.json();
    return { post: resp.post };
  }

  // ========== CLIENTS ==========
  async getClients(): Promise<{ clients: Client[] }> {
    const response = await fetch(`${API_BASE_URL}/clients`);
    if (!response.ok) {
      throw new Error('Erro ao buscar clientes');
    }
    const data = await response.json();
    return {
      clients: (data.clients || []).map((c: any) => this.toClient(c))
    };
  }

  async getAllClients(): Promise<{ clients: Client[] }> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/clients/all`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error('Erro ao buscar clientes');
    }
    const data = await response.json();
    return {
      clients: (data.clients || []).map((c: any) => this.toClient(c))
    };
  }

  async createClient(client: CreateClientRequest): Promise<{ client: Client }> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/clients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: client.name,
        phone: client.phone,
        website_url: client.websiteUrl,
        facebook_url: client.facebookUrl,
        instagram_url: client.instagramUrl,
        linkedin_url: client.linkedinUrl,
        twitter_url: client.twitterUrl,
        order: client.order ?? 0,
        isActive: client.isActive ?? true
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao criar cliente');
    }

    const data = await response.json();
    return { client: this.toClient(data.client) };
  }

  async updateClient(id: string, client: UpdateClientRequest): Promise<{ client: Client }> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: client.name,
        phone: client.phone,
        website_url: client.websiteUrl,
        facebook_url: client.facebookUrl,
        instagram_url: client.instagramUrl,
        linkedin_url: client.linkedinUrl,
        twitter_url: client.twitterUrl,
        order: client.order,
        isActive: client.isActive
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao atualizar cliente');
    }

    const data = await response.json();
    return { client: this.toClient(data.client) };
  }

  async deleteClient(id: string): Promise<void> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao deletar cliente');
    }
  }

  async uploadClientLogo(id: string, file: File): Promise<{ client: Client; data: any }> {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/clients/${id}/logo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao fazer upload da logo');
    }

    const data = await response.json();
    return {
      client: this.toClient(data.client),
      data: data.data
    };
  }

  async deleteClientLogo(id: string): Promise<{ client: Client }> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/clients/${id}/logo`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao remover logo');
    }

    const data = await response.json();
    return { client: this.toClient(data.client) };
  }

  private toClient(db: any): Client {
    if (!db) return null as any;
    
    return {
      id: db.id || '',
      name: db.name || '',
      logoUrl: db.logo_url || db.logoUrl || undefined,
      logo_url: db.logo_url || db.logoUrl || undefined,
      phone: db.phone || undefined,
      websiteUrl: db.website_url || db.websiteUrl || undefined,
      website_url: db.website_url || db.websiteUrl || undefined,
      facebookUrl: db.facebook_url || db.facebookUrl || undefined,
      facebook_url: db.facebook_url || db.facebookUrl || undefined,
      instagramUrl: db.instagram_url || db.instagramUrl || undefined,
      instagram_url: db.instagram_url || db.instagramUrl || undefined,
      linkedinUrl: db.linkedin_url || db.linkedinUrl || undefined,
      linkedin_url: db.linkedin_url || db.linkedinUrl || undefined,
      twitterUrl: db.twitter_url || db.twitterUrl || undefined,
      twitter_url: db.twitter_url || db.twitterUrl || undefined,
      order: db.order ?? 0,
      isActive: db.is_active !== undefined ? db.is_active : (db.isActive !== undefined ? db.isActive : true),
      is_active: db.is_active !== undefined ? db.is_active : (db.isActive !== undefined ? db.isActive : true),
      createdAt: db.created_at ? new Date(db.created_at) : (db.createdAt ? new Date(db.createdAt) : new Date()),
      created_at: db.created_at ? new Date(db.created_at) : (db.createdAt ? new Date(db.createdAt) : new Date()),
      updatedAt: db.updated_at ? new Date(db.updated_at) : (db.updatedAt ? new Date(db.updatedAt) : new Date()),
      updated_at: db.updated_at ? new Date(db.updated_at) : (db.updatedAt ? new Date(db.updatedAt) : new Date())
    };
  }

  async getClientsSection(): Promise<{ clients: { title: string; background_image_url?: string | null } }> {
    const response = await fetch(`${API_BASE_URL}/sections/clients`);
    if (!response.ok) {
      throw new Error('Erro ao buscar seção de clientes');
    }
    const data = await response.json();
    return {
      clients: {
        title: data.clients?.title || 'Empresas que Confiam em Nosso Trabalho',
        background_image_url: data.clients?.background_image_url || null,
      }
    };
  }

  async getServicesSection(): Promise<{ services: { badge_text: string; title_line1: string; title_line2: string; description: string; years_highlight?: string | null; background_image_url?: string | null } }> {
    const response = await fetch(`${API_BASE_URL}/sections/services`);
    if (!response.ok) {
      throw new Error('Erro ao buscar seção de serviços');
    }
    const data = await response.json();
    return {
      services: {
        badge_text: data.services?.badge_text || 'Nossos Serviços',
        title_line1: data.services?.title_line1 || 'Nossas Soluções Vão',
        title_line2: data.services?.title_line2 || 'Além da Contabilidade',
        description: data.services?.description || 'Atuamos de forma integrada e estratégica para que o seu negócio tenha a melhor performance contábil, fiscal e tributária com 34 anos de experiência.',
        years_highlight: data.services?.years_highlight || null,
        background_image_url: data.services?.background_image_url || null,
      }
    };
  }

  async updateServicesSection(data: { badge_text?: string; title_line1?: string; title_line2?: string; description?: string; years_highlight?: string | null; background_image_url?: string | null }): Promise<{ services: any }> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/sections/services`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao atualizar seção de serviços');
    }

    return await response.json();
  }

  async uploadServicesImage(file: File): Promise<{ services: any; data: { url: string } }> {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/sections/services/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao fazer upload da imagem');
    }

    return await response.json();
  }

  async deleteServicesImage(): Promise<{ services: any }> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/sections/services/image`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao deletar imagem');
    }

    return await response.json();
  }

  // ========== FEATURES ==========
  async getFeatures(): Promise<{ features: Feature[] }> {
    const response = await fetch(`${API_BASE_URL}/sections/features`);
    if (!response.ok) {
      throw new Error('Erro ao buscar diferenciais');
    }
    const data = await response.json();
    return {
      features: (data.features || []).map((f: any) => ({
        id: f.id,
        icon: f.icon,
        title: f.title,
        description: f.description,
        order: f.order ?? 0,
        isActive: f.is_active !== undefined ? f.is_active : (f.isActive !== undefined ? f.isActive : true),
        is_active: f.is_active !== undefined ? f.is_active : (f.isActive !== undefined ? f.isActive : true),
        createdAt: f.created_at ? new Date(f.created_at) : (f.createdAt ? new Date(f.createdAt) : new Date()),
        updatedAt: f.updated_at ? new Date(f.updated_at) : (f.updatedAt ? new Date(f.updatedAt) : new Date()),
      }))
    };
  }

  // ========== CATEGORIES ==========
  private toCategory(db: any): Category {
    return {
      id: db.id,
      name: db.name,
      slug: db.slug,
      description: db.description || undefined,
      color: db.color || '#3bb664',
      isActive: db.is_active !== undefined ? db.is_active : (db.isActive !== undefined ? db.isActive : true),
      is_active: db.is_active !== undefined ? db.is_active : (db.isActive !== undefined ? db.isActive : true),
      createdAt: db.created_at ? new Date(db.created_at) : (db.createdAt ? new Date(db.createdAt) : new Date()),
      created_at: db.created_at || db.createdAt,
      updatedAt: db.updated_at ? new Date(db.updated_at) : (db.updatedAt ? new Date(db.updatedAt) : new Date()),
      updated_at: db.updated_at || db.updatedAt,
      _count: db._count
    };
  }

  async getCategories(active?: boolean): Promise<{ categories: Category[] }> {
    const url = active !== undefined ? `/categories?active=${active}` : '/categories';
    const response = await this.request<{ categories: any[] }>(url);
    return {
      categories: (response.categories || []).map(c => this.toCategory(c))
    };
  }

  async getCategoryById(id: string): Promise<Category> {
    const response = await this.request<any>(`/categories/${id}`);
    return this.toCategory(response);
  }

  async createCategory(category: CreateCategoryRequest): Promise<{ category: Category }> {
    const response = await this.request<any>('/categories', {
      method: 'POST',
      body: JSON.stringify({
        name: category.name,
        description: category.description,
        color: category.color,
        is_active: category.isActive !== undefined ? category.isActive : true
      })
    });
    return { category: this.toCategory(response) };
  }

  async updateCategory(id: string, category: UpdateCategoryRequest): Promise<{ category: Category }> {
    const response = await this.request<any>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: category.name,
        description: category.description,
        color: category.color,
        is_active: category.isActive
      })
    });
    return { category: this.toCategory(response) };
  }

  async deleteCategory(id: string): Promise<{ message: string }> {
    return this.request(`/categories/${id}`, {
      method: 'DELETE'
    });
  }

  // ========== TAGS ==========
  private toTag(db: any): Tag {
    return {
      id: db.id,
      name: db.name,
      slug: db.slug,
      description: db.description || undefined,
      color: db.color || '#6b7280',
      isActive: db.is_active !== undefined ? db.is_active : (db.isActive !== undefined ? db.isActive : true),
      is_active: db.is_active !== undefined ? db.is_active : (db.isActive !== undefined ? db.isActive : true),
      createdAt: db.created_at ? new Date(db.created_at) : (db.createdAt ? new Date(db.createdAt) : new Date()),
      created_at: db.created_at || db.createdAt,
      updatedAt: db.updated_at ? new Date(db.updated_at) : (db.updatedAt ? new Date(db.updatedAt) : new Date()),
      updated_at: db.updated_at || db.updatedAt,
      _count: db._count
    };
  }

  async getTags(active?: boolean): Promise<{ tags: Tag[] }> {
    const url = active !== undefined ? `/tags?active=${active}` : '/tags';
    const response = await this.request<{ tags: any[] }>(url);
    return {
      tags: (response.tags || []).map(t => this.toTag(t))
    };
  }

  async getTagById(id: string): Promise<Tag> {
    const response = await this.request<any>(`/tags/${id}`);
    return this.toTag(response);
  }

  async createTag(tag: CreateTagRequest): Promise<{ tag: Tag }> {
    const response = await this.request<any>('/tags', {
      method: 'POST',
      body: JSON.stringify({
        name: tag.name,
        description: tag.description,
        color: tag.color,
        is_active: tag.isActive !== undefined ? tag.isActive : true
      })
    });
    return { tag: this.toTag(response) };
  }

  async updateTag(id: string, tag: UpdateTagRequest): Promise<{ tag: Tag }> {
    const response = await this.request<any>(`/tags/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: tag.name,
        description: tag.description,
        color: tag.color,
        is_active: tag.isActive
      })
    });
    return { tag: this.toTag(response) };
  }

  async deleteTag(id: string): Promise<{ message: string }> {
    return this.request(`/tags/${id}`, {
      method: 'DELETE'
    });
  }
}

export const apiService = new ApiService();
