// Tipos del modelo de datos
export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  role: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  projectUrl: string | null;
  technologies: string[] | null;
  featured: boolean | null;
  order: number | null;
}

export interface Experience {
  id: number;
  title: string;
  company: string;
  description: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean | null;
  order: number | null;
}

export interface Education {
  id: number;
  degree: string;
  institution: string;
  description: string;
  startDate: string;
  endDate: string | null;
  order: number | null;
}

export interface Skill {
  id: number;
  category: string;
  items: string[];
  order: number | null;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  imageUrl: string | null;
  category: string;
  published: boolean | null;
  publishedAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface Message {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  dribbble?: string;
}

export interface SiteInfo {
  id: number;
  about: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  contactLocation: string | null;
  socialLinks: SocialLinks | null;
}

// Tipo para importación/exportación de datos
export interface PortfolioData {
  projects: Project[];
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  articles: Article[];
  siteInfo?: SiteInfo;
}

// Tipos para respuestas de API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthResponse {
  token: string;
}

export interface ImportExportResponse {
  success: boolean;
  message: string;
}

// Tipos de estados UI
export interface FormState {
  isSubmitting: boolean;
  isSuccess: boolean;
  isError: boolean;
  message: string;
}

// Tipos para consultas
export interface CVData {
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
}