import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDate = (dateString: string | Date | null, language: string = 'es-ES'): string => {
  if (!dateString) return '';
  
  try {
    // Si es una cadena, intentar parsearla como fecha ISO
    const date = typeof dateString === 'string' 
      ? new Date(dateString.replace(' ', 'T')) 
      : new Date(dateString);
      
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
