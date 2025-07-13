import { useState, useEffect, useCallback } from 'react';
import { searchPayments } from '@/services/paymentService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import CommonButton from '@/components/ui/CommonButton';
import PrimaryButton from '@/components/ui/PrimaryButton';
import StatusBadge from '@/components/layouts/StatusBadge'; // ✅ Đã dùng

const PaymentHistoryPage = () => {
  const { user, loading: loadingUser } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [status, setStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const convertStatus = value => {
    switch (value) {
      case '0':
        return 'Pending';
      case '1':
        return 'Completed';
      case '2':
        return 'Cancelled';
      case '3':
        return 'Expired';
      default:
        return null;
    }
  };

  const fetchPayments = useCallback(
    async (page = 1) => {
      if (loadingUser || !user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await searchPayments({
          userId: user.id,
          fromDate: fromDate || null,
          toDate: toDate || null,
          status: convertStatus(status),
          pageIndex: page,
          pageSize: pageSize,
        });

        setPayments(response.data.data);
        setCurrentPage(response.data.pageIndex);
        setTotalPages(
          Math.ceil(response.data.totalItems / response.data.pageSize)
        );
        toast.success('Tải lịch sử giao dịch thành công!');
      } catch (err) {
        console.error('Lỗi khi tải lịch sử giao dịch:', err);
        setError('Không thể tải lịch sử giao dịch. Vui lòng thử lại.');
        toast.error('Không thể tải lịch sử giao dịch.');
      } finally {
        setLoading(false);
      }
    },
    [user, loadingUser, fromDate, toDate, status]
  );

  useEffect(() => {
    if (!loadingUser && user?.id) {
      fetchPayments(1);
    }
  }, [fetchPayments, loadingUser, user]);

  const statusMap = {
    Completed: 'Đã hoàn thành',
    Pending: 'Chờ xử lý',
    Cancelled: 'Đã hủy',
    Expired: 'Hết hạn',
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchPayments(1);
  };

  const handlePageChange = page => {
    setCurrentPage(page);
    fetchPayments(page);
  };

  return (
    <div className='max-w-6xl mx-auto my-12 p-8 mt-20'>
      <h1 className='text-3xl font-bold text-gray-800 mb-8 text-center'>
        Lịch sử giao dịch xu
      </h1>

      {/* Bộ lọc */}
      <div className='mb-8 p-6 bg-gray-100 rounded-lg shadow-md border border-gray-300'>
        <h2 className='text-xl font-semibold text-gray-700 mb-4'>
          Tìm kiếm giao dịch
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Từ ngày:
            </label>
            <input
              type='date'
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              className='mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Đến ngày:
            </label>
            <input
              type='date'
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              className='mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Trạng thái:
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className='mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
            >
              <option value=''>Tất cả</option>
              <option value='Pending'>Đang chờ xử lý</option>
              <option value='Completed'>Hoàn tất</option>
              <option value='Cancelled'>Thất bại</option>
              <option value='Expired'>Hết hạn</option>
            </select>
          </div>
        </div>
        <div className='mt-6 text-center'>
          <PrimaryButton
            onClick={handleSearch}
            disabled={loading}
            className='px-8 py-3 text-lg'
          >
            {loading ? 'Đang tìm kiếm...' : 'Tìm kiếm'}
          </PrimaryButton>
        </div>
      </div>

      {/* Danh sách */}
      {loading ? (
        <div className='flex items-center justify-center h-32'>
          <p className='text-lg font-medium text-gray-800 animate-pulse'>
            Đang tải lịch sử giao dịch...
          </p>
        </div>
      ) : error ? (
        <p className='text-red-600 text-center font-bold bg-red-100 p-4 rounded-md border border-red-300'>
          {error}
        </p>
      ) : payments.length === 0 ? (
        <p className='text-gray-500 text-center text-lg p-6 rounded-md italic'>
          Không có giao dịch nào được tìm thấy.
        </p>
      ) : (
        <>
          <div className='overflow-x-auto rounded-lg shadow border border-gray-300'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-100'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
                    Mã giao dịch
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
                    Số xu
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
                    Số tiền (VNĐ)
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
                    Trạng thái
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
                    Ngày tạo
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {payments.map(payment => (
                  <tr key={payment.id || payment.paymentLinkId}>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600'>
                      {payment.paymentLinkId}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {payment.amount}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {(payment.amount * 1000).toLocaleString('vi-VN')} VNĐ
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <StatusBadge status={statusMap[payment.status]} />
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {new Date(payment.createdAt).toLocaleString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          {totalPages > 1 && (
            <div className='flex justify-center items-center gap-4 mt-8'>
              <CommonButton
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
              >
                Trước
              </CommonButton>
              <span className='text-gray-700'>
                Trang {currentPage} / {totalPages}
              </span>
              <CommonButton
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
              >
                Sau
              </CommonButton>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PaymentHistoryPage;
