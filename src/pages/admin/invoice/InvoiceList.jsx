import BookCard from '@/components/cards/BookCard';
import StatusBadge from '@/components/layouts/StatusBadge';
import ReusableTable from '@/components/table/ReusableTable';
import SearchInput from '@/components/ui/SearchInput';
import { getStatisticsPayment } from '@/services/paymentService';
import { formatDateTime } from '@/utils/dateUtils';
import { useEffect, useState } from 'react';
import { FaFileInvoice, FaHourglassHalf, FaCheckCircle } from 'react-icons/fa';
import { IoFilter } from 'react-icons/io5';
import { MdCancel, MdOutlineClear } from 'react-icons/md';

const PAGE_SIZE = 10;

const statusMap = {
  Completed: 'Đã hoàn thành',
  Pending: 'Chờ xử lý',
  Cancelled: 'Đã hủy',
  Expired: 'Hết hạn',
};

const viToApiStatus = {
  'Đã hoàn thành': 'Completed',
  'Chờ xử lý': 'Pending',
  'Đã hủy': 'Cancelled',
  'Hết hạn': 'Expired',
};

function useDebouncedValue(value, delay = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

const InvoiceList = () => {
  const [invoiceData, setInvoiceData] = useState({
    totalBill: 0,
    pendingBill: 0,
    completedBill: 0,
    canceledBill: 0,
    invoices: [],
  });

  const [filter, setFilter] = useState({
    status: '',
    minAmount: '',
  });

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedValue(searchTerm, 400);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const activeFilterCount = Object.values(filter).filter(v => v !== '').length;

  const fetchStatisticsPayment = async page => {
    try {
      const response = await getStatisticsPayment(page, PAGE_SIZE, {
        fullName: debouncedSearch || undefined,
        status: filter.status ? viToApiStatus[filter.status] : undefined,
        minAmount: filter.minAmount ? Number(filter.minAmount) : undefined,
      });

      const payload =
        (response.data && response.data.data) ?? response.data ?? {};

      const invoicesSection = payload.invoices || {};
      const invoicesArr = Array.isArray(invoicesSection.data)
        ? invoicesSection.data
        : [];

      const totalCount =
        invoicesSection.totalItems ??
        invoicesSection.totalCount ??
        invoicesSection.count ??
        0;

      const mappedInvoices = invoicesArr.map((item, index) => ({
        ...item,
        status: statusMap[item.status] || item.status,
        no: (page - 1) * PAGE_SIZE + index + 1,
      }));

      setInvoiceData({
        totalBill: payload.totalBill || 0,
        pendingBill: payload.pendingBill || 0,
        completedBill: payload.completedBill || 0,
        canceledBill: payload.canceledBill || 0,
        invoices: mappedInvoices,
      });

      setTotalPages(Math.max(1, Math.ceil(Number(totalCount) / PAGE_SIZE)));
    } catch (err) {
      console.error('Lỗi lấy thống kê:', err);
      setTotalPages(1);
      setInvoiceData(prev => ({ ...prev, invoices: [] }));
    }
  };

  useEffect(() => {
    fetchStatisticsPayment(currentPage);
  }, [currentPage, debouncedSearch, filter.status, filter.minAmount]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filter.status, filter.minAmount]);

  const columns = [
    { header: 'STT', accessor: 'no' },
    { header: 'Mã hóa đơn', accessor: 'invoiceId' },
    {
      header: 'Họ và tên',
      accessor: 'fullName',
      render: (value, row) => (
        <div className='flex items-center gap-2'>
          <img
            src={row.avatarUrl}
            alt={value || 'avatar'}
            className='w-8 h-8 rounded-full'
          />
          <span>{value}</span>
        </div>
      ),
    },
    {
      header: 'Thời gian thanh toán',
      accessor: 'createdAt',
      render: val => formatDateTime(val),
    },
    { header: 'Số xu', accessor: 'amount' },
    { header: 'Phương thức', accessor: 'paymentMethod' },
    {
      header: 'Trạng thái',
      accessor: 'status',
      render: value => <StatusBadge status={value} />,
    },
  ];

  return (
    <div className='p-4 space-y-6'>
      <h2 className='text-2xl font-bold'>Tất cả giao dịch</h2>

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <BookCard
          title='Tổng số hóa đơn'
          value={invoiceData.totalBill}
          icon={<FaFileInvoice className='text-orange-500 w-6 h-6' />}
        />
        <BookCard
          title='Hóa đơn chờ xử lý'
          value={invoiceData.pendingBill}
          icon={<FaHourglassHalf className='text-orange-500 w-6 h-6' />}
        />
        <BookCard
          title='Hóa đơn đã hoàn thành'
          value={invoiceData.completedBill}
          icon={<FaCheckCircle className='text-orange-500 w-6 h-6' />}
        />
        <BookCard
          title='Hóa đơn bị hủy'
          value={invoiceData.canceledBill}
          icon={<MdCancel className='text-orange-500 w-6 h-6' />}
        />
      </div>

      <ReusableTable
        title='Danh sách hóa đơn'
        columns={columns}
        data={invoiceData.invoices}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={page => setCurrentPage(page)}
        headerRight={
          <div className='flex gap-2 items-center relative'>
            <SearchInput
              placeholder='Tìm tên người dùng...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <button
              onClick={() => setShowFilterModal(!showFilterModal)}
              className='border px-3 py-1 rounded-md text-sm hover:bg-gray-100 flex items-center gap-1'
            >
              <IoFilter />
              <span>Lọc</span>
              {activeFilterCount > 0 && (
                <span className='ml-1 text-xs bg-blue-600 text-white rounded-full px-1.5'>
                  {activeFilterCount}
                </span>
              )}
            </button>

            {showFilterModal && (
              <div className='absolute top-full right-0 mt-2 z-50 w-72 bg-white border shadow-md rounded-md p-4'>
                <div className='flex justify-between items-center mb-2'>
                  <h3 className='text-sm font-semibold'>Bộ lọc</h3>
                  <button onClick={() => setShowFilterModal(false)}>
                    <MdOutlineClear />
                  </button>
                </div>

                <div className='space-y-3 text-sm'>
                  <div>
                    <label className='font-medium'>Trạng thái</label>
                    <select
                      value={filter.status}
                      onChange={e =>
                        setFilter({ ...filter, status: e.target.value })
                      }
                      className='w-full mt-1 border rounded px-2 py-1'
                    >
                      <option value=''>Tất cả</option>
                      <option value='Đã hoàn thành'>Đã hoàn thành</option>
                      <option value='Chờ xử lý'>Chờ xử lý</option>
                      <option value='Hết hạn'>Hết hạn</option>
                      <option value='Đã hủy'>Đã hủy</option>
                    </select>
                  </div>

                  <div>
                    <label className='font-medium'>Số xu tối thiểu</label>
                    <input
                      type='number'
                      className='w-full mt-1 border rounded px-2 py-1'
                      value={filter.minAmount}
                      onChange={e =>
                        setFilter({ ...filter, minAmount: e.target.value })
                      }
                      placeholder='VD: 10000'
                    />
                  </div>
                </div>

                <div className='mt-4 flex justify-end gap-2'>
                  <button
                    onClick={() => {
                      setFilter({ status: '', minAmount: '' });
                      setShowFilterModal(false);
                    }}
                    className='text-sm px-3 py-1.5 border rounded'
                  >
                    Bỏ lọc
                  </button>
                  <button
                    onClick={() => setShowFilterModal(false)}
                    className='text-sm px-3 py-1.5 bg-blue-600 text-white rounded'
                  >
                    Lọc
                  </button>
                </div>
              </div>
            )}
          </div>
        }
      />
    </div>
  );
};

export default InvoiceList;
