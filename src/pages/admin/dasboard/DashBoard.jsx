import { useEffect, useState } from 'react';
import { getAllUserProfile } from '@/services/userService';
import StatAdminCard from '@/components/cards/StatAdminCard';
import { FaUserAlt } from 'react-icons/fa';
import { FaAddressBook } from 'react-icons/fa6';
import { MdOutlineAttachMoney } from 'react-icons/md';
import { GrCircleQuestion } from 'react-icons/gr';
import UserStatsCard from '@/components/cards/UserStatsCard';
import { useNavigate } from 'react-router-dom';
import {
  getSubject,
  getSubjectBookCountBySubject,
} from '@/services/subjectbooksService';
import { getStatisticWeekly } from '@/services/statisAdmin';

const DashBoard = () => {
  const navigate = useNavigate();
  const [userCount, setUserCount] = useState(0);
  const [bookStats, setBookStats] = useState([]);
  const [totalBookCount, setTotalBookCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loginRateChange, setLoginRateChange] = useState({
    value: 0,
    isPositive: true,
  });
  const [revenueChange, setRevenueChange] = useState({
    value: 0,
    isPositive: true,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getAllUserProfile();
        // người dùng
        setUserCount(res.data.count || 0);
        const weeklyStats = await getStatisticWeekly();
        const { loginRateBeforeNow, loginRateBeforeLastWeek } =
          weeklyStats.data;

        const rateDiff = loginRateBeforeNow - loginRateBeforeLastWeek;

        setLoginRateChange({
          value: Math.abs(rateDiff).toFixed(2),
          isPositive: rateDiff >= 0,
        });

        // tổng số sách
        const subjectRes = await getSubject();
        const subjects = subjectRes.data?.data || [];

        const stats = await Promise.all(
          subjects.map(async subject => {
            const count = await getSubjectBookCountBySubject(subject.id);
            return {
              subjectName: subject.name,
              count,
            };
          })
        );

        setBookStats(stats);
        const totalCount = stats.reduce((sum, s) => sum + s.count, 0);
        setTotalBookCount(totalCount);

        // tổng doanh thu
        const totalPayment = await getStatisticWeekly();
        setTotalRevenue(totalPayment.data.totalRevenue);

        const { rateRevenue } = weeklyStats.data;

        setRevenueChange({
          value: Math.abs(rateRevenue).toFixed(2),
          isPositive: rateRevenue >= 0,
        });

        //tổng số lượng câu hỏi
      } catch (err) {
        console.error('Lỗi lấy thống kê:', err);
      }
    };

    fetchStats();
  }, []);

  return (
    <main className='px-6 py-4 bg-gray-100 min-h-screen'>
      <section className='grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6'>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 col-span-2'>
          <StatAdminCard
            label='Số lượng người dùng'
            value={userCount}
            icon={<FaUserAlt size={28} />}
            change={`${loginRateChange.value}%`}
            iconBg='#DBEAFE'
            iconColor='#2563EB'
            isPositive={loginRateChange.isPositive}
            linkText='Xem chi tiết'
            onLinkClick={() => navigate('/admin/users')}
          />

          <StatAdminCard
            label='Tổng số sách'
            value={totalBookCount}
            icon={<FaAddressBook size={28} />}
            iconBg='#E0E7FF'
            iconColor='#4338CA'
            change='10%'
            linkText='Xem chi tiết'
            onLinkClick={() => navigate('/admin/subject-book')}
          />

          <StatAdminCard
            label='Tổng doanh thu'
            value={totalRevenue}
            icon={<MdOutlineAttachMoney size={28} />}
            change={`${revenueChange.value}%`}
            isPositive={revenueChange.isPositive}
            iconBg='#FDE68A'
            iconColor='#D97706'
            linkText='Xem chi tiết'
            onLinkClick={() => navigate('/admin/invoice-list')}
          />

          <StatAdminCard
            label='Số lượng câu hỏi'
            value='130'
            icon={<GrCircleQuestion size={28} />}
            isPositive
            change='10%'
            iconBg='#FEE2E2'
            iconColor='#DC2626'
            linkText='Xem chi tiết'
            onLinkClick={() => navigate('/admin/exams-category/exams')}
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
