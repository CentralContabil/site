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
  description: string;
  icon?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Testimonial {
  id: string;
  clientName: string;
  company?: string;
  testimonialText: string;
  clientImageUrl?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
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
}

export interface Configuration {
  id: string;
  companyName: string;
  phone?: string;
  email?: string;
  address?: string;
  businessHours?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
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
}