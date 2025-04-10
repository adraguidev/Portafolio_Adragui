import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth, useAuthRedirect } from '@/lib/auth';
import { Link, useLocation } from 'wouter';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { WEBSITE_NAME } from '@/lib/constants';

// Login form schema
const loginSchema = z.object({
  email: z.string().email({ message: 'Por favor, introduce un correo electrónico válido' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  
  // Redirect if already authenticated
  const { isAuthenticated, isLoading: authLoading } = useAuthRedirect('/admin');

  // Initialize form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  // Handle form submission
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast({
        title: 'Inicio de sesión exitoso',
        description: 'Bienvenido al panel de administración',
      });
      // Redirigir inmediatamente después del login exitoso
      setLocation('/admin');
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Error de inicio de sesión',
        description: 'Correo electrónico o contraseña inválidos',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  // Show loading state if auth is still being checked
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary mx-auto"></div>
          <p className="mt-4 text-text">Cargando...</p>
        </div>
      </div>
    );
  }

  // Don't render login form if already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="login-animation w-full max-w-md">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="bg-primary p-8 text-center">
            <h2 className="font-clash font-bold text-2xl text-white">Panel de Administración</h2>
            <p className="text-white/70 mt-2">Inicia sesión para gestionar tu portafolio</p>
          </div>
          
          <div className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo electrónico</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="tu@correo.com" 
                          className="w-full px-4 py-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none transition-colors" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between mb-2">
                        <FormLabel>Contraseña</FormLabel>
                        <a href="#" className="text-xs text-secondary hover:text-secondary/80 transition-colors">¿Olvidaste tu contraseña?</a>
                      </div>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          className="w-full px-4 py-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none transition-colors" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          id="rememberMe"
                        />
                      </FormControl>
                      <label
                        htmlFor="rememberMe"
                        className="text-sm text-text/80 cursor-pointer"
                      >
                        Recordarme
                      </label>
                    </FormItem>
                  )}
                />
                
                <Button
                  type="submit"
                  className="w-full bg-primary text-white rounded-md px-6 py-3 text-base font-medium hover:bg-primary/90 transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </Button>
              </form>
            </Form>
            
            <div className="mt-6 text-center">
              <Link href="/" className="text-sm text-text/70 hover:text-secondary transition-colors inline-flex items-center">
                <i className="ri-arrow-left-line mr-1"></i>
                Volver al sitio web
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
