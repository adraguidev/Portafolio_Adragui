import { QueryClient, QueryFunction } from '@tanstack/react-query';

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined
): Promise<Response> {
  // Obtener el token de autenticación del localStorage
  const token = localStorage.getItem('token');
  let headers: HeadersInit = {};

  // Si hay datos, incluir Content-Type
  if (data) {
    headers['Content-Type'] = 'application/json';
  }

  // Si hay token, agregar Authorization header
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: 'include',
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = 'returnNull' | 'throw';
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Obtener el token de autenticación del localStorage
    const token = localStorage.getItem('token');
    let headers: HeadersInit = {};

    // Si hay token, agregar Authorization header
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Construir la URL con el parámetro de idioma para peticiones GET
    const url = new URL(queryKey[0] as string, window.location.origin);
    if (!url.searchParams.has('lang')) {
      const userLang = navigator.language.split('-')[0];
      // Solo agregar el parámetro si es un idioma soportado
      if (['en', 'fr', 'de', 'it', 'pt'].includes(userLang)) {
        url.searchParams.append('lang', userLang);
      }
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
