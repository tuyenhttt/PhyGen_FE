import BookCard from '@/components/cards/BookCard';
import StatusBadge from '@/components/layouts/StatusBadge';
import ReusableTable from '@/components/table/ReusableTable';
import {
  FaFileInvoice,
  FaHourglassHalf,
  FaCheckCircle,
  FaBan,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const InvoiceList = () => {
  const navigate = useNavigate();

  const data = [
    {
      id: 1,
      idInvoice: '#INV2540',
      name: 'Michael A. Miner',
      avatar: 'https://i.pravatar.cc/40?img=3',
      paymentDate: '07 Jan , 2023',
      total: '452 VNĐ',
      paymentMethod: 'Mastercard',
      status: 'Đã thanh toán',
    },
    {
      id: 2,
      idInvoice: '#INV3924',
      name: 'Theresa T. Brose',
      avatar: 'https://i.pravatar.cc/40?img=5',
      paymentDate: '03 Dec , 2023',
      total: '783 VNĐ',
      paymentMethod: 'Visa',
      status: 'Hủy',
    },
    {
      id: 3,
      idInvoice: '#INV4571',
      name: 'James L. Erickson',
      avatar: 'https://i.pravatar.cc/40?img=7',
      paymentDate: '28 Sep , 2023',
      total: '134 VNĐ',
      paymentMethod: 'Paypal',
      status: 'Chờ thanh toán',
    },
    {
      id: 4,
      idInvoice: '#INV4590',
      name: 'James L. Erickson',
      avatar: 'https://i.pravatar.cc/40?img=7',
      paymentDate: '28 Sep , 2023',
      total: '134 VNĐ',
      paymentMethod: 'Paypal',
      status: 'Thất bại',
    },
  ];

  const columns = [
    { header: 'ID', accessor: 'idInvoice' },
    {
      header: 'Họ và tên',
      accessor: 'name',
      render: (value, row) => (
        <div className='flex items-center gap-2'>
          <img src={row.avatar} alt='avatar' className='w-8 h-8 rounded-full' />
          <span>{value}</span>
        </div>
      ),
    },
    { header: 'Thời gian thanh toán', accessor: 'paymentDate' },
    { header: 'Tổng', accessor: 'total' },
    { header: 'Phương thức thanh toán', accessor: 'paymentMethod' },
    {
      header: 'Trạng thái',
      accessor: 'status',
      render: value => <StatusBadge status={value} />,
    },
  ];

  const handleView = row => navigate(`/admin/invoice-list/${row.id}`);

  return (
    <div className='p-4 space-y-6'>
      <h2 className='text-2xl font-bold text-gray-800 tracking-tight mb-5'>
        Tất cả giao dịch
      </h2>

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <BookCard
          title='Tổng số hóa đơn'
          value='200'
          icon={<FaFileInvoice className='text-orange-500 w-6 h-6' />}
        />
        <BookCard
          title='Hóa đơn chờ xử lý'
          value='10'
          icon={<FaHourglassHalf className='text-orange-500 w-6 h-6' />}
        />
        <BookCard
          title='Hóa đơn đã thanh toán'
          value='180'
          icon={<FaCheckCircle className='text-orange-500 w-6 h-6' />}
        />
        <BookCard
          title='Hóa đơn không hoạt động'
          value='10'
          icon={<FaBan className='text-orange-500 w-6 h-6' />}
        />
      </div>

      {/* Bảng hóa đơn */}
      <ReusableTable
        title='Danh sách hóa đơn'
        columns={columns}
        data={data}
        currentPage={1}
        totalPages={3}
        onPageChange={page => console.log('Go to page:', page)}
        actions={{ view: handleView }}
      />
    </div>
  );
};

export default InvoiceList;
