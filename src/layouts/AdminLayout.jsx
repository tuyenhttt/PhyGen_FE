import AdminSidebar from '@/components/layouts/AdminSidebar';
import HeaderAdmin from '@/components/layouts/HeaderAdmin';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <>
      <AdminSidebar />
      <HeaderAdmin />
      <main className='ml-64 mt-20 p-6 bg-gray-100 min-h-screen'>
        <Outlet />
      </main>
    </>
  );
};

export default AdminLayout;
