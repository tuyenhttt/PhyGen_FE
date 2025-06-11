import HeaderAdmin from '@/components/layouts/HeaderAdmin';
import AdminSidebar from '@/components/layouts/AdminSidebar';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div className='flex'>
      <AdminSidebar />

      <div className='flex-1 ml-64'>
        <HeaderAdmin />
        <main className='mt-20 px-6 py-4 bg-gray-100 min-h-screen'>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
