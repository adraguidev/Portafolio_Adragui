import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { AppConfig, initialConfig } from '@/lib/constants';

/**
 * Hook personalizado para obtener la configuración de la aplicación, incluyendo las claves API
 * desde el servidor de manera segura.
 */
export function useConfig() {
  const { data: config, isLoading, error } = useQuery({
    queryKey: ['/api/config'],
    queryFn: async () => {
      const response = await apiRequest('/api/config');
      return response as AppConfig;
    },
    initialData: initialConfig,
  });

  return {
    config,
    isLoading,
    error
  };
}