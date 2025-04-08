import { useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import Dashboard from '@/components/admin/Dashboard';

const AdminHome = () => {
  // Set page title
  useEffect(() => {
    document.title = 'Panel de Control';
  }, []);

  return (
    <AdminLayout>
      <Dashboard />
    </AdminLayout>
  );
};

export default AdminHome;
