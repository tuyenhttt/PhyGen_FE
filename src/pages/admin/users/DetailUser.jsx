import StatusBadge from '@/components/layouts/StatusBadge';
import ReusableTable from '@/components/table/ReusableTable';
import { getUserProfileById } from '@/services/userService';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const columns = [
  { header: 'ID Hóa đơn', accessor: 'id' },
  {
    header: 'Trạng thái',
    accessor: 'status',
    render: value => <StatusBadge status={value} />,
  },
  { header: 'Tổng tiền', accessor: 'amount' },
  { header: 'Ngày', accessor: 'date' },
  { header: 'Phương thức', accessor: 'method' },
];

const DetailUser = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getUserProfileById(id);
        const profile = res.data?.[0];
        if (profile) {
          setUser(profile);
        } else {
          console.warn('Không tìm thấy người dùng với id:', id);
        }
      } catch (err) {
        console.error('Lỗi khi lấy chi tiết người dùng:', err);
      }
    };

    fetchUser();
  }, [id]);

  if (!user) return <p className='p-6'>Đang tải...</p>;

  return (
    <div className='p-6'>
      {/* Header Info */}
      <div className='bg-white p-6 rounded-xl shadow mb-6 flex items-center gap-6'>
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt='avatar'
            className='w-24 h-24 rounded-full object-cover'
          />
        ) : (
          <div className='w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500'>
            No Image
          </div>
        )}
        <div>
          <h2 className='text-xl font-bold'>
            {[user.lastName, user.firstName].filter(Boolean).join(' ')}
          </h2>
          <p className='text-gray-600'>{user.email}</p>
        </div>
      </div>

      <div className='grid grid-cols-3 gap-10'>
        <div className='bg-white p-4 rounded-lg shadow'>
          <h3 className='text-lg font-bold mb-4'>Chi tiết người dùng</h3>
          <p className='mb-4'>
            <strong>Email:</strong> {user.email}
          </p>
          <p className='mb-4'>
            <strong>Số điện thoại: </strong> {user.phone}
          </p>
          <p className='mb-4'>
            <strong>Giới tính: </strong> {user.gender}
          </p>
          <p className='mb-4'>
            <strong>Ngày sinh: </strong>
            {user.dateOfBirth &&
              new Date(user.dateOfBirth).toLocaleDateString('vi-VN')}
          </p>
        </div>

        {user.transactions && user.transactions.length > 0 && (
          <div className='col-span-2'>
            <ReusableTable
              title='Lịch sử giao dịch'
              columns={columns}
              data={user.transactions}
              actions={null}
              currentPage={1}
              totalPages={1}
              onPageChange={() => {}}
              showActions={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailUser;
