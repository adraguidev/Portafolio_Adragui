export const WEBSITE_NAME = 'Adrián Aguirre';
export const WEBSITE_TITLE = 'Adrián Aguirre | Portafolio Profesional';
export const WEBSITE_DESCRIPTION =
  'Adrián Aguirre es un analista de operaciones y desarrollador full stack en formación con más de 5 años de experiencia en análisis de datos y mejora de procesos operativos.';

export const NAV_ITEMS = [
  { label: 'Inicio', href: '/', translationKey: 'common.welcome' },
  { label: 'Currículum', href: '/#cv', translationKey: 'common.experience' },
  { label: 'Proyectos', href: '/#work', translationKey: 'common.projects' },
  { label: 'Artículos', href: '/#articles', translationKey: 'home.title' },
  { label: 'Contacto', href: '/#contact', translationKey: 'common.contact' },
];

export const SOCIAL_LINKS = {
  github: 'https://github.com',
  linkedin: 'https://linkedin.com',
  twitter: 'https://twitter.com',
  dribbble: 'https://dribbble.com',
};

export const ADMIN_NAV_ITEMS = [
  { label: 'Panel Principal', href: '/admin', icon: 'ri-dashboard-line' },
  { label: 'Editor CV', href: '/admin/cv', icon: 'ri-file-list-3-line' },
  { label: 'Artículos', href: '/admin/articles', icon: 'ri-article-line' },
  { label: 'Proyectos', href: '/admin/projects', icon: 'ri-folder-line' },
  { label: 'Mensajes', href: '/admin/messages', icon: 'ri-message-3-line' },
  {
    label: 'Configuración',
    href: '/admin/settings',
    icon: 'ri-settings-4-line',
  },
];

export const COLORS = {
  primary: '#0F172A', // deep navy
  secondary: '#6366F1', // electric indigo
  accent: '#22D3EE', // cyan
  background: '#FFFFFF', // white
  text: '#1E293B', // slate
};

export const PROFILE_IMAGE_URL =
  'https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=800&auto=format&fit=crop';

// Configuración para el sistema
export interface AppConfig {
  tinymceApiKey: string;
}

// Estado inicial para la configuración
export const initialConfig: AppConfig = {
  tinymceApiKey: '',
};
