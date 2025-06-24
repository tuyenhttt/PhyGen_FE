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

const DashBoard = () => {
  const navigate = useNavigate();
  const [userCount, setUserCount] = useState(0);
  const [bookStats, setBookStats] = useState([]);
  const [totalBookCount, setTotalBookCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getAllUserProfile();
        setUserCount(res.data.count || 0);

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
            change='10%'
            iconBg='#DBEAFE'
            iconColor='#2563EB'
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
            onLinkClick={() => alert('Xem thống kê sách')}
          />

          <StatAdminCard
            label='Tổng doanh thu'
            value='$123.6k'
            icon={<MdOutlineAttachMoney size={28} />}
            isPositive
            change='10%'
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
            change='10%'
            iconBg='#FEE2E2'
            iconColor='#DC2626'
            linkText='Xem chi tiết'
            onLinkClick={() => alert('Xem thống kê câu hỏi')}
          />
        </div>

        <div className='col-span-1'>
          <UserStatsCard />
        </div>
      </section>

      <section className='bg-white rounded-xl p-6 shadow-sm'>
        <h2 className='text-lg font-bold text-gray-700 mb-4'>
          Thống kê sách theo môn
        </h2>
        <ul className='space-y-2'>
          {bookStats.map((item, idx) => (
            <li
              key={idx}
              className='flex justify-between bg-gray-50 p-3 rounded shadow-sm text-gray-700'
            >
              <span>{item.subjectName}</span>
              <span className='font-bold text-indigo-600'>{item.count}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
};

export default DashBoard;
