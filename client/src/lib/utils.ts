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
      // Intentar diferentes formatos de fecha
      if (dateString.includes('T')) {
        date = new Date(dateString);
      } else if (dateString.includes(' ')) {
        date = new Date(dateString.replace(' ', 'T'));
      } else {
        // Si no tiene formato específico, asumir que es una marca de tiempo
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
    
    return date.toLocaleDateString(language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};
