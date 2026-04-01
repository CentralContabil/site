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
  JobPosition,
  RecruitmentProcess,
  RecruitmentCandidate,
  CareersPage,
  UpdateCareersPageRequest
} from '../types';

// Em desenvolvimento, usar o proxy do Vite (/api)
// Em produção, usar a variável de ambiente ou /api (Nginx faz proxy)
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

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
    return this.request('/configurations');
  }

  async updateConfiguration(config: Partial<Configuration>): Promise<{ configuration: Configuration }> {
    return this.request('/configurations', {
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
    positionId?: string;
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

  async getJobApplications(positionId?: string): Promise<{ applications: JobApplication[] }> {
    const url = positionId && positionId !== 'all' 
      ? `/job-applications?positionId=${positionId}`
      : '/job-applications';
    const response = await this.request<{ applications: any[] }>(url);
    return {
      applications: (response.applications || []).map((app) => ({
        id: app.id,
        name: app.name,
        email: app.email,
        phone: app.phone || undefined,
        position: app.position || undefined,
        positionId: app.position_id || app.positionId || undefined,
        jobPosition: app.job_position ? {
          id: app.job_position.id,
          name: app.job_position.name,
          description: app.job_position.description,
          isActive: app.job_position.is_active !== undefined ? app.job_position.is_active : app.job_position.isActive,
          order: app.job_position.order,
          createdAt: app.job_position.created_at ? new Date(app.job_position.created_at) : new Date(app.job_position.createdAt || Date.now()),
          updatedAt: app.job_position.updated_at ? new Date(app.job_position.updated_at) : new Date(app.job_position.updatedAt || Date.now()),
        } : undefined,
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
        positionId: app.position_id || app.positionId || undefined,
        jobPosition: app.job_position ? {
          id: app.job_position.id,
          name: app.job_position.name,
          description: app.job_position.description,
          isActive: app.job_position.is_active !== undefined ? app.job_position.is_active : app.job_position.isActive,
          order: app.job_position.order,
          createdAt: app.job_position.created_at ? new Date(app.job_position.created_at) : new Date(app.job_position.createdAt || Date.now()),
          updatedAt: app.job_position.updated_at ? new Date(app.job_position.updated_at) : new Date(app.job_position.updatedAt || Date.now()),
        } : undefined,
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
        positionId: app.position_id || app.positionId || undefined,
        jobPosition: app.job_position ? {
          id: app.job_position.id,
          name: app.job_position.name,
          description: app.job_position.description,
          isActive: app.job_position.is_active !== undefined ? app.job_position.is_active : app.job_position.isActive,
          order: app.job_position.order,
          createdAt: app.job_position.created_at ? new Date(app.job_position.created_at) : new Date(app.job_position.createdAt || Date.now()),
          updatedAt: app.job_position.updated_at ? new Date(app.job_position.updated_at) : new Date(app.job_position.updatedAt || Date.now()),
        } : undefined,
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

  // ========== JOB POSITIONS ==========
  async getJobPositions(): Promise<{ positions: JobPosition[] }> {
    const response = await fetch(`${API_BASE_URL}/job-positions`);
    if (!response.ok) {
      throw new Error('Erro ao buscar áreas de interesse');
    }
    const data = await response.json();
    return {
      positions: (data.positions || []).map((pos: any) => ({
        id: pos.id,
        name: pos.name,
        description: pos.description || undefined,
        isActive: pos.is_active !== undefined ? pos.is_active : pos.isActive,
        order: pos.order,
        createdAt: pos.created_at ? new Date(pos.created_at) : new Date(pos.createdAt || Date.now()),
        updatedAt: pos.updated_at ? new Date(pos.updated_at) : new Date(pos.updatedAt || Date.now()),
      })),
    };
  }

  async getAllJobPositions(): Promise<{ positions: JobPosition[] }> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/job-positions/all`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `Erro ao buscar áreas de interesse (${response.status})`);
    }
    const data = await response.json();
    return {
      positions: (data.positions || []).map((pos: any) => ({
        id: pos.id,
        name: pos.name,
        description: pos.description || undefined,
        isActive: pos.is_active !== undefined ? pos.is_active : pos.isActive,
        order: pos.order,
        createdAt: pos.created_at ? new Date(pos.created_at) : new Date(pos.createdAt || Date.now()),
        updatedAt: pos.updated_at ? new Date(pos.updated_at) : new Date(pos.updatedAt || Date.now()),
      })),
    };
  }

  async createJobPosition(data: {
    name: string;
    description?: string;
    isActive?: boolean;
    order?: number;
  }): Promise<{ position: JobPosition; message: string }> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/job-positions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: data.name,
        description: data.description || null,
        is_active: data.isActive !== undefined ? data.isActive : true,
        order: data.order || 0,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao criar área de interesse');
    }

    const result = await response.json();
    return {
      position: {
        id: result.position.id,
        name: result.position.name,
        description: result.position.description || undefined,
        isActive: result.position.is_active !== undefined ? result.position.is_active : result.position.isActive,
        order: result.position.order,
        createdAt: result.position.created_at ? new Date(result.position.created_at) : new Date(result.position.createdAt || Date.now()),
        updatedAt: result.position.updated_at ? new Date(result.position.updated_at) : new Date(result.position.updatedAt || Date.now()),
      },
      message: result.message,
    };
  }

  async updateJobPosition(id: string, data: {
    name?: string;
    description?: string;
    isActive?: boolean;
    order?: number;
  }): Promise<{ position: JobPosition; message: string }> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/job-positions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: data.name,
        description: data.description !== undefined ? data.description : null,
        is_active: data.isActive,
        order: data.order,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao atualizar área de interesse');
    }

    const result = await response.json();
    return {
      position: {
        id: result.position.id,
        name: result.position.name,
        description: result.position.description || undefined,
        isActive: result.position.is_active !== undefined ? result.position.is_active : result.position.isActive,
        order: result.position.order,
        createdAt: result.position.created_at ? new Date(result.position.created_at) : new Date(result.position.createdAt || Date.now()),
        updatedAt: result.position.updated_at ? new Date(result.position.updated_at) : new Date(result.position.updatedAt || Date.now()),
      },
      message: result.message,
    };
  }

  async deleteJobPosition(id: string): Promise<{ message: string }> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/job-positions/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao remover área de interesse');
    }

    const result = await response.json();
    return { message: result.message };
  }

  // ========== RECRUITMENT PROCESSES ==========
  async getRecruitmentProcesses(filters?: { status?: string; positionId?: string }): Promise<{ processes: RecruitmentProcess[] }> {
    const token = localStorage.getItem('token');
    let url = `${API_BASE_URL}/recruitment/processes`;
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }
    if (filters?.positionId && filters.positionId !== 'all') {
      params.append('positionId', filters.positionId);
    }
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao buscar processos seletivos');
    }
    const data = await response.json();
    return {
      processes: (data.processes || []).map((proc: any) => ({
        id: proc.id,
        title: proc.title,
        description: proc.description,
        positionId: proc.position_id || proc.positionId,
        position: proc.position ? {
          id: proc.position.id,
          name: proc.position.name,
          description: proc.position.description,
          isActive: proc.position.is_active !== undefined ? proc.position.is_active : proc.position.isActive,
          order: proc.position.order,
          createdAt: proc.position.created_at ? new Date(proc.position.created_at) : new Date(proc.position.createdAt || Date.now()),
          updatedAt: proc.position.updated_at ? new Date(proc.position.updated_at) : new Date(proc.position.updatedAt || Date.now()),
        } : undefined,
        status: proc.status,
        requirements: proc.requirements,
        benefits: proc.benefits,
        salaryRange: proc.salary_range || proc.salaryRange,
        workMode: proc.work_mode || proc.workMode,
        location: proc.location,
        deadline: proc.deadline ? new Date(proc.deadline) : undefined,
        createdBy: proc.created_by || proc.createdBy,
        createdAt: proc.created_at ? new Date(proc.created_at) : new Date(proc.createdAt || Date.now()),
        updatedAt: proc.updated_at ? new Date(proc.updated_at) : new Date(proc.updatedAt || Date.now()),
        candidates: proc.candidates?.map((c: any) => this.normalizeRecruitmentCandidate(c)) || [],
        _count: proc._count,
      })),
    };
  }

  async getRecruitmentProcess(id: string): Promise<{ process: RecruitmentProcess }> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/recruitment/processes/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao buscar processo seletivo');
    }
    const data = await response.json();
    return {
      process: {
        id: data.process.id,
        title: data.process.title,
        description: data.process.description,
        positionId: data.process.position_id || data.process.positionId,
        position: data.process.position ? {
          id: data.process.position.id,
          name: data.process.position.name,
          description: data.process.position.description,
          isActive: data.process.position.is_active !== undefined ? data.process.position.is_active : data.process.position.isActive,
          order: data.process.position.order,
          createdAt: data.process.position.created_at ? new Date(data.process.position.created_at) : new Date(data.process.position.createdAt || Date.now()),
          updatedAt: data.process.position.updated_at ? new Date(data.process.position.updated_at) : new Date(data.process.position.updatedAt || Date.now()),
        } : undefined,
        status: data.process.status,
        requirements: data.process.requirements,
        benefits: data.process.benefits,
        salaryRange: data.process.salary_range || data.process.salaryRange,
        workMode: data.process.work_mode || data.process.workMode,
        location: data.process.location,
        deadline: data.process.deadline ? new Date(data.process.deadline) : undefined,
        createdBy: data.process.created_by || data.process.createdBy,
        createdAt: data.process.created_at ? new Date(data.process.created_at) : new Date(data.process.createdAt || Date.now()),
        updatedAt: data.process.updated_at ? new Date(data.process.updated_at) : new Date(data.process.updatedAt || Date.now()),
        candidates: (data.process.candidates || []).map((c: any) => this.normalizeRecruitmentCandidate(c)),
      },
    };
  }

  async createRecruitmentProcess(data: {
    title: string;
    description?: string;
    positionId: string;
    status?: 'draft' | 'open' | 'in_progress' | 'closed' | 'cancelled';
    requirements?: string;
    benefits?: string;
    salaryRange?: string;
    workMode?: string;
    location?: string;
    deadline?: Date | string;
  }): Promise<{ process: RecruitmentProcess; message: string }> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/recruitment/processes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: data.title,
        description: data.description || null,
        position_id: data.positionId,
        status: data.status || 'draft',
        requirements: data.requirements || null,
        benefits: data.benefits || null,
        salary_range: data.salaryRange || null,
        work_mode: data.workMode || null,
        location: data.location || null,
        deadline: data.deadline ? (typeof data.deadline === 'string' ? data.deadline : data.deadline.toISOString()) : null,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao criar processo seletivo');
    }

    const result = await response.json();
    return {
      process: {
        id: result.process.id,
        title: result.process.title,
        description: result.process.description,
        positionId: result.process.position_id || result.process.positionId,
        position: result.process.position ? {
          id: result.process.position.id,
          name: result.process.position.name,
          description: result.process.position.description,
          isActive: result.process.position.is_active !== undefined ? result.process.position.is_active : result.process.position.isActive,
          order: result.process.position.order,
          createdAt: result.process.position.created_at ? new Date(result.process.position.created_at) : new Date(result.process.position.createdAt || Date.now()),
          updatedAt: result.process.position.updated_at ? new Date(result.process.position.updated_at) : new Date(result.process.position.updatedAt || Date.now()),
        } : undefined,
        status: result.process.status,
        requirements: result.process.requirements,
        benefits: result.process.benefits,
        salaryRange: result.process.salary_range || result.process.salaryRange,
        workMode: result.process.work_mode || result.process.workMode,
        location: result.process.location,
        deadline: result.process.deadline ? new Date(result.process.deadline) : undefined,
        createdBy: result.process.created_by || result.process.createdBy,
        createdAt: result.process.created_at ? new Date(result.process.created_at) : new Date(result.process.createdAt || Date.now()),
        updatedAt: result.process.updated_at ? new Date(result.process.updated_at) : new Date(result.process.updatedAt || Date.now()),
      },
      message: result.message,
    };
  }

  async updateRecruitmentProcess(id: string, data: {
    title?: string;
    description?: string;
    positionId?: string;
    status?: 'draft' | 'open' | 'in_progress' | 'closed' | 'cancelled';
    requirements?: string;
    benefits?: string;
    salaryRange?: string;
    workMode?: string;
    location?: string;
    deadline?: Date | string | null;
  }): Promise<{ process: RecruitmentProcess; message: string }> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/recruitment/processes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: data.title,
        description: data.description !== undefined ? data.description : null,
        position_id: data.positionId,
        status: data.status,
        requirements: data.requirements !== undefined ? data.requirements : null,
        benefits: data.benefits !== undefined ? data.benefits : null,
        salary_range: data.salaryRange !== undefined ? data.salaryRange : null,
        work_mode: data.workMode !== undefined ? data.workMode : null,
        location: data.location !== undefined ? data.location : null,
        deadline: data.deadline !== undefined ? (data.deadline === null ? null : (typeof data.deadline === 'string' ? data.deadline : data.deadline.toISOString())) : undefined,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao atualizar processo seletivo');
    }

    const result = await response.json();
    return {
      process: {
        id: result.process.id,
        title: result.process.title,
        description: result.process.description,
        positionId: result.process.position_id || result.process.positionId,
        position: result.process.position ? {
          id: result.process.position.id,
          name: result.process.position.name,
          description: result.process.position.description,
          isActive: result.process.position.is_active !== undefined ? result.process.position.is_active : result.process.position.isActive,
          order: result.process.position.order,
          createdAt: result.process.position.created_at ? new Date(result.process.position.created_at) : new Date(result.process.position.createdAt || Date.now()),
          updatedAt: result.process.position.updated_at ? new Date(result.process.position.updated_at) : new Date(result.process.position.updatedAt || Date.now()),
        } : undefined,
        status: result.process.status,
        requirements: result.process.requirements,
        benefits: result.process.benefits,
        salaryRange: result.process.salary_range || result.process.salaryRange,
        workMode: result.process.work_mode || result.process.workMode,
        location: result.process.location,
        deadline: result.process.deadline ? new Date(result.process.deadline) : undefined,
        createdBy: result.process.created_by || result.process.createdBy,
        createdAt: result.process.created_at ? new Date(result.process.created_at) : new Date(result.process.createdAt || Date.now()),
        updatedAt: result.process.updated_at ? new Date(result.process.updated_at) : new Date(result.process.updatedAt || Date.now()),
      },
      message: result.message,
    };
  }

  async deleteRecruitmentProcess(id: string): Promise<{ message: string }> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/recruitment/processes/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao remover processo seletivo');
    }

    const result = await response.json();
    return { message: result.message };
  }

  async getAvailableCandidates(processId: string): Promise<{ candidates: JobApplication[] }> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/recruitment/processes/${processId}/candidates/available`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao buscar candidatos disponíveis');
    }
    const data = await response.json();
    return {
      candidates: (data.candidates || []).map((app: any) => ({
        id: app.id,
        name: app.name,
        email: app.email,
        phone: app.phone || undefined,
        position: app.position || undefined,
        positionId: app.position_id || app.positionId || undefined,
        jobPosition: app.job_position ? {
          id: app.job_position.id,
          name: app.job_position.name,
          description: app.job_position.description,
          isActive: app.job_position.is_active !== undefined ? app.job_position.is_active : app.job_position.isActive,
          order: app.job_position.order,
          createdAt: app.job_position.created_at ? new Date(app.job_position.created_at) : new Date(app.job_position.createdAt || Date.now()),
          updatedAt: app.job_position.updated_at ? new Date(app.job_position.updated_at) : new Date(app.job_position.updatedAt || Date.now()),
        } : undefined,
        linkedinUrl: app.linkedin_url || app.linkedinUrl || undefined,
        message: app.message || undefined,
        cvUrl: app.cv_url || app.cvUrl || undefined,
        isRead: app.is_read !== undefined ? app.is_read : !!app.isRead,
        createdAt: app.created_at ? new Date(app.created_at) : new Date(app.createdAt || Date.now()),
      })),
    };
  }

  async addCandidateToProcess(processId: string, data: {
    applicationId: string;
    notes?: string;
  }): Promise<{ candidate: RecruitmentCandidate; message: string }> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/recruitment/processes/${processId}/candidates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        application_id: data.applicationId,
        notes: data.notes || null,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao adicionar candidato ao processo');
    }

    const result = await response.json();
    return {
      candidate: this.normalizeRecruitmentCandidate(result.candidate),
      message: result.message,
    };
  }

  async updateCandidateStatus(processId: string, candidateId: string, data: {
    status?: 'pending' | 'screening' | 'interview' | 'evaluation' | 'approved' | 'rejected' | 'hired';
    currentStage?: string;
    notes?: string;
    rating?: number;
    interviewDate?: Date | string;
    interviewNotes?: string;
    evaluationScore?: number;
    rejectionReason?: string;
    hiredDate?: Date | string;
  }): Promise<{ candidate: RecruitmentCandidate; message: string }> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/recruitment/candidates/${candidateId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        status: data.status,
        current_stage: data.currentStage,
        notes: data.notes,
        rating: data.rating,
        interview_date: data.interviewDate ? (typeof data.interviewDate === 'string' ? data.interviewDate : data.interviewDate.toISOString()) : null,
        interview_notes: data.interviewNotes,
        evaluation_score: data.evaluationScore,
        rejection_reason: data.rejectionReason,
        hired_date: data.hiredDate ? (typeof data.hiredDate === 'string' ? data.hiredDate : data.hiredDate.toISOString()) : null,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao atualizar status do candidato');
    }

    const result = await response.json();
    return {
      candidate: this.normalizeRecruitmentCandidate(result.candidate),
      message: result.message,
    };
  }

  async removeCandidateFromProcess(processId: string, candidateId: string): Promise<{ message: string }> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/recruitment/candidates/${candidateId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao remover candidato do processo');
    }

    const result = await response.json();
    return { message: result.message };
  }

  private normalizeRecruitmentCandidate(c: any): RecruitmentCandidate {
    return {
      id: c.id,
      processId: c.process_id || c.processId,
      applicationId: c.application_id || c.applicationId,
      status: c.status,
      currentStage: c.current_stage || c.currentStage,
      notes: c.notes,
      rating: c.rating,
      interviewDate: c.interview_date ? new Date(c.interview_date) : c.interviewDate ? new Date(c.interviewDate) : undefined,
      interviewNotes: c.interview_notes || c.interviewNotes,
      evaluationScore: c.evaluation_score || c.evaluationScore,
      rejectionReason: c.rejection_reason || c.rejectionReason,
      hiredDate: c.hired_date ? new Date(c.hired_date) : c.hiredDate ? new Date(c.hiredDate) : undefined,
      createdAt: c.created_at ? new Date(c.created_at) : new Date(c.createdAt || Date.now()),
      updatedAt: c.updated_at ? new Date(c.updated_at) : new Date(c.updatedAt || Date.now()),
      application: c.application ? {
        id: c.application.id,
        name: c.application.name,
        email: c.application.email,
        phone: c.application.phone || undefined,
        position: c.application.position || undefined,
        positionId: c.application.position_id || c.application.positionId || undefined,
        jobPosition: c.application.job_position ? {
          id: c.application.job_position.id,
          name: c.application.job_position.name,
          description: c.application.job_position.description,
          isActive: c.application.job_position.is_active !== undefined ? c.application.job_position.is_active : c.application.job_position.isActive,
          order: c.application.job_position.order,
          createdAt: c.application.job_position.created_at ? new Date(c.application.job_position.created_at) : new Date(c.application.job_position.createdAt || Date.now()),
          updatedAt: c.application.job_position.updated_at ? new Date(c.application.job_position.updated_at) : new Date(c.application.job_position.updatedAt || Date.now()),
        } : undefined,
        linkedinUrl: c.application.linkedin_url || c.application.linkedinUrl || undefined,
        message: c.application.message || undefined,
        cvUrl: c.application.cv_url || c.application.cvUrl || undefined,
        isRead: c.application.is_read !== undefined ? c.application.is_read : !!c.application.isRead,
        createdAt: c.application.created_at ? new Date(c.application.created_at) : new Date(c.application.createdAt || Date.now()),
      } : undefined,
      process: c.process ? {
        id: c.process.id,
        title: c.process.title,
        description: c.process.description,
        positionId: c.process.position_id || c.process.positionId,
        status: c.process.status,
        createdAt: c.process.created_at ? new Date(c.process.created_at) : new Date(c.process.createdAt || Date.now()),
        updatedAt: c.process.updated_at ? new Date(c.process.updated_at) : new Date(c.process.updatedAt || Date.now()),
      } : undefined,
    };
  }

  async evaluateCandidateStage(candidateId: string, stageId: string, data: {
    status: 'pending' | 'approved' | 'rejected';
    score?: number;
    feedback?: string;
  }): Promise<{ candidateStage: any; candidate: any; message: string }> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/recruitment/candidates/${candidateId}/stages/${stageId}/evaluate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Erro ao avaliar etapa');
    }

    const result = await response.json();
    return { candidateStage: result.candidateStage, candidate: result.candidate, message: result.message };
  }

  async addNoteToCandidate(candidateId: string, note: string, noteType?: string): Promise<{ note: any; message: string }> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/recruitment/candidates/${candidateId}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        note,
        note_type: noteType || 'general',
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Erro ao adicionar nota');
    }

    const result = await response.json();
    return { note: result.note, message: result.message };
  }

  async deleteRecruitmentNote(id: string): Promise<{ message: string }> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/recruitment/notes/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Erro ao remover nota');
    }

    const result = await response.json();
    return { message: result.message };
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

  // Features
  async getFeatures(): Promise<{ features: any[] }> {
    try {
      const resp = await this.request<any>('/sections/features');
      return { features: (resp.features || []).map((f: any) => ({
        id: f.id,
        icon: f.icon,
        title: f.title,
        description: f.description,
        order: f.order || 0,
        isActive: f.is_active !== undefined ? f.is_active : f.isActive !== undefined ? f.isActive : true,
        createdAt: f.created_at ? new Date(f.created_at) : (f.createdAt ? new Date(f.createdAt) : new Date()),
        updatedAt: f.updated_at ? new Date(f.updated_at) : (f.updatedAt ? new Date(f.updatedAt) : new Date()),
      })) };
    } catch (error) {
      console.error('Erro ao buscar features:', error);
      return { features: [] };
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

  // Hero Image Upload
  async uploadHeroImage(file: File, type: 'background' | 'hero'): Promise<{ data: { url: string, type: string }, hero: Hero }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/hero/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.details || 'Erro ao fazer upload');
    }

    const resp = await response.json();
    return { data: resp.data, hero: resp.hero };
  }

  async deleteHeroImage(type: 'background' | 'hero'): Promise<{ hero: Hero }> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/hero/image/${type}`, {
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

  // Services Section
  async getServicesSection(): Promise<{ services: any }> {
    const response = await fetch(`${API_BASE_URL}/sections/services`);
    if (!response.ok) {
      throw new Error('Erro ao buscar seção de serviços');
    }
    const data = await response.json();
    return { services: data.services };
  }

  async updateServicesSection(data: {
    badge_text?: string | null;
    title_line1?: string | null;
    title_line2?: string | null;
    description?: string | null;
    years_highlight?: string | null;
    background_image_url?: string | null;
  }): Promise<{ services: any }> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/sections/services`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao atualizar seção de serviços');
    }
    const result = await response.json();
    return { services: result.services };
  }

  async uploadServicesImage(file: File): Promise<{ data: { url: string }, services: any }> {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/sections/services/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.details || 'Erro ao fazer upload');
    }

    const resp = await response.json();
    return { data: resp.data, services: resp.services };
  }

  async deleteServicesImage(): Promise<{ services: any }> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/sections/services/image`, {
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
    return { services: resp.services };
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

  // Landing Pages
  async getLandingPages(publishedOnly?: boolean): Promise<{ landingPages: any[] }> {
    const query = publishedOnly ? '?published_only=true' : '';
    const response = await this.request<{ landingPages: any[] }>(`/landing-pages${query}`);
    return {
      landingPages: (response.landingPages || []).map(page => ({
        id: page.id,
        title: page.title,
        slug: page.slug,
        description: page.description,
        hero_title: page.hero_title,
        hero_subtitle: page.hero_subtitle,
        hero_image_url: page.hero_image_url,
        hero_background_color: page.hero_background_color,
        content: page.content,
        featured_image_url: page.featured_image_url,
        meta_title: page.meta_title,
        meta_description: page.meta_description,
        meta_keywords: page.meta_keywords,
        is_active: page.is_active,
        is_published: page.is_published,
        published_at: page.published_at ? new Date(page.published_at) : null,
        created_at: page.created_at ? new Date(page.created_at) : new Date(),
        updated_at: page.updated_at ? new Date(page.updated_at) : new Date(),
        form_fields: page.form_fields || [],
        _count: page._count,
      }))
    };
  }

  async getLandingPageBySlug(slug: string): Promise<{ landingPage: any }> {
    const response = await this.request<{ landingPage: any }>(`/landing-pages/slug/${slug}`);
    return {
      landingPage: {
        ...response.landingPage,
        created_at: response.landingPage.created_at ? new Date(response.landingPage.created_at) : new Date(),
        updated_at: response.landingPage.updated_at ? new Date(response.landingPage.updated_at) : new Date(),
        published_at: response.landingPage.published_at ? new Date(response.landingPage.published_at) : null,
        form_fields: (response.landingPage.form_fields || []).map((field: any) => ({
          ...field,
          created_at: field.created_at ? new Date(field.created_at) : new Date(),
          updated_at: field.updated_at ? new Date(field.updated_at) : new Date(),
        })),
      }
    };
  }

  async getLandingPageById(id: string): Promise<{ landingPage: any }> {
    const response = await this.request<{ landingPage: any }>(`/admin/landing-pages/${id}`);
    return {
      landingPage: {
        ...response.landingPage,
        created_at: response.landingPage.created_at ? new Date(response.landingPage.created_at) : new Date(),
        updated_at: response.landingPage.updated_at ? new Date(response.landingPage.updated_at) : new Date(),
        published_at: response.landingPage.published_at ? new Date(response.landingPage.published_at) : null,
        form_fields: (response.landingPage.form_fields || []).map((field: any) => ({
          ...field,
          created_at: field.created_at ? new Date(field.created_at) : new Date(),
          updated_at: field.updated_at ? new Date(field.updated_at) : new Date(),
        })),
      }
    };
  }

  async createLandingPage(data: any): Promise<{ landingPage: any }> {
    const response = await this.request<{ landingPage: any }>('/admin/landing-pages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return {
      landingPage: {
        ...response.landingPage,
        created_at: response.landingPage.created_at ? new Date(response.landingPage.created_at) : new Date(),
        updated_at: response.landingPage.updated_at ? new Date(response.landingPage.updated_at) : new Date(),
        published_at: response.landingPage.published_at ? new Date(response.landingPage.published_at) : null,
      }
    };
  }

  async updateLandingPage(id: string, data: any): Promise<{ landingPage: any }> {
    const response = await this.request<{ landingPage: any }>(`/admin/landing-pages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return {
      landingPage: {
        ...response.landingPage,
        created_at: response.landingPage.created_at ? new Date(response.landingPage.created_at) : new Date(),
        updated_at: response.landingPage.updated_at ? new Date(response.landingPage.updated_at) : new Date(),
        published_at: response.landingPage.published_at ? new Date(response.landingPage.published_at) : null,
        form_fields: (response.landingPage.form_fields || []).map((field: any) => ({
          ...field,
          created_at: field.created_at ? new Date(field.created_at) : new Date(),
          updated_at: field.updated_at ? new Date(field.updated_at) : new Date(),
        })),
      }
    };
  }

  async deleteLandingPage(id: string): Promise<void> {
    await this.request(`/admin/landing-pages/${id}`, {
      method: 'DELETE',
    });
  }

  async uploadLandingPageImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE_URL}/admin/landing-pages/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Erro ao fazer upload da imagem');
    }

    const data = await response.json();
    return { url: data.url };
  }

  // Form Fields
  async createFormField(data: any): Promise<{ formField: any }> {
    const response = await this.request<{ formField: any }>('/admin/form-fields', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return {
      formField: {
        ...response.formField,
        created_at: response.formField.created_at ? new Date(response.formField.created_at) : new Date(),
        updated_at: response.formField.updated_at ? new Date(response.formField.updated_at) : new Date(),
      }
    };
  }

  async updateFormField(id: string, data: any): Promise<{ formField: any }> {
    const response = await this.request<{ formField: any }>(`/admin/form-fields/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return {
      formField: {
        ...response.formField,
        created_at: response.formField.created_at ? new Date(response.formField.created_at) : new Date(),
        updated_at: response.formField.updated_at ? new Date(response.formField.updated_at) : new Date(),
      }
    };
  }

  async deleteFormField(id: string): Promise<void> {
    await this.request(`/admin/form-fields/${id}`, {
      method: 'DELETE',
    });
  }

  async reorderFormFields(fieldIds: string[]): Promise<void> {
    await this.request('/admin/form-fields/reorder', {
      method: 'PUT',
      body: JSON.stringify({ fieldIds }),
    });
  }

  // Form Submissions
  async getFormSubmissions(landingPageId?: string): Promise<{ submissions: any[] }> {
    const query = landingPageId ? `?landing_page_id=${landingPageId}` : '';
    const response = await this.request<{ submissions: any[] }>(`/admin/form-submissions${query}`);
    return {
      submissions: (response.submissions || []).map(sub => ({
        ...sub,
        created_at: sub.created_at ? new Date(sub.created_at) : new Date(),
        form_data: typeof sub.form_data === 'string' ? JSON.parse(sub.form_data) : sub.form_data,
      }))
    };
  }

  async getFormSubmissionById(id: string): Promise<{ submission: any }> {
    const response = await this.request<{ submission: any }>(`/admin/form-submissions/${id}`);
    return {
      submission: {
        ...response.submission,
        created_at: response.submission.created_at ? new Date(response.submission.created_at) : new Date(),
        form_data: typeof response.submission.form_data === 'string' 
          ? JSON.parse(response.submission.form_data) 
          : response.submission.form_data,
      }
    };
  }

  async submitForm(landingPageId: string, formData: Record<string, any>): Promise<{ message: string; submission: any }> {
    // Separar captchaToken e honeypot do formData
    const { captchaToken, honeypot, ...actualFormData } = formData;
    return this.request(`/landing-pages/${landingPageId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ 
        landing_page_id: landingPageId, 
        form_data: actualFormData,
        captchaToken: captchaToken,
        honeypot: honeypot,
      }),
    });
  }

  async markSubmissionAsRead(id: string, isRead: boolean = true): Promise<{ submission: any }> {
    return this.request(`/admin/form-submissions/${id}/read`, {
      method: 'PUT',
      body: JSON.stringify({ is_read: isRead }),
    });
  }

  async deleteFormSubmission(id: string): Promise<void> {
    await this.request(`/admin/form-submissions/${id}`, {
      method: 'DELETE',
    });
  }

  // Formulários Reutilizáveis
  async getForms(activeOnly?: boolean): Promise<{ forms: any[] }> {
    const query = activeOnly ? '?active_only=true' : '';
    const response = await this.request<{ forms: any[] }>(`/forms${query}`);
    return {
      forms: (response.forms || []).map(form => ({
        id: form.id,
        title: form.title,
        slug: form.slug,
        description: form.description,
        is_active: form.is_active,
        created_at: form.created_at ? new Date(form.created_at) : new Date(),
        updated_at: form.updated_at ? new Date(form.updated_at) : new Date(),
        fields: form.fields || [],
        _count: form._count,
      }))
    };
  }

  async getFormById(id: string): Promise<{ form: any }> {
    const response = await this.request<{ form: any }>(`/admin/forms/${id}`);
    return {
      form: {
        ...response.form,
        created_at: response.form.created_at ? new Date(response.form.created_at) : new Date(),
        updated_at: response.form.updated_at ? new Date(response.form.updated_at) : new Date(),
        fields: (response.form.fields || []).map((field: any) => ({
          ...field,
          created_at: field.created_at ? new Date(field.created_at) : new Date(),
          updated_at: field.updated_at ? new Date(field.updated_at) : new Date(),
        })),
      }
    };
  }

  async getFormBySlug(slug: string): Promise<{ form: any }> {
    const response = await this.request<{ form: any }>(`/forms/slug/${slug}`);
    return {
      form: {
        ...response.form,
        created_at: response.form.created_at ? new Date(response.form.created_at) : new Date(),
        updated_at: response.form.updated_at ? new Date(response.form.updated_at) : new Date(),
        fields: (response.form.fields || []).map((field: any) => ({
          ...field,
          created_at: field.created_at ? new Date(field.created_at) : new Date(),
          updated_at: field.updated_at ? new Date(field.updated_at) : new Date(),
        })),
      }
    };
  }

  async createForm(data: any): Promise<{ form: any }> {
    const response = await this.request<{ form: any }>('/admin/forms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return {
      form: {
        ...response.form,
        created_at: response.form.created_at ? new Date(response.form.created_at) : new Date(),
        updated_at: response.form.updated_at ? new Date(response.form.updated_at) : new Date(),
      }
    };
  }

  async updateForm(id: string, data: any): Promise<{ form: any }> {
    const response = await this.request<{ form: any }>(`/admin/forms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return {
      form: {
        ...response.form,
        created_at: response.form.created_at ? new Date(response.form.created_at) : new Date(),
        updated_at: response.form.updated_at ? new Date(response.form.updated_at) : new Date(),
      }
    };
  }

  async deleteForm(id: string): Promise<void> {
    await this.request(`/admin/forms/${id}`, {
      method: 'DELETE',
    });
  }

  async createReusableFormField(data: any): Promise<{ formField: any }> {
    const response = await this.request<{ formField: any }>('/admin/form-fields/reusable', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return {
      formField: {
        ...response.formField,
        created_at: response.formField.created_at ? new Date(response.formField.created_at) : new Date(),
        updated_at: response.formField.updated_at ? new Date(response.formField.updated_at) : new Date(),
      }
    };
  }

  async updateReusableFormField(id: string, data: any): Promise<{ formField: any }> {
    const response = await this.request<{ formField: any }>(`/admin/form-fields/reusable/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return {
      formField: {
        ...response.formField,
        created_at: response.formField.created_at ? new Date(response.formField.created_at) : new Date(),
        updated_at: response.formField.updated_at ? new Date(response.formField.updated_at) : new Date(),
      }
    };
  }

  async deleteReusableFormField(id: string): Promise<void> {
    await this.request(`/admin/form-fields/reusable/${id}`, {
      method: 'DELETE',
    });
  }

  async submitReusableForm(formId: string, formData: Record<string, any>, landingPageId?: string): Promise<{ message: string; submission: any }> {
    const { captchaToken, honeypot, ...actualFormData } = formData;
    return this.request(`/forms/${formId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ 
        form_id: formId,
        landing_page_id: landingPageId,
        form_data: actualFormData,
        captchaToken: captchaToken,
        honeypot: honeypot,
      }),
    });
  }
}

export const apiService = new ApiService();
