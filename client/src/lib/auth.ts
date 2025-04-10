import { apiRequest } from './queryClient';
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });
  const [, setLocation] = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Intentar obtener el token del localStorage
        const token = localStorage.getItem('token');
        const headers: HeadersInit = {};
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const res = await fetch('/api/auth/me', {
          credentials: 'include',
          headers
        });

        if (res.ok) {
          const user = await res.json();
          setState({
            user,
            isAuthenticated: true,
            isLoading: false
          });
        } else {
          // Si la respuesta no es ok, limpiar el token
          localStorage.removeItem('token');
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        localStorage.removeItem('token');
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const res = await apiRequest('POST', '/api/auth/login', { email, password });
      const data = await res.json();
      
      // Guardar el token en localStorage para usarlo en futuras peticiones
      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      setState({
        user: data.user,
        isAuthenticated: true,
        isLoading: false
      });

      return data.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiRequest('POST', '/api/auth/logout', {});
      // Eliminar el token al cerrar sesión
      localStorage.removeItem('token');
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
      setLocation('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const requireAuth = (callback: () => void) => {
    if (state.isLoading) return;
    
    if (!state.isAuthenticated) {
      setLocation('/login');
    } else {
      callback();
    }
  };

  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    login,
    logout,
    requireAuth
  };
};

export const useAuthRedirect = (redirectAuthenticatedTo: string = '/admin') => {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLocation(redirectAuthenticatedTo);
    }
  }, [isAuthenticated, isLoading, redirectAuthenticatedTo, setLocation]);

  return { isAuthenticated, isLoading };
};
