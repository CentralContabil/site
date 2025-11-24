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

export interface Configuration {
  id: string;
  companyName: string;
  company_name?: string; // Para compatibilidade
  phone?: string;
  email?: string;
  contact_email?: string;
  contactEmail?: string;
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

export interface NewsletterSubscription {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Admin {
  id: string;
  email: string;
  name: string;
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
  password: string;
}

export interface UpdateUserRequest {
  email?: string;
  name?: string;
  password?: string;
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
}

export interface CreateBlogPostRequest {
  title: string;
  excerpt?: string;
  content: string;
  featuredImageUrl?: string;
  author?: string;
  isPublished?: boolean;
}

export interface UpdateBlogPostRequest {
  title?: string;
  excerpt?: string;
  content?: string;
  featuredImageUrl?: string;
  author?: string;
  isPublished?: boolean;
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