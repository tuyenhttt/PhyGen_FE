import StatAdminCard from '@/components/cards/StatAdminCard';
import AdminSidebar from '@/components/layouts/AdminSidebar';
import HeaderAdmin from '@/components/layouts/HeaderAdmin';
import { Outlet } from 'react-router-dom';
import { BsQuestionSquareFill } from 'react-icons/bs';
import UserStatsCard from '@/components/cards/UserStatsCard';

const AdminLayout = () => {
  return (
    <>
      <AdminSidebar />
      <HeaderAdmin />
      <main className='ml-64 mt-20 px-6 py-4 bg-gray-100 min-h-screen'>
        <Outlet />

        {/* Grid thống kê */}
        <section className='grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6'>
          {/* Bên trái - 4 StatAdminCard */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 col-span-2'>
            <StatAdminCard
              label='Số lượng câu hỏi'
              value='130'
              icon={<BsQuestionSquareFill size={24} />}
              isPositive
              change={'10%'}
              iconBg='#FEE2E2'
              iconColor='#DC2626'
              linkText='Xem chi tiết'
              onLinkClick={() => alert('Xem thống kê')}
            />
            <StatAdminCard
              label='Số lượng người dùng'
              value='9,526'
              icon={<BsQuestionSquareFill size={24} />}
              change={'10%'}
              iconBg='#DBEAFE'
              iconColor='#2563EB'
              linkText='Xem chi tiết'
              onLinkClick={() => alert('Xem thống kê')}
            />
            <StatAdminCard
              label='Tổng doanh thu'
              value='$123.6k'
              icon={<BsQuestionSquareFill size={24} />}
              isPositive
              change={'10%'}
              iconBg='#FDE68A'
              iconColor='#D97706'
              linkText='Xem chi tiết'
              onLinkClick={() => alert('Xem thống kê')}
            />
            <StatAdminCard
              label='Thống kê sử dụng'
              value='65.2%'
              icon={<BsQuestionSquareFill size={24} />}
              iconBg='#E0E7FF'
              iconColor='#4338CA'
              isPositive
              change={'10%'}
              linkText='Xem chi tiết'
              onLinkClick={() => alert('Xem thống kê')}
            />
          </div>

          {/* Bên phải - UserStatsCard */}
          <div className='col-span-1'>
            <UserStatsCard />
          </div>
        </section>

        {/* Biểu đồ thống kê */}
        <section className='bg-white rounded-xl p-6 shadow-sm'>
          <h2 className='text-lg font-bold text-gray-700 mb-4'>
            Thống kê giao dịch
          </h2>
          <div className='h-64 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center text-gray-500'>
            Biểu đồ sẽ hiển thị ở đây
          </div>
        </section>
      </main>
    </>
  );
};

export default AdminLayout;
