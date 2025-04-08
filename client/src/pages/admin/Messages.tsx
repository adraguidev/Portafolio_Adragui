import { useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import MessageList from '@/components/admin/MessageList';

const Messages = () => {
  // Set page title
  useEffect(() => {
    document.title = 'Panel de Control';
  }, []);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-clash font-bold text-3xl text-primary mb-2">
          Messages
        </h1>
        <p className="text-text/70">
          View and manage contact messages from visitors
        </p>
      </div>

      <MessageList />
    </AdminLayout>
  );
};

export default Messages;
