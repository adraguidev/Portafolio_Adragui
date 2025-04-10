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
        const res = await fetch('/api/auth/me', {
          credentials: 'include',
        });

        if (res.ok) {
          const user = await res.json();
          setState({
            user,
            isAuthenticated: true,
            isLoading: false
          });
        } else {
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
      } catch (error) {
        console.error('Auth check error:', error);
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
      
      setState({
        user: data.user,
        isAuthenticated: true,
        isLoading: false
      });
      
      return data.user;
    } catch (error) {
      console.error('Login error:', error);
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiRequest('POST', '/api/auth/logout', {});
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
    if (!isLoading && isAuthenticated && !window.location.pathname.includes('/login')) {
      setLocation(redirectAuthenticatedTo);
    }
  }, [isAuthenticated, isLoading, redirectAuthenticatedTo, setLocation]);

  return { isAuthenticated, isLoading };
};
