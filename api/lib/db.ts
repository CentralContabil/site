// Simple in-memory database for development
export interface DbSlide {
  id: string;
  title: string;
  subtitle?: string;
  image_url: string;
  button_text?: string;
  button_link?: string;
  order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface DbService {
  id: string;
  name: string;
  description: string;
  icon?: string;
  order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface DbTestimonial {
  id: string;
  client_name: string;
  company?: string;
  testimonial_text: string;
  client_image_url?: string;
  order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface DbConfiguration {
  id: string;
  company_name: string;
  phone?: string;
  email?: string;
  address?: string;
  business_hours?: string;
  facebook_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  updated_at: Date;
}

export interface DbAdmin {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface DbContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  service_type?: string;
  message: string;
  is_read: boolean;
  created_at: Date;
}

// In-memory database
class InMemoryDB {
  private slides: DbSlide[] = [];
  private services: DbService[] = [];
  private testimonials: DbTestimonial[] = [];
  private configurations: DbConfiguration[] = [];
  private admins: DbAdmin[] = [];
  private contactMessages: DbContactMessage[] = [];

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Initialize with default data
    this.admins = [{
      id: 'admin-1',
      email: 'sistema@central-rnc.com.br',
      password_hash: '$2b$10$3AXl3Zw5F5PE6TE45YzT/unrX7krjhdEyR7CBROWPU6MF5KUoO5UO', // admin123
      name: 'Administrador Central RNC',
      created_at: new Date(),
      updated_at: new Date(),
    }];

    this.configurations = [{
      id: 'config-1',
      company_name: 'Central Contábil',
      phone: '(11) 1234-5678',
      email: 'sistema@central-rnc.com.br',
      address: 'Rua das Palmeiras, 123 - Centro, São Paulo/SP',
      business_hours: 'Segunda a Sexta: 8h às 18h',
      facebook_url: 'https://facebook.com/contabilsilva',
      instagram_url: 'https://instagram.com/contabilsilva',
      linkedin_url: 'https://linkedin.com/company/contabilsilva',
      updated_at: new Date(),
    }];

    this.slides = [
      {
        id: 'slide-1',
        title: 'Soluções Contábeis Personalizadas',
        subtitle: 'Especialistas em contabilidade para pequenas e médias empresas',
        image_url: 'https://images.unsplash.com/photo-1554224155-6726b468ff31?w=1200&h=800&fit=crop',
        button_text: 'Saiba Mais',
        button_link: '#servicos',
        order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 'slide-2',
        title: 'Assessoria Tributária Especializada',
        subtitle: 'Minimize seus custos com planejamento tributário inteligente',
        image_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=800&fit=crop',
        button_text: 'Entre em Contato',
        button_link: '#contato',
        order: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 'slide-3',
        title: 'Abertura de Empresa Simplificada',
        subtitle: 'Comece seu negócio com toda assessoria contábil necessária',
        image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=800&fit=crop',
        button_text: 'Solicite um Orçamento',
        button_link: '#contato',
        order: 3,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    this.services = [
      {
        id: 'service-1',
        name: 'Abertura de Empresa',
        description: 'Assessoria completa para abertura de CNPJ, escolha do regime tributário e legalização do seu negócio. Cuidamos de todo o processo burocrático para você.',
        icon: 'building',
        order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 'service-2',
        name: 'Contabilidade Consultiva',
        description: 'Serviços contábeis com análise detalhada e orientação estratégica para crescimento do seu negócio. Transforme dados em decisões inteligentes.',
        icon: 'calculator',
        order: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 'service-3',
        name: 'Departamento Pessoal',
        description: 'Gestão completa de folha de pagamento, admissões, demissões e obrigações trabalhistas. Garantia de conformidade com a legislação.',
        icon: 'users',
        order: 3,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 'service-4',
        name: 'Fiscal e Tributária',
        description: 'Planejamento tributário, elaboração de guias e cumprimento de obrigações fiscais. Reduza custos dentro da legalidade.',
        icon: 'file-text',
        order: 4,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 'service-5',
        name: 'Legalização de Empresas',
        description: 'Regularização de empresas com pendências fiscais e trabalhistas junto aos órgãos competentes. Recupere a saúde do seu negócio.',
        icon: 'shield',
        order: 5,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 'service-6',
        name: 'Assessoria Financeira',
        description: 'Análise de demonstrativos financeiros e orientação para melhoria da saúde financeira. Tomar decisões baseadas em dados.',
        icon: 'trending-up',
        order: 6,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    this.testimonials = [
      {
        id: 'testimonial-1',
        client_name: 'João Silva',
        company: 'Silva & Associados',
        testimonial_text: 'Excelente serviço! A equipe é muito profissional e atenciosa. Nos ajudou a organizar toda a contabilidade da empresa com muita eficiência. Super recomendo!',
        order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 'testimonial-2',
        client_name: 'Maria Santos',
        company: 'Comércio Varejista Ltda',
        testimonial_text: 'Estou muito satisfeita com os serviços prestados. A assessoria tributária fez toda a diferença para o crescimento do meu negócio. Profissionais excelentes!',
        order: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 'testimonial-3',
        client_name: 'Pedro Oliveira',
        company: 'Tecnologia Inovadora',
        testimonial_text: 'Profissionais extremamente competentes. Sempre disponíveis para tirar dúvidas e oferecer as melhores soluções contábeis. São parceiros fundamentais para nossa empresa.',
        order: 3,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];
  }

  // Admin methods
  async findAdminByEmail(email: string): Promise<DbAdmin | null> {
    return this.admins.find(admin => admin.email === email) || null;
  }

  async findAdminById(id: string): Promise<DbAdmin | null> {
    return this.admins.find(admin => admin.id === id) || null;
  }

  // Synchronous methods for controllers
  getAdmin(id: string): DbAdmin | null {
    return this.admins.find(admin => admin.id === id) || null;
  }

  getAdminByEmail(email: string): DbAdmin | null {
    return this.admins.find(admin => admin.email === email) || null;
  }

  // Configuration methods
  async getConfiguration(): Promise<DbConfiguration | null> {
    return this.configurations[0] || null;
  }

  async updateConfiguration(data: Partial<DbConfiguration>): Promise<DbConfiguration> {
    const config = this.configurations[0];
    if (config) {
      Object.assign(config, data, { updated_at: new Date() });
      return config;
    }
    return this.configurations[0];
  }

  // Synchronous configuration methods
  getConfigurationSync(): DbConfiguration | null {
    return this.configurations[0] || null;
  }

  updateConfigurationSync(data: Partial<DbConfiguration>): DbConfiguration {
    const config = this.configurations[0];
    if (config) {
      Object.assign(config, data, { updated_at: new Date() });
      return config;
    }
    return this.configurations[0];
  }

  // Slide methods
  async getSlides(activeOnly = false): Promise<DbSlide[]> {
    let slides = this.slides;
    if (activeOnly) {
      slides = slides.filter(slide => slide.is_active);
    }
    return slides.sort((a, b) => a.order - b.order);
  }

  async createSlide(data: Omit<DbSlide, 'id' | 'created_at' | 'updated_at'>): Promise<DbSlide> {
    const slide: DbSlide = {
      ...data,
      id: `slide-${Date.now()}`,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.slides.push(slide);
    return slide;
  }

  async updateSlide(id: string, data: Partial<DbSlide>): Promise<DbSlide | null> {
    const slide = this.slides.find(s => s.id === id);
    if (slide) {
      Object.assign(slide, data, { updated_at: new Date() });
      return slide;
    }
    return null;
  }

  async deleteSlide(id: string): Promise<boolean> {
    const index = this.slides.findIndex(s => s.id === id);
    if (index !== -1) {
      this.slides.splice(index, 1);
      return true;
    }
    return false;
  }

  // Synchronous slide methods
  getSlidesSync(activeOnly = false): DbSlide[] {
    let slides = this.slides;
    if (activeOnly) {
      slides = slides.filter(slide => slide.is_active);
    }
    return slides.sort((a, b) => a.order - b.order);
  }

  getSlide(id: string): DbSlide | null {
    return this.slides.find(s => s.id === id) || null;
  }

  createSlideSync(data: Omit<DbSlide, 'id' | 'created_at' | 'updated_at'>): DbSlide {
    const slide: DbSlide = {
      ...data,
      id: `slide-${Date.now()}`,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.slides.push(slide);
    return slide;
  }

  updateSlideSync(id: string, data: Partial<DbSlide>): DbSlide | null {
    const slide = this.slides.find(s => s.id === id);
    if (slide) {
      Object.assign(slide, data, { updated_at: new Date() });
      return slide;
    }
    return null;
  }

  deleteSlideSync(id: string): boolean {
    const index = this.slides.findIndex(s => s.id === id);
    if (index !== -1) {
      this.slides.splice(index, 1);
      return true;
    }
    return false;
  }

  // Service methods
  async getServices(activeOnly = false): Promise<DbService[]> {
    let services = this.services;
    if (activeOnly) {
      services = services.filter(service => service.is_active);
    }
    return services.sort((a, b) => a.order - b.order);
  }

  async createService(data: Omit<DbService, 'id' | 'created_at' | 'updated_at'>): Promise<DbService> {
    const service: DbService = {
      ...data,
      id: `service-${Date.now()}`,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.services.push(service);
    return service;
  }

  async updateService(id: string, data: Partial<DbService>): Promise<DbService | null> {
    const service = this.services.find(s => s.id === id);
    if (service) {
      Object.assign(service, data, { updated_at: new Date() });
      return service;
    }
    return null;
  }

  async deleteService(id: string): Promise<boolean> {
    const index = this.services.findIndex(s => s.id === id);
    if (index !== -1) {
      this.services.splice(index, 1);
      return true;
    }
    return false;
  }

  // Synchronous service methods
  getServicesSync(activeOnly = false): DbService[] {
    let services = this.services;
    if (activeOnly) {
      services = services.filter(service => service.is_active);
    }
    return services.sort((a, b) => a.order - b.order);
  }

  getService(id: string): DbService | null {
    return this.services.find(s => s.id === id) || null;
  }

  createServiceSync(data: Omit<DbService, 'id' | 'created_at' | 'updated_at'>): DbService {
    const service: DbService = {
      ...data,
      id: `service-${Date.now()}`,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.services.push(service);
    return service;
  }

  updateServiceSync(id: string, data: Partial<DbService>): DbService | null {
    const service = this.services.find(s => s.id === id);
    if (service) {
      Object.assign(service, data, { updated_at: new Date() });
      return service;
    }
    return null;
  }

  deleteServiceSync(id: string): boolean {
    const index = this.services.findIndex(s => s.id === id);
    if (index !== -1) {
      this.services.splice(index, 1);
      return true;
    }
    return false;
  }

  // Testimonial methods
  async getTestimonials(activeOnly = false): Promise<DbTestimonial[]> {
    let testimonials = this.testimonials;
    if (activeOnly) {
      testimonials = testimonials.filter(testimonial => testimonial.is_active);
    }
    return testimonials.sort((a, b) => a.order - b.order);
  }

  async createTestimonial(data: Omit<DbTestimonial, 'id' | 'created_at' | 'updated_at'>): Promise<DbTestimonial> {
    const testimonial: DbTestimonial = {
      ...data,
      id: `testimonial-${Date.now()}`,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.testimonials.push(testimonial);
    return testimonial;
  }

  async updateTestimonial(id: string, data: Partial<DbTestimonial>): Promise<DbTestimonial | null> {
    const testimonial = this.testimonials.find(t => t.id === id);
    if (testimonial) {
      Object.assign(testimonial, data, { updated_at: new Date() });
      return testimonial;
    }
    return null;
  }

  async deleteTestimonial(id: string): Promise<boolean> {
    const index = this.testimonials.findIndex(t => t.id === id);
    if (index !== -1) {
      this.testimonials.splice(index, 1);
      return true;
    }
    return false;
  }

  // Synchronous testimonial methods
  getTestimonialsSync(activeOnly = false): DbTestimonial[] {
    let testimonials = this.testimonials;
    if (activeOnly) {
      testimonials = testimonials.filter(testimonial => testimonial.is_active);
    }
    return testimonials.sort((a, b) => a.order - b.order);
  }

  getTestimonial(id: string): DbTestimonial | null {
    return this.testimonials.find(t => t.id === id) || null;
  }

  createTestimonialSync(data: Omit<DbTestimonial, 'id' | 'created_at' | 'updated_at'>): DbTestimonial {
    const testimonial: DbTestimonial = {
      ...data,
      id: `testimonial-${Date.now()}`,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.testimonials.push(testimonial);
    return testimonial;
  }

  updateTestimonialSync(id: string, data: Partial<DbTestimonial>): DbTestimonial | null {
    const testimonial = this.testimonials.find(t => t.id === id);
    if (testimonial) {
      Object.assign(testimonial, data, { updated_at: new Date() });
      return testimonial;
    }
    return null;
  }

  deleteTestimonialSync(id: string): boolean {
    const index = this.testimonials.findIndex(t => t.id === id);
    if (index !== -1) {
      this.testimonials.splice(index, 1);
      return true;
    }
    return false;
  }

  // Contact message methods
  async createContactMessage(data: Omit<DbContactMessage, 'id' | 'is_read' | 'created_at'>): Promise<DbContactMessage> {
    const message: DbContactMessage = {
      ...data,
      id: `contact-${Date.now()}`,
      is_read: false,
      created_at: new Date(),
    };
    this.contactMessages.push(message);
    return message;
  }

  // Synchronous contact message methods
  createContactMessageSync(data: Omit<DbContactMessage, 'id' | 'is_read' | 'created_at'>): DbContactMessage {
    const message: DbContactMessage = {
      ...data,
      id: `contact-${Date.now()}`,
      is_read: false,
      created_at: new Date(),
    };
    this.contactMessages.push(message);
    return message;
  }
}

export const db = new InMemoryDB();
export { InMemoryDB as InMemoryDatabase };