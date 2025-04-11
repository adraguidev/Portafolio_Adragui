import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error: { response?: { status: number } }) => {
    if (error.response?.status === 401) {
      // Redirigir al login si la sesión expira
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 