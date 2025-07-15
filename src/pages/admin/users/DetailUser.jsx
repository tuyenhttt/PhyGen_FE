import StatusBadge from '@/components/layouts/StatusBadge';
import ReusableTable from '@/components/table/ReusableTable';
import { getUserProfileById } from '@/services/userService';
import { searchPayments } from '@/services/paymentService';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { formatDateTime } from '@/utils/dateUtils';

const DetailUser = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const statusMap = {
    Completed: 'Đã hoàn thành',
    Pending: 'Chờ xử lý',
    Cancelled: 'Đã hủy',
    Expired: 'Hết hạn',
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const userRes = await getUserProfileById(id);
        const profile = userRes.data?.data?.[0];

        if (!profile) {
          setError('Không tìm thấy người dùng.');
          setLoading(false);
          return;
        }

        setUser(profile);

        const paymentRes = await searchPayments({
          userId: profile.id,
          pageIndex: currentPage,
          pageSize,
        });

        setPayments(paymentRes.data.data || []);
        setCurrentPage(paymentRes.data.pageIndex || 1);
        setTotalPages(Math.ceil(paymentRes.data.totalItems / pageSize) || 1);

        toast.success('Tải dữ liệu thành công!');
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu:', err);
        setError('Không thể tải dữ liệu.');
        toast.error('Không thể tải dữ liệu.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, currentPage]);

  const columns = [
    { header: 'Mã giao dịch', accessor: 'paymentLinkId' },
    {
      header: 'Số tiền (VNĐ)',
      accessor: 'amount',
      render: val => `${val * 1000} VNĐ`,
    },
    { header: 'Số xu', accessor: 'amount' },
    {
      header: 'Thời gian',
      accessor: 'createdAt',
      render: val => formatDateTime(val),
    },
    {
      header: 'Trạng thái',
      accessor: 'status',
      render: val => <StatusBadge status={statusMap[val] || val} />,
    },
  ];

  if (loading) return <p className='p-6'>Đang tải...</p>;
  if (error) return <p className='p-6 text-red-500'>{error}</p>;

  return (
    <div className='p-6'>
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

      <div className='flex flex-col md:flex-row gap-6'>
        <div className='bg-white p-4 rounded-lg shadow md:w-1/3 h-[300px] overflow-auto'>
          <h3 className='text-lg font-bold mb-4'>Chi tiết người dùng</h3>
          <p className='mb-2'>
            <strong>Email:</strong> {user.email}
          </p>
          <p className='mb-2'>
            <strong>Số điện thoại:</strong> {user.phone}
          </p>
          <p className='mb-2'>
            <strong>Giới tính:</strong> {user.gender}
          </p>
          <p className='mb-2'>
            <strong>Ngày sinh:</strong>{' '}
            {user.dateOfBirth &&
              new Date(user.dateOfBirth).toLocaleDateString('vi-VN')}
          </p>
        </div>

        <div className='md:w-2/3'>
          <ReusableTable
            title='Lịch sử giao dịch'
            columns={columns}
            data={payments}
            actions={null}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={page => setCurrentPage(page)}
            showActions={false}
          />
        </div>
      </div>
    </div>
  );
};

export default DetailUser;
