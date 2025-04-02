import { useQuery } from '@tanstack/react-query';
import { AppConfig, initialConfig } from '@/lib/constants';

/**
 * Hook personalizado para obtener la configuración de la aplicación, incluyendo las claves API
 * desde el servidor de manera segura.
 */
export function useConfig() {
  const { data: config, isLoading, error } = useQuery<AppConfig>({
    queryKey: ['/api/config'],
    // No need to define the queryFn, as we're using the default configured in queryClient
    initialData: initialConfig,
  });

  return {
    config,
    isLoading,
    error
  };
}