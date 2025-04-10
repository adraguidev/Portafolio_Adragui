import { QueryClient, QueryFunction } from '@tanstack/react-query';

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  url: string,
  options: RequestInit = {}
): Promise<any> {
  // Obtener el token de autenticación del localStorage
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    ...options.headers,
  };

  // Si hay token, agregar Authorization header
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  await throwIfResNotOk(res);
  return res.json();
}

type UnauthorizedBehavior = 'returnNull' | 'throw';
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Obtener el token de autenticación del localStorage
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {};

    // Si hay token, agregar Authorization header
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Construir la URL para peticiones GET
    const url = new URL(queryKey[0] as string, window.location.origin);

    // Solo agregar el parámetro lang si está presente en la URL actual
    const currentLang = new URLSearchParams(window.location.search).get('lang');
    if (currentLang) {
      url.searchParams.set('lang', currentLang);
    }

    const res = await fetch(url.toString(), {
      credentials: 'include',
      headers,
    });

    if (unauthorizedBehavior === 'returnNull' && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: 'throw' }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
