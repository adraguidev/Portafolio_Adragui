import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { ADMIN_NAV_ITEMS } from '@/lib/constants';
import { useAuth } from '@/lib/auth';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [serverStatus, setServerStatus] = useState<'online' | 'offline'>('online');
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // Check if user is authenticated and redirect if not
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/login');
    }
  }, [isAuthenticated, isLoading, setLocation]);

  // Check server status
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await fetch('/api/health');
        if (response.ok) {
          setServerStatus('online');
          setLastUpdate(new Date().toLocaleTimeString());
        } else {
          setServerStatus('offline');
        }
      } catch (error) {
        setServerStatus('offline');
      }
    };

    checkServerStatus();
    const interval = setInterval(checkServerStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Get unread messages count
  const { data: messages } = useQuery({
    queryKey: ['/api/messages'],
    enabled: isAuthenticated,
  });

  const unreadMessages =
    messages && Array.isArray(messages)
      ? messages.filter((message) => !message.read).length
      : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary mx-auto"></div>
          <p className="mt-4 text-text font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
  };

  const quickActions = [
    {
      label: 'Nuevo Proyecto',
      icon: 'ri-folder-add-line',
      href: '/admin/projects/new',
    },
    {
      label: 'Nuevo Artículo',
      icon: 'ri-article-line',
      href: '/admin/articles/new',
    },
    {
      label: 'Ver Estadísticas',
      icon: 'ri-bar-chart-line',
      href: '/admin/stats',
    },
    {
      label: 'Configuración',
      icon: 'ri-settings-3-line',
      href: '/admin/settings',
    },
  ];

  const menuCategories = [
    {
      title: 'Contenido',
      items: ADMIN_NAV_ITEMS.filter(item => 
        ['/admin/projects', '/admin/articles'].includes(item.href)
      ),
    },
    {
      title: 'Comunicación',
      items: ADMIN_NAV_ITEMS.filter(item => 
        ['/admin/messages'].includes(item.href)
      ),
    },
    {
      title: 'Configuración',
      items: ADMIN_NAV_ITEMS.filter(item => 
        ['/admin/settings', '/admin/profile'].includes(item.href)
      ),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* Status Bar */}
      <div className="bg-slate-800 text-white text-xs py-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className={`w-2 h-2 rounded-full mr-2 ${
                serverStatus === 'online' ? 'bg-green-500' : 'bg-red-500'
              }`}></span>
              <span>Servidor: {serverStatus === 'online' ? 'En línea' : 'Desconectado'}</span>
            </div>
            {lastUpdate && (
              <span>Última actualización: {lastUpdate}</span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-white/60">Versión: 1.0.0</span>
            <a 
              href="https://github.com/adragui/portfolio" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition-colors"
            >
              <i className="ri-github-fill"></i>
            </a>
          </div>
        </div>
      </div>

      {/* Admin Header */}
      <header className="bg-primary shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin"
                className="text-white font-clash font-bold text-xl"
              >
                Panel de Control
              </Link>
              <span className="hidden md:inline-flex bg-accent/20 text-accent px-2 py-1 text-xs rounded-md">
                Dashboard
              </span>
            </div>

            <div className="flex items-center space-x-4">
              {/* Quick Actions Button */}
              <div className="relative">
                <button
                  onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
                  className="text-white/80 hover:text-white transition-colors"
                  title="Acciones rápidas"
                >
                  <i className="ri-flashlight-line text-xl"></i>
                </button>
                <AnimatePresence>
                  {isQuickActionsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-1 w-48 rounded-md bg-white shadow-lg border border-gray-200 z-50"
                    >
                      <div className="py-1">
                        {quickActions.map((action) => (
                          <Link
                            key={action.href}
                            href={action.href}
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <i className={action.icon}></i>
                            <span>{action.label}</span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative">
                <Link
                  href="/admin/messages"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <i className="ri-notification-3-line text-xl"></i>
                </Link>
                {unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-primary text-xs w-4 h-4 flex items-center justify-center rounded-full">
                    {unreadMessages}
                  </span>
                )}
              </div>

              {/* Botón de vista previa */}
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 hover:text-white transition-colors"
                title="Ver sitio web"
              >
                <i className="ri-external-link-line text-xl"></i>
              </a>

              <div className="flex items-center space-x-2">
                <Avatar className="w-8 h-8 bg-accent/20">
                  <AvatarFallback className="text-accent font-medium text-sm">
                    AA
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline text-white font-medium">
                  {user?.name?.split(' ')[0] || 'User'}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="text-white/80 hover:text-white transition-colors"
              >
                <i className="ri-logout-box-r-line text-xl"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row flex-grow">
        {/* Admin Sidebar */}
        <aside className="bg-white w-full md:w-64 md:min-h-screen border-r border-slate-200">
          <nav className="p-4">
            {menuCategories.map((category) => (
              <div key={category.title} className="mb-6">
                <h3 className="text-xs font-semibold text-text/60 uppercase tracking-wider mb-2 px-3">
                  {category.title}
                </h3>
                <ul className="space-y-1">
                  {category.items.map((item) => {
                    const isMessageItem = item.href === '/admin/messages';
                    const isActive = location.startsWith(item.href);

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={`flex items-center space-x-3 px-3 py-2 rounded-md ${
                            isActive
                              ? 'bg-secondary/10 text-secondary font-medium'
                              : 'text-text hover:bg-slate-100 transition-colors'
                          }`}
                        >
                          <i className={item.icon}></i>
                          <span>{item.label}</span>
                          {isMessageItem && unreadMessages > 0 && (
                            <span className="ml-auto bg-accent text-primary text-xs px-2 py-1 rounded-full">
                              {unreadMessages}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Admin Content */}
        <main className="flex-grow p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
