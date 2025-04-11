import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';

// Lazy load components
const Dashboard = lazy(() => import('@/components/admin/Dashboard'));
const Projects = lazy(() => import('@/components/admin/Projects'));
const Articles = lazy(() => import('@/components/admin/Articles'));
const Messages = lazy(() => import('@/components/admin/Messages'));
const Settings = lazy(() => import('@/components/admin/Settings'));
const Stats = lazy(() => import('@/components/admin/Stats'));

export const adminRouter = createBrowserRouter([
  {
    path: '/admin',
    element: (
      <AuthGuard>
        <AdminLayout />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />
      },
      {
        path: 'projects',
        element: <Projects />
      },
      {
        path: 'articles',
        element: <Articles />
      },
      {
        path: 'messages',
        element: <Messages />
      },
      {
        path: 'settings',
        element: <Settings />
      },
      {
        path: 'stats',
        element: <Stats />
      }
    ]
  }
]); 