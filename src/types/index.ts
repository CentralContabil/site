export interface Slide {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  buttonText?: string;
  buttonLink?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  content?: string;
  icon?: string;
  imageUrl?: string;
  image_url?: string;
  order: number;
  isActive: boolean;
  is_active?: boolean;
  createdAt: Date;
  created_at?: Date;
  updatedAt: Date;
  updated_at?: Date;
}

export interface Testimonial {
  id: string;
  clientName: string;
  company?: string;
  testimonialText: string;
  clientImageUrl?: string;
  mediaType?: 'image' | 'video';
  mediaUrl?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Configuration {
  id: string;
  companyName: string;
  company_name?: string; // Para compatibilidade
  phone?: string;
  email?: string;
  contact_email?: string;
  contactEmail?: string;
  careers_email?: string;
  careersEmail?: string;
  address?: string;
  businessHours?: string;
  business_hours?: string; // Para compatibilidade
  facebookUrl?: string;
  facebook_url?: string; // Para compatibilidade
  instagramUrl?: string;
  instagram_url?: string; // Para compatibilidade
  linkedinUrl?: string;
  linkedin_url?: string; // Para compatibilidade
  logo_url?: string;
  logo_dark_url?: string;
  favicon_url?: string;
  whatsappNumber?: string;
  whatsapp_number?: string;
  footer_years_text?: string;
  footerYearsText?: string;
  hcaptcha_site_key?: string;
  hcaptchaSiteKey?: string;
  updatedAt: Date;
}

export interface ContactMessageReply {
  id: string;
  message: string;
  createdAt: Date;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  serviceType?: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  replies?: ContactMessageReply[];
}

export interface JobPosition {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  is_active?: boolean;
  order: number;
  createdAt: Date;
  created_at?: Date;
  updatedAt: Date;
  updated_at?: Date;
}

export interface JobApplication {
  positionId?: string;
  position_id?: string;
  jobPosition?: JobPosition;
  id: string;
  name: string;
  email: string;
  phone?: string;
  position?: string;
  linkedinUrl?: string;
  message?: string;
  cvUrl?: string;
  isRead: boolean;
  createdAt: Date;
}

export interface RecruitmentProcess {
  id: string;
  title: string;
  description?: string;
  positionId: string;
  position_id?: string;
  position?: JobPosition;
  status: 'draft' | 'open' | 'in_progress' | 'closed' | 'cancelled';
  requirements?: string;
  benefits?: string;
  salaryRange?: string;
  salary_range?: string;
  workMode?: string;
  work_mode?: string;
  location?: string;
  deadline?: Date | string;
  createdBy?: string;
  created_by?: string;
  createdAt: Date;
  created_at?: Date;
  updatedAt: Date;
  updated_at?: Date;
  candidates?: RecruitmentCandidate[];
  _count?: {
    candidates: number;
  };
}

export interface RecruitmentCandidate {
  id: string;
  processId: string;
  process_id?: string;
  applicationId: string;
  application_id?: string;
  status: 'pending' | 'screening' | 'interview' | 'evaluation' | 'approved' | 'rejected' | 'hired';
  currentStage?: string;
  current_stage?: string;
  notes?: string;
  rating?: number;
  interviewDate?: Date | string;
  interview_date?: Date | string;
  interviewNotes?: string;
  interview_notes?: string;
  evaluationScore?: number;
  evaluation_score?: number;
  rejectionReason?: string;
  rejection_reason?: string;
  hiredDate?: Date | string;
  hired_date?: Date | string;
  createdAt: Date;
  created_at?: Date;
  updatedAt: Date;
  updated_at?: Date;
  application?: JobApplication;
  process?: RecruitmentProcess;
}

export interface CareersPage {
  id: string;
  background_image_url?: string | null;
  hero_title?: string | null;
  hero_subtitle?: string | null;
  culture_title?: string | null;
  culture_text?: string | null;
  vacancies_title?: string | null;
  vacancies_text?: string | null;
  benefits_title?: string | null;
  benefits_text?: string | null;
  profile_title?: string | null;
  profile_text?: string | null;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface UpdateCareersPageRequest {
  background_image_url?: string | null;
  hero_title?: string | null;
  hero_subtitle?: string | null;
  culture_title?: string | null;
  culture_text?: string | null;
  vacancies_title?: string | null;
  vacancies_text?: string | null;
  benefits_title?: string | null;
  benefits_text?: string | null;
  profile_title?: string | null;
  profile_text?: string | null;
}

export interface NewsletterSubscription {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type AdminRole = 'administrator' | 'editor' | 'author' | 'contributor' | 'subscriber';

export interface Admin {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  token: string;
  user: Admin;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ContactRequest {
  name: string;
  email: string;
  phone?: string;
  serviceType?: string;
  message: string;
  captchaToken?: string;
  honeypot?: string;
}

export interface SendCodeRequest {
  email: string;
  type?: 'email' | 'sms';
}

export interface VerifyCodeRequest {
  email: string;
  code: string;
}

export interface SendCodeResponse {
  success: boolean;
  message: string;
  email: string;
}

export interface VerifyCodeResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    email: string;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
   // Papel inspirado nos níveis do WordPress (administrator, editor, author, contributor, subscriber)
  role?: AdminRole;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Hero {
  id: string;
  badgeText: string;
  titleLine1: string;
  titleLine2: string;
  description: string;
  backgroundImageUrl?: string | null;
  heroImageUrl?: string | null;
  button1Text?: string | null;
  button1Link?: string | null;
  button2Text?: string | null;
  button2Link?: string | null;
  statYears?: string | null; // Mantido para compatibilidade
  statClients?: string | null; // Mantido para compatibilidade
  statNetwork?: string | null; // Mantido para compatibilidade
  indicator1Title?: string | null;
  indicator1Value?: string | null;
  indicator2Title?: string | null;
  indicator2Value?: string | null;
  indicator3Title?: string | null;
  indicator3Value?: string | null;
  updatedAt: Date | string;
}

export interface UpdateHeroRequest {
  badgeText?: string;
  titleLine1?: string;
  titleLine2?: string;
  description?: string;
  backgroundImageUrl?: string | null;
  heroImageUrl?: string | null;
  button1Text?: string | null;
  button1Link?: string | null;
  button2Text?: string | null;
  button2Link?: string | null;
  statYears?: string | null; // Mantido para compatibilidade
  statClients?: string | null; // Mantido para compatibilidade
  statNetwork?: string | null; // Mantido para compatibilidade
  indicator1Title?: string | null;
  indicator1Value?: string | null;
  indicator2Title?: string | null;
  indicator2Value?: string | null;
  indicator3Title?: string | null;
  indicator3Value?: string | null;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  role?: AdminRole;
}

export interface UpdateUserRequest {
  email?: string;
  name?: string;
  role?: AdminRole;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImageUrl?: string;
  featured_image_url?: string; // Para compatibilidade
  author: string;
  isPublished: boolean;
  is_published?: boolean; // Para compatibilidade
  publishedAt?: Date;
  published_at?: Date | string; // Para compatibilidade
  createdAt: Date;
  created_at?: Date | string; // Para compatibilidade
  updatedAt: Date;
  updated_at?: Date | string; // Para compatibilidade
  categories?: Array<{ id: string; category_id?: string; category?: Category }>;
  tags?: Array<{ id: string; tag_id?: string; tag?: Tag }>;
}

export interface CreateBlogPostRequest {
  title: string;
  excerpt?: string;
  content: string;
  featuredImageUrl?: string;
  author?: string;
  isPublished?: boolean;
  categoryIds?: string[];
  tagIds?: string[];
}

export interface UpdateBlogPostRequest {
  title?: string;
  excerpt?: string;
  content?: string;
  featuredImageUrl?: string;
  author?: string;
  isPublished?: boolean;
  categoryIds?: string[];
  tagIds?: string[];
}

export interface Client {
  id: string;
  name: string;
  logoUrl?: string;
  logo_url?: string;
  websiteUrl?: string;
  website_url?: string;
  facebookUrl?: string;
  facebook_url?: string;
  instagramUrl?: string;
  instagram_url?: string;
  linkedinUrl?: string;
  linkedin_url?: string;
  twitterUrl?: string;
  twitter_url?: string;
  order: number;
  isActive: boolean;
  is_active?: boolean;
  createdAt: Date;
  created_at?: Date;
  updatedAt: Date;
  updated_at?: Date;
}

export interface CreateClientRequest {
  name: string;
  websiteUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateClientRequest {
  name?: string;
  websiteUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  order?: number;
  isActive?: boolean;
}

export interface LoginPage {
  id: string;
  background_image_url?: string | null;
  welcome_text?: string | null;
  title_line1?: string | null;
  title_line2?: string | null;
  button_text?: string | null;
  button_link?: string | null;
  button_icon?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateLoginPageRequest {
  background_image_url?: string | null;
  welcome_text?: string | null;
  title_line1?: string | null;
  title_line2?: string | null;
  button_text?: string | null;
  button_link?: string | null;
  button_icon?: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  color?: string | null;
  isActive: boolean;
  is_active?: boolean;
  createdAt: Date;
  created_at?: Date | string;
  updatedAt: Date;
  updated_at?: Date | string;
  _count?: {
    posts: number;
  };
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  color?: string;
  isActive?: boolean;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  color?: string;
  isActive?: boolean;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  color?: string | null;
  isActive: boolean;
  is_active?: boolean;
  createdAt: Date;
  created_at?: Date | string;
  updatedAt: Date;
  updated_at?: Date | string;
  _count?: {
    posts: number;
  };
}

export interface CreateTagRequest {
  name: string;
  description?: string;
  color?: string;
  isActive?: boolean;
}

export interface UpdateTagRequest {
  name?: string;
  description?: string;
  color?: string;
  isActive?: boolean;
}

export interface AccessLog {
  id: string;
  admin_id?: string | null;
  email: string;
  name?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  login_method: 'password' | '2fa';
  success: boolean;
  created_at: Date;
}

export type FormFieldType = 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'number' | 'date' | 'file';

// Formulários reutilizáveis
export interface Form {
  id: string;
  title: string;
  slug: string;
  description?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  fields?: FormField[];
  _count?: {
    submissions: number;
  };
}

export interface CreateFormRequest {
  title: string;
  slug?: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateFormRequest {
  title?: string;
  slug?: string;
  description?: string;
  is_active?: boolean;
}

export interface FormField {
  id: string;
  landing_page_id: string;
  field_type: FormFieldType;
  field_name: string;
  field_label: string;
  placeholder?: string | null;
  help_text?: string | null;
  is_required: boolean;
  validation_rules?: string | null; // JSON
  options?: string | null; // JSON para select/radio/checkbox
  order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface LandingPage {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  hero_title?: string | null;
  hero_subtitle?: string | null;
  hero_image_url?: string | null;
  hero_background_color?: string | null;
  content?: string | null;
  featured_image_url?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
  is_active: boolean;
  is_published: boolean;
  published_at?: Date | null;
  created_at: Date;
  updated_at: Date;
  form_fields?: FormField[];
}

export interface FormSubmission {
  id: string;
  landing_page_id: string;
  form_data: string; // JSON
  ip_address?: string | null;
  user_agent?: string | null;
  referrer?: string | null;
  is_read: boolean;
  created_at: Date;
}

export interface CreateLandingPageRequest {
  title: string;
  slug: string;
  description?: string;
  hero_title?: string;
  hero_subtitle?: string;
  hero_image_url?: string;
  hero_background_color?: string;
  content?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  is_active?: boolean;
  is_published?: boolean;
}

export interface UpdateLandingPageRequest {
  title?: string;
  slug?: string;
  description?: string;
  hero_title?: string;
  hero_subtitle?: string;
  hero_image_url?: string;
  hero_background_color?: string;
  content?: string;
  featured_image_url?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  is_active?: boolean;
  is_published?: boolean;
}

export interface CreateFormFieldRequest {
  landing_page_id: string;
  field_type: FormFieldType;
  field_name: string;
  field_label: string;
  placeholder?: string;
  help_text?: string;
  is_required?: boolean;
  validation_rules?: string; // JSON string
  options?: string; // JSON string para select/radio/checkbox
  order?: number;
  is_active?: boolean;
}

export interface UpdateFormFieldRequest {
  field_type?: FormFieldType;
  field_name?: string;
  field_label?: string;
  placeholder?: string;
  help_text?: string;
  is_required?: boolean;
  validation_rules?: string;
  options?: string;
  order?: number;
  is_active?: boolean;
}

export interface SubmitFormRequest {
  landing_page_id: string;
  form_data: Record<string, any>;
}