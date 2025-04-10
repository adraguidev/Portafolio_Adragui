import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDate = (dateString: string | Date | null, language: string = 'es-ES'): string => {
  if (!dateString) return '';
  
  try {
    let date: Date;
    
    if (typeof dateString === 'string') {
      // Si es un timestamp de PostgreSQL (formato ISO con Z)
      if (dateString.endsWith('Z')) {
        date = new Date(dateString);
      } 
      // Si es un timestamp de PostgreSQL sin Z
      else if (dateString.includes('T')) {
        date = new Date(dateString + 'Z');
      }
      // Si tiene formato de fecha con espacio
      else if (dateString.includes(' ')) {
        date = new Date(dateString.replace(' ', 'T') + 'Z');
      }
      // Si no tiene formato específico
      else {
        const timestamp = Date.parse(dateString);
        if (isNaN(timestamp)) {
          console.error('Invalid date string:', dateString);
          return '';
        }
        date = new Date(timestamp);
      }
    } else {
      date = new Date(dateString);
    }
    
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateString);
      return '';
    }
    
    // Asegurar que el idioma sea válido
    const validLanguage = language || 'es-ES';
    
    // Formatear la fecha según el idioma
    return date.toLocaleDateString(validLanguage, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC' // Asegurar que se use UTC para consistencia
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};
