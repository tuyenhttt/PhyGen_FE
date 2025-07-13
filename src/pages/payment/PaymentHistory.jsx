import React, { useState, useEffect, useCallback } from 'react';
import { searchPayments } from '@/services/paymentService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import CommonButton from '@/components/ui/CommonButton';
import PrimaryButton from '@/components/ui/PrimaryButton';

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

  const mapStatusToText = status => {
    switch (status) {
      case 0:
        return 'Đang chờ xử lý';
      case 1:
        return 'Hoàn tất';
      case 2:
      case 'CANCELLED':
        return 'Thất bại';
      case 3:
        return 'Hết hạn';
      default:
        return 'Không xác định';
    }
  };

  const getStatusBadgeClasses = status => {
    switch (status) {
      case 0:
        return 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold';
      case 1:
        return 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold';
      case 2:
        return 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold';
      case 3:
        return 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold';
      default:
        return 'bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold';
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
          status: status || null,
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

  const handleSearch = () => {
    setCurrentPage(1);
    fetchPayments(1);
  };

  const handlePageChange = page => {
    setCurrentPage(page);
    fetchPayments(page);
  };

  return (
    <div className='max-w-6xl mx-auto my-12 p-8 bg-white rounded-xl shadow-lg font-sans mt-20'>
      <h1 className='text-3xl font-bold text-gray-800 mb-8 text-center'>
        Lịch sử giao dịch Xu
      </h1>

      <div className='mb-8 p-6 bg-gray-50 rounded-lg shadow-sm border border-gray-200'>
        <h2 className='text-xl font-semibold text-gray-700 mb-4'>
          Bộ lọc tìm kiếm
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div>
            <label
              htmlFor='fromDate'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Từ ngày:
            </label>
            <input
              type='date'
              id='fromDate'
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              className='mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
            />
          </div>
          <div>
            <label
              htmlFor='toDate'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Đến ngày:
            </label>
            <input
              type='date'
              id='toDate'
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              className='mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
            />
          </div>
          <div>
            <label
              htmlFor='status'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Trạng thái:
            </label>
            <select
              id='status'
              value={status}
              onChange={e => setStatus(e.target.value)}
              className='mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
            >
              <option value=''>Tất cả</option>
              <option value='0'>Đang chờ xử lý</option>
              <option value='1'>Hoàn tất</option>
              <option value='2'>Thất bại</option>
              <option value='3'>Hết hạn</option>
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
        <p className='text-gray-600 text-center text-lg p-6 bg-blue-50 rounded-md border border-blue-200'>
          Không có giao dịch nào được tìm thấy.
        </p>
      ) : (
        <>
          <div className='overflow-x-auto rounded-lg shadow border border-gray-200'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-100'>
                <tr>
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    Mã giao dịch
                  </th>
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    Số xu
                  </th>
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    Số tiền (VNĐ)
                  </th>
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    Trạng thái
                  </th>
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    Ngày tạo
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {payments.map(payment => (
                  <tr key={payment.id}>
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
                      <span className={getStatusBadgeClasses(payment.status)}>
                        {mapStatusToText(payment.status)}
                      </span>
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
                className='px-4 py-2'
              >
                Trước
              </CommonButton>
              <span className='text-gray-700'>
                Trang {currentPage} / {totalPages}
              </span>
              <CommonButton
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                className='px-4 py-2'
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
