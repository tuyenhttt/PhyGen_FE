import StatAdminCard from '@/components/cards/StatAdminCard';
import UserStatsCard from '@/components/cards/UserStatsCard';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getAllUserProfile } from '@/services/userService';
import { BsQuestionSquareFill } from 'react-icons/bs';
import { FaUserAlt } from 'react-icons/fa';
import { GrCircleQuestion } from 'react-icons/gr';
import { MdOutlineAttachMoney } from 'react-icons/md';
import { FaAddressBook } from 'react-icons/fa6';

const DashBoard = () => {
  const [userCount, setUserCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getAllUserProfile();
        const total = res.data.count || 0;
        setUserCount(total);
      } catch (err) {
        console.error('Lỗi khi lấy danh sách người dùng:', err);
        setUserCount(0);
      }
    };

    fetchUsers();
  }, []);

  const handleNavigateListUser = () => {
    navigate('/admin/users');
  };

  return (
    <main className=' px-6 py-4 bg-gray-100 min-h-screen'>
      <section className='grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6'>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 col-span-2'>
          <StatAdminCard
            label='Số lượng người dùng'
            value={userCount}
            icon={<FaUserAlt size={28} />}
            change={'10%'}
            iconBg='#DBEAFE'
            iconColor='#2563EB'
            linkText='Xem chi tiết'
            onLinkClick={handleNavigateListUser}
          />
          <StatAdminCard
            label='Tổng doanh thu'
            value='$123.6k'
            icon={<MdOutlineAttachMoney size={28} />}
            isPositive
            change={'10%'}
            iconBg='#FDE68A'
            iconColor='#D97706'
            linkText='Xem chi tiết'
            onLinkClick={() => alert('Xem thống kê doanh thu')}
          />
          <StatAdminCard
            label='Số lượng câu hỏi'
            value='130'
            icon={<GrCircleQuestion size={28} />}
            isPositive
            change={'10%'}
            iconBg='#FEE2E2'
            iconColor='#DC2626'
            linkText='Xem chi tiết'
            onLinkClick={() => alert('Xem thống kê câu hỏi')}
          />
          <StatAdminCard
            label='Số lượng sách'
            value='3'
            icon={<FaAddressBook size={28} />}
            iconBg='#E0E7FF'
            iconColor='#4338CA'
            isPositive
            change={'10%'}
            linkText='Xem chi tiết'
            onLinkClick={() => alert('Xem thống kê sử dụng')}
          />
        </div>

        <div className='col-span-1'>
          <UserStatsCard />
        </div>
      </section>

      <section className='bg-white rounded-xl p-6 shadow-sm'>
        <h2 className='text-lg font-bold text-gray-700 mb-4'>
          Thống kê giao dịch
        </h2>
        <div className='h-64 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center text-gray-500'>
          Biểu đồ sẽ hiển thị ở đây
        </div>
      </section>
    </main>
  );
};

export default DashBoard;
