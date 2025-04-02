import { useQuery } from '@tanstack/react-query';
import { AppConfig, initialConfig } from '@/lib/constants';

/**
 * Hook personalizado para obtener la configuración de la aplicación, incluyendo las claves API
 * desde el servidor de manera segura.
 */
export function useConfig() {
  const { data: config, isLoading, error } = useQuery<AppConfig>({
    queryKey: ['/api/config'],
    // Especificamos la función explícitamente en lugar de usar la configuración global
    queryFn: async ({ queryKey }) => {
      console.log("Fetching configuration from:", queryKey[0]);
      const res = await fetch(queryKey[0] as string);
      
      if (!res.ok) {
        throw new Error(`Error fetching config: ${res.status}`);
      }
      
      const data = await res.json();
      console.log("Config data received:", data);
      return data as AppConfig;
    },
    initialData: initialConfig,
    retry: 1,
    staleTime: 60000, // 1 minuto
  });

  return {
    config,
    isLoading,
    error
  };
}