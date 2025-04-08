import { useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import CVEditor from '@/components/admin/CVEditor';

const CVManagement = () => {
  // Set page title
  useEffect(() => {
    document.title = 'Panel de Control';
  }, []);

  return (
    <AdminLayout>
      <CVEditor />
    </AdminLayout>
  );
};

export default CVManagement;
