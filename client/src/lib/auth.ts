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

interface LoginResponse {
  token: string;
  user: User;
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
      const response = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: {
          'Content-Type': 'application/json'
        }
      }) as LoginResponse;

      if (response.token) {
        localStorage.setItem('token', response.token);
      }

      setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false
      });

      return response.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiRequest('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
      setLocation('/login');
    }
  };

  const requireAuth = (callback: () => void) => {
    if (state.isAuthenticated) {
      callback();
    } else {
      setLocation('/login');
    }
  };

  return {
    ...state,
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
};
