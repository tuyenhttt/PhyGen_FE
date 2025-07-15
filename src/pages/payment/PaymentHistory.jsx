import { useState, useEffect, useCallback } from 'react';
import { searchPayments } from '@/services/paymentService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import PrimaryButton from '@/components/ui/PrimaryButton';
import StatusBadge from '@/components/layouts/StatusBadge';
import { formatDateTime } from '@/utils/dateUtils';

const PaymentHistoryPage = () => {
  const { user, loading: loadingUser } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [status, setStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filter, setFilter] = useState({ fromDate: '', toDate: '' });
  const pageSize = 10;

  const formatDateForAPI = date => {
    return date ? new Date(date).toISOString() : null;
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
        const fromDateFormatted = formatDateForAPI(filter.fromDate);
        const toDateFormatted = formatDateForAPI(filter.toDate);

        const response = await searchPayments({
          userId: user.id,
          status,
          pageIndex: page,
          pageSize: pageSize,
          fromDate: fromDateFormatted,
          toDate: toDateFormatted,
        });

        setPayments(response.data.data);
        setCurrentPage(response.data.pageIndex);
        setTotalCount(response.data?.count || 0);
        toast.success('Tải lịch sử giao dịch thành công!');
      } catch (err) {
        console.error('Lỗi khi tải lịch sử giao dịch:', err);
        setError('Không thể tải lịch sử giao dịch. Vui lòng thử lại.');
        toast.error('Không thể tải lịch sử giao dịch.');
      } finally {
        setLoading(false);
      }
    },
    [user, loadingUser, status, filter, currentPage]
  );

  useEffect(() => {
    if (!loadingUser && user?.id) {
      fetchPayments(1);
    }
  }, [loadingUser, user]);

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

  const totalPages = Math.ceil(totalCount / pageSize);

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
              value={filter.fromDate}
              onChange={e => setFilter({ ...filter, fromDate: e.target.value })}
              className='w-full border rounded-md px-2 py-1'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Đến ngày:
            </label>
            <input
              type='date'
              value={filter.toDate}
              onChange={e => setFilter({ ...filter, toDate: e.target.value })}
              className='w-full border rounded-md px-2 py-1'
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
                      {formatDateTime(payment.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Custom Pagination */}
          {totalPages > 1 && (
            <div className='flex justify-center mt-6 gap-2'>
              {/* Trước */}
              <button
                onClick={() => {
                  const newPage = Math.max(1, currentPage - 1);
                  setCurrentPage(newPage);
                  fetchPayments(newPage);
                }}
                disabled={currentPage === 1}
                className='px-4 py-2 border rounded disabled:opacity-50'
              >
                Trước
              </button>

              {/* Các trang */}
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => {
                      setCurrentPage(page);
                      fetchPayments(page);
                    }}
                    className={`px-4 py-2 border rounded ${
                      currentPage === page
                        ? 'bg-orange-500 text-white'
                        : 'bg-white hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              {/* Sau */}
              <button
                onClick={() => {
                  const newPage = Math.min(currentPage + 1, totalPages);
                  setCurrentPage(newPage);
                  fetchPayments(newPage);
                }}
                disabled={currentPage >= totalPages}
                className='px-4 py-2 border rounded disabled:opacity-50'
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PaymentHistoryPage;
