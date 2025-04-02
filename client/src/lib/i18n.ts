import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Cookies from 'js-cookie';

// Traducciones
const resources = {
  es: {
    translation: {
      // Navegación
      "home": "Inicio",
      "projects": "Proyectos",
      "cv": "Currículum",
      "articles": "Artículos",
      "contact": "Contacto",
      "adminPanel": "Panel de Administración",
      "contactMe": "Contáctame",
      
      // Secciones de la página principal
      "hello": "¡Hola! Soy Adrián Aguirre",
      "roleTitle": "Analista de Operaciones & Desarrollador Full Stack",
      "aboutShort": "Con más de 5 años de experiencia en análisis de datos y mejora de procesos operativos. Actualmente desarrollándome como Full Stack Developer.",
      "viewProjects": "Ver Proyectos",
      
      // Proyectos
      "featuredProjects": "Proyectos Destacados",
      "projectsDescription": "Una selección de los proyectos en los que he trabajado, demostrando mis habilidades y experiencia.",
      "viewAllProjects": "Ver Todos los Proyectos",
      "viewProject": "Ver Proyecto",
      
      // Artículos
      "recentArticles": "Artículos Recientes",
      "articlesDescription": "Pensamientos, ideas y descubrimientos de mi trayectoria en el desarrollo web.",
      "viewAllArticles": "Ver Todos los Artículos",
      "readMore": "Leer Más",
      
      // CV
      "curriculum": "Curriculum Vitae",
      "cvDescription": "Mi trayectoria profesional y experiencia en desarrollo web y diseño.",
      "experience": "Experiencia Profesional",
      "education": "Educación",
      "skills": "Habilidades y Tecnologías",
      "present": "Actual",
      "downloadCV": "Descargar CV Completo",
      
      // Contacto
      "letsConnect": "Conectemos",
      "contactDescription": "¿Tienes un proyecto en mente o quieres hablar sobre oportunidades? Envíame un mensaje y te responderé lo antes posible.",
      "sendMessage": "Enviar un Mensaje",
      "name": "Nombre",
      "namePlaceholder": "Tu nombre",
      "email": "Correo electrónico",
      "emailPlaceholder": "Tu correo electrónico",
      "subject": "Asunto",
      "subjectPlaceholder": "¿De qué se trata?",
      "message": "Mensaje",
      "messagePlaceholder": "Tu mensaje",
      "sending": "Enviando...",
      "send": "Enviar Mensaje",
      "messageSent": "¡Mensaje enviado!",
      "successMessage": "Gracias por contactarme. Te responderé pronto.",
      "errorSending": "Error al enviar el mensaje",
      "errorMessage": "Por favor, inténtalo de nuevo más tarde.",
      
      // Footer
      "navigation": "Navegación",
      "legal": "Legal",
      "privacyPolicy": "Política de Privacidad",
      "termsOfService": "Términos de Servicio",
      "cookiePolicy": "Política de Cookies",
      "allRights": "Todos los derechos reservados.",
      "madeWith": "Hecho con",
      "in": "en",
      
      // Idiomas
      "switchToEnglish": "English",
      "switchToSpanish": "Español",
      
      // Común
      "loading": "Cargando...",
      "notFound": "Página no encontrada",
      "goHome": "Ir al inicio",
    }
  },
  en: {
    translation: {
      // Navigation
      "home": "Home",
      "projects": "Projects",
      "cv": "Resume",
      "articles": "Articles",
      "contact": "Contact",
      "adminPanel": "Admin Panel",
      "contactMe": "Contact Me",
      
      // Main page sections
      "hello": "Hello! I'm Adrián Aguirre",
      "roleTitle": "Operations Analyst & Full Stack Developer",
      "aboutShort": "With over 5 years of experience in data analysis and operational process improvement. Currently developing as a Full Stack Developer.",
      "viewProjects": "View Projects",
      
      // Projects
      "featuredProjects": "Featured Projects",
      "projectsDescription": "A selection of projects I've worked on, showcasing my skills and experience.",
      "viewAllProjects": "View All Projects",
      "viewProject": "View Project",
      
      // Articles
      "recentArticles": "Recent Articles",
      "articlesDescription": "Thoughts, ideas, and discoveries from my journey in web development.",
      "viewAllArticles": "View All Articles",
      "readMore": "Read More",
      
      // CV
      "curriculum": "Curriculum Vitae",
      "cvDescription": "My professional journey and expertise in web development and design.",
      "experience": "Professional Experience",
      "education": "Education",
      "skills": "Skills & Technologies",
      "present": "Present",
      "downloadCV": "Download Full CV",
      
      // Contact
      "letsConnect": "Let's Connect",
      "contactDescription": "Have a project in mind or want to discuss opportunities? Drop me a message and I'll get back to you as soon as possible.",
      "sendMessage": "Send a Message",
      "name": "Name",
      "namePlaceholder": "Your name",
      "email": "Email",
      "emailPlaceholder": "Your email address",
      "subject": "Subject",
      "subjectPlaceholder": "What is this regarding?",
      "message": "Message",
      "messagePlaceholder": "Your message",
      "sending": "Sending...",
      "send": "Send Message",
      "messageSent": "Message sent!",
      "successMessage": "Thanks for reaching out. I'll get back to you soon.",
      "errorSending": "Failed to send message",
      "errorMessage": "Please try again later.",
      
      // Footer
      "navigation": "Navigation",
      "legal": "Legal",
      "privacyPolicy": "Privacy Policy",
      "termsOfService": "Terms of Service",
      "cookiePolicy": "Cookie Policy",
      "allRights": "All rights reserved.",
      "madeWith": "Made with",
      "in": "in",
      
      // Languages
      "switchToEnglish": "English",
      "switchToSpanish": "Español",
      
      // Common
      "loading": "Loading...",
      "notFound": "Page not found",
      "goHome": "Go home",
    }
  }
};

// Configurar i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: Cookies.get('i18nextLng') || 'es', // Idioma predeterminado
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false, // React ya escapa por defecto
    },
    detection: {
      order: ['cookie', 'localStorage', 'navigator'],
      caches: ['cookie', 'localStorage'],
      lookupCookie: 'i18nextLng',
      lookupLocalStorage: 'i18nextLng',
    },
  });

export default i18n;