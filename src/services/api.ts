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
  NewsletterSubscription,
  Client,
  CreateClientRequest,
  UpdateClientRequest,
  LoginPage,
  UpdateLoginPageRequest,
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  Tag,
  CreateTagRequest,
  UpdateTagRequest,
  AccessLog,
  ContactMessage,
  ContactMessageReply,
  JobApplication,
  CareersPage,
  UpdateCareersPageRequest
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
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        // Cria um erro com informações da resposta
        const error: any = new Error(data.error || data.message || 'Erro na requisição');
        error.response = { data };
        error.status = response.status;
        throw error;
      }

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
        const anyResponse: any = response;
        const success =
          anyResponse.success === true ||
          anyResponse.success === 'true';

        return {
          success,
          message: anyResponse.message || '',
          email: anyResponse.email || data.email
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
        role: u.role || 'administrator',
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

  // Service Image Upload
  async uploadServiceImage(id: string, file: File): Promise<{ data: { url: string }; service: Service }> {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE_URL}/services/${id}/image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao fazer upload da imagem');
    }

    const resp = await response.json();
    return { data: resp.data, service: this.toService(resp.service) };
  }

  async deleteServiceImage(id: string): Promise<{ service: Service }> {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE_URL}/services/${id}/image`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao remover imagem');
    }

    const resp = await response.json();
    return { service: this.toService(resp.service) };
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
    return this.request('/configuracoes');
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

  async sendContactMessageReply(id: string, message: string): Promise<{ message: string }> {
    return this.request(`/contact-messages/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  // Job Applications (Trabalhe Conosco)
  async uploadJobApplicationCv(file: File): Promise<{ data: { url: string } }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/job-applications/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Erro ao enviar currículo');
    }

    const resp = await response.json();
    return { data: resp.data };
  }

  async sendJobApplication(data: {
    name: string;
    email: string;
    phone?: string;
    position?: string;
    linkedinUrl?: string;
    message?: string;
    cvUrl?: string;
    captchaToken?: string;
    honeypot?: string;
  }): Promise<{ success: boolean; message: string }> {
    return this.request('/job-applications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getJobApplications(): Promise<{ applications: JobApplication[] }> {
    const response = await this.request<{ applications: any[] }>('/job-applications');
    return {
      applications: (response.applications || []).map((app) => ({
        id: app.id,
        name: app.name,
        email: app.email,
        phone: app.phone || undefined,
        position: app.position || undefined,
        linkedinUrl: app.linkedin_url || app.linkedinUrl || undefined,
        message: app.message || undefined,
        cvUrl: app.cv_url || app.cvUrl || undefined,
        isRead: app.is_read !== undefined ? app.is_read : !!app.isRead,
        createdAt: app.created_at ? new Date(app.created_at) : new Date(app.createdAt || Date.now()),
      })),
    };
  }

  async getJobApplication(id: string): Promise<{ application: JobApplication }> {
    const response = await this.request<{ application: any }>(`/job-applications/${id}`);
    const app = response.application;
    return {
      application: {
        id: app.id,
        name: app.name,
        email: app.email,
        phone: app.phone || undefined,
        position: app.position || undefined,
        linkedinUrl: app.linkedin_url || app.linkedinUrl || undefined,
        message: app.message || undefined,
        cvUrl: app.cv_url || app.cvUrl || undefined,
        isRead: app.is_read !== undefined ? app.is_read : !!app.isRead,
        createdAt: app.created_at ? new Date(app.created_at) : new Date(app.createdAt || Date.now()),
      },
    };
  }

  async markJobApplicationAsRead(id: string): Promise<{ application: JobApplication }> {
    const response = await this.request<{ application: any }>(`/job-applications/${id}/read`, {
      method: 'PUT',
    });
    const app = response.application;
    return {
      application: {
        id: app.id,
        name: app.name,
        email: app.email,
        phone: app.phone || undefined,
        position: app.position || undefined,
        linkedinUrl: app.linkedin_url || app.linkedinUrl || undefined,
        message: app.message || undefined,
        cvUrl: app.cv_url || app.cvUrl || undefined,
        isRead: app.is_read !== undefined ? app.is_read : !!app.isRead,
        createdAt: app.created_at ? new Date(app.created_at) : new Date(app.createdAt || Date.now()),
      },
    };
  }

  async deleteJobApplication(id: string): Promise<{ message: string }> {
    return this.request(`/job-applications/${id}`, {
      method: 'DELETE',
    });
  }

  // Careers Page
  async getCareersPage(): Promise<{ careersPage: CareersPage }> {
    return this.request('/careers-page');
  }

  async updateCareersPage(data: UpdateCareersPageRequest): Promise<{ careersPage: CareersPage }> {
    return this.request('/careers-page', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async uploadCareersPageImage(file: File): Promise<{ data: { url: string }; careersPage: CareersPage }> {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE_URL}/careers-page/image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Erro ao enviar imagem');
    }

    const resp = await response.json();
    return { data: resp.data, careersPage: resp.careersPage };
  }

  async deleteCareersPageImage(): Promise<{ careersPage: CareersPage }> {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE_URL}/careers-page/image`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Erro ao remover imagem');
    }

    const resp = await response.json();
    return { careersPage: resp.careersPage };
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
    if (data.titleLine1 !== undefined && data.titleLine1 !== null) requestData.title_line1 = data.titleLine1;
    if (data.titleLine2 !== undefined && data.titleLine2 !== null) requestData.title_line2 = data.titleLine2;
    if (data.description !== undefined && data.description !== null) requestData.description = data.description;
    if (data.backgroundImageUrl !== undefined) requestData.background_image_url = data.backgroundImageUrl || null;
    if (data.heroImageUrl !== undefined) requestData.hero_image_url = data.heroImageUrl || null;
    if (data.button1Text !== undefined) requestData.button1_text = data.button1Text || null;
    if (data.button1Link !== undefined) requestData.button1_link = data.button1Link || null;
    if (data.button2Text !== undefined) requestData.button2_text = data.button2Text || null;
    if (data.button2Link !== undefined) requestData.button2_link = data.button2Link || null;
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

  // Login Page
  async getLoginPage(): Promise<{ loginPage: LoginPage }> {
    const response = await this.request<{ loginPage: any }>('/login-page');
    return {
      loginPage: {
        id: response.loginPage.id,
        background_image_url: response.loginPage.background_image_url || null,
        welcome_text: response.loginPage.welcome_text || null,
        title_line1: response.loginPage.title_line1 || null,
        title_line2: response.loginPage.title_line2 || null,
        button_text: response.loginPage.button_text || null,
        button_link: response.loginPage.button_link || null,
        button_icon: response.loginPage.button_icon || null,
        createdAt: response.loginPage.created_at ? new Date(response.loginPage.created_at) : new Date(),
        updatedAt: response.loginPage.updated_at ? new Date(response.loginPage.updated_at) : new Date(),
      }
    };
  }

  async updateLoginPage(data: UpdateLoginPageRequest): Promise<{ loginPage: LoginPage }> {
    const response = await this.request<{ loginPage: any }>('/login-page', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return {
      loginPage: {
        id: response.loginPage.id,
        background_image_url: response.loginPage.background_image_url || null,
        welcome_text: response.loginPage.welcome_text || null,
        title_line1: response.loginPage.title_line1 || null,
        title_line2: response.loginPage.title_line2 || null,
        button_text: response.loginPage.button_text || null,
        button_link: response.loginPage.button_link || null,
        button_icon: response.loginPage.button_icon || null,
        createdAt: response.loginPage.created_at ? new Date(response.loginPage.created_at) : new Date(),
        updatedAt: response.loginPage.updated_at ? new Date(response.loginPage.updated_at) : new Date(),
      }
    };
  }

  // Categories
  async getCategories(): Promise<{ categories: Category[] }> {
    const response = await this.request<{ categories: any[] }>('/categories');
    return {
      categories: (response.categories || []).map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description || null,
        color: cat.color || null,
        isActive: cat.is_active !== undefined ? cat.is_active : cat.isActive,
        is_active: cat.is_active !== undefined ? cat.is_active : cat.isActive,
        createdAt: cat.created_at ? new Date(cat.created_at) : new Date(cat.createdAt || Date.now()),
        created_at: cat.created_at || cat.createdAt,
        updatedAt: cat.updated_at ? new Date(cat.updated_at) : new Date(cat.updatedAt || Date.now()),
        updated_at: cat.updated_at || cat.updatedAt,
        _count: cat._count
      }))
    };
  }

  async createCategory(data: CreateCategoryRequest): Promise<{ category: Category }> {
    const response = await this.request<{ category: any }>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return {
      category: {
        id: response.category.id,
        name: response.category.name,
        slug: response.category.slug,
        description: response.category.description || null,
        color: response.category.color || null,
        isActive: response.category.is_active !== undefined ? response.category.is_active : response.category.isActive,
        is_active: response.category.is_active !== undefined ? response.category.is_active : response.category.isActive,
        createdAt: response.category.created_at ? new Date(response.category.created_at) : new Date(),
        created_at: response.category.created_at,
        updatedAt: response.category.updated_at ? new Date(response.category.updated_at) : new Date(),
        updated_at: response.category.updated_at,
        _count: response.category._count
      }
    };
  }

  async updateCategory(id: string, data: UpdateCategoryRequest): Promise<{ category: Category }> {
    const response = await this.request<{ category: any }>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return {
      category: {
        id: response.category.id,
        name: response.category.name,
        slug: response.category.slug,
        description: response.category.description || null,
        color: response.category.color || null,
        isActive: response.category.is_active !== undefined ? response.category.is_active : response.category.isActive,
        is_active: response.category.is_active !== undefined ? response.category.is_active : response.category.isActive,
        createdAt: response.category.created_at ? new Date(response.category.created_at) : new Date(),
        created_at: response.category.created_at,
        updatedAt: response.category.updated_at ? new Date(response.category.updated_at) : new Date(),
        updated_at: response.category.updated_at,
        _count: response.category._count
      }
    };
  }

  async deleteCategory(id: string): Promise<void> {
    await this.request(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Tags
  async getTags(): Promise<{ tags: Tag[] }> {
    const response = await this.request<{ tags: any[] }>('/tags');
    return {
      tags: (response.tags || []).map(tag => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        description: tag.description || null,
        color: tag.color || null,
        isActive: tag.is_active !== undefined ? tag.is_active : tag.isActive,
        is_active: tag.is_active !== undefined ? tag.is_active : tag.isActive,
        createdAt: tag.created_at ? new Date(tag.created_at) : new Date(tag.createdAt || Date.now()),
        created_at: tag.created_at || tag.createdAt,
        updatedAt: tag.updated_at ? new Date(tag.updated_at) : new Date(tag.updatedAt || Date.now()),
        updated_at: tag.updated_at || tag.updatedAt,
        _count: tag._count
      }))
    };
  }

  async createTag(data: CreateTagRequest): Promise<{ tag: Tag }> {
    const response = await this.request<{ tag: any }>('/tags', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return {
      tag: {
        id: response.tag.id,
        name: response.tag.name,
        slug: response.tag.slug,
        description: response.tag.description || null,
        color: response.tag.color || null,
        isActive: response.tag.is_active !== undefined ? response.tag.is_active : response.tag.isActive,
        is_active: response.tag.is_active !== undefined ? response.tag.is_active : response.tag.isActive,
        createdAt: response.tag.created_at ? new Date(response.tag.created_at) : new Date(),
        created_at: response.tag.created_at,
        updatedAt: response.tag.updated_at ? new Date(response.tag.updated_at) : new Date(),
        updated_at: response.tag.updated_at,
        _count: response.tag._count
      }
    };
  }

  async updateTag(id: string, data: UpdateTagRequest): Promise<{ tag: Tag }> {
    const response = await this.request<{ tag: any }>(`/tags/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return {
      tag: {
        id: response.tag.id,
        name: response.tag.name,
        slug: response.tag.slug,
        description: response.tag.description || null,
        color: response.tag.color || null,
        isActive: response.tag.is_active !== undefined ? response.tag.is_active : response.tag.isActive,
        is_active: response.tag.is_active !== undefined ? response.tag.is_active : response.tag.isActive,
        createdAt: response.tag.created_at ? new Date(response.tag.created_at) : new Date(),
        created_at: response.tag.created_at,
        updatedAt: response.tag.updated_at ? new Date(response.tag.updated_at) : new Date(),
        updated_at: response.tag.updated_at,
        _count: response.tag._count
      }
    };
  }

  async deleteTag(id: string): Promise<void> {
    await this.request(`/tags/${id}`, {
      method: 'DELETE',
    });
  }

  // Access Logs
  async getAccessLogs(params?: { page?: number; limit?: number; email?: string; success?: boolean }): Promise<{ logs: AccessLog[]; pagination: any }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.email) queryParams.append('email', params.email);
    if (params?.success !== undefined) queryParams.append('success', params.success.toString());
    
    const query = queryParams.toString();
    return this.request(`/access-logs${query ? `?${query}` : ''}`);
  }

  async getAccessLogStats(): Promise<{ total: number; successful: number; failed: number; recent: number; byMethod: { password: number; twoFactor: number } }> {
    return this.request('/access-logs/stats');
  }
}

export const apiService = new ApiService();
