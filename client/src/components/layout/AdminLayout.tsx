import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { ADMIN_NAV_ITEMS } from '@/lib/constants';
import { useAuth } from '@/lib/auth';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [location, setLocation] = useLocation();

  // Check if user is authenticated and redirect if not
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/login');
    }
  }, [isAuthenticated, isLoading, setLocation]);

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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
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

              <div className="flex items-center space-x-2">
                <Avatar className="w-8 h-8 bg-secondary/30">
                  <AvatarFallback className="text-white text-sm">
                    {user?.name ? getInitials(user.name) : 'U'}
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
            <ul className="space-y-1">
              {ADMIN_NAV_ITEMS.map((item) => {
                const isMessageItem = item.href === '/admin/messages';
                // Cambiar a forma manual de determinar si está activo
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
          </nav>
        </aside>

        {/* Admin Content */}
        <main className="flex-grow p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
