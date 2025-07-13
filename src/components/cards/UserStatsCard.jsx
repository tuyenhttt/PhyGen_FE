import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell } from 'recharts';
import CommonButton from '@/components/ui/CommonButton';
import { getStatisticWeekly } from '@/services/statisAdmin';

const UserStatsCard = () => {
  const navigate = useNavigate();

  const [stat, setStat] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getStatisticWeekly();
        setStat(res.data);
      } catch (error) {
        console.error('Lỗi khi fetch stat:', error);
      }
    };

    fetchStats();
  }, []);

  if (!stat) return null;

  const data = [
    { name: 'Returning', value: stat.loginRateBeforeNow },
    { name: 'Remaining', value: 100 - stat.loginRateBeforeNow },
  ];

  const COLORS = ['#FB923C', '#E5E7EB'];

  const handleNavigateListUser = () => {
    navigate('/admin/users');
  };

  return (
    <div className='bg-white rounded-xl shadow-sm p-6 col-span-1 min-h-[320px]'>
      <h2 className='text-md text-gray-700 font-semibold mb-4'>
        Thống kê số lượng người dùng
      </h2>

      <div className='flex flex-col items-center'>
        <PieChart width={150} height={120}>
          <Pie
            data={data}
            startAngle={180}
            endAngle={0}
            innerRadius={45}
            outerRadius={60}
            dataKey='value'
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
        </PieChart>

        <div className='text-center -mt-10'>
          <p className='text-xl font-semibold text-gray-700'>
            {stat.loginRateBeforeNow?.toFixed(1)}%
          </p>
          <p className='text-xs text-gray-500 mt-1'>
            Tỷ lệ giữ chân khách hàng
          </p>
        </div>

        <div className='flex justify-between w-full mt-5 text-sm text-gray-600'>
          <div className='text-center'>
            <p className='font-semibold'>{stat.loginThisWeek}</p>
            <p className='text-xs text-gray-500'>Tuần này</p>
          </div>
          <div className='text-center'>
            <p className='font-semibold'>{stat.loginLastWeek}</p>
            <p className='text-xs text-gray-500'>Tuần trước</p>
          </div>
        </div>

        <CommonButton onClick={handleNavigateListUser} className='mt-4'>
          Xem chi tiết
        </CommonButton>
      </div>
    </div>
  );
};

export default UserStatsCard;
