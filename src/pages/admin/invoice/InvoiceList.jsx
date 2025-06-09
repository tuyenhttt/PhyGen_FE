import BookCard from '@/components/cards/BookCard';
import ReusableTable from '@/components/table/ReusableTable';
import {
  FaFileInvoice,
  FaHourglassHalf,
  FaCheckCircle,
  FaBan,
} from 'react-icons/fa';

const InvoiceList = () => {
//   const navigate = useNavigate();
  const data = [
    {
      id: 1,
      idInvoice: '#INV2540',
      name: 'Michael A. Miner',
      avatar: 'https://i.pravatar.cc/40?img=3',
      orderDate: '07 Jan , 2023',
      total: '$ 452',
      paymentMethod: 'Mastercard',
      status: 'Paid'
    },
    {
      id: 1,
      idInvoice: '#INV3924',
      name: 'Theresa T. Brose',
      avatar: 'https://i.pravatar.cc/40?img=5',
      orderDate: '03 Dec , 2023',
      total: '$ 783',
      paymentMethod: 'Visa',
      status: 'Cancel'
    },
    {
      id: 1,
      idInvoice: '#INV2540',
      name: 'James L. Erickson',
      avatar: 'https://i.pravatar.cc/40?img=7',
      orderDate: '28 Sep , 2023',
      total: '$ 134',
      paymentMethod: 'Paypal',
      status: 'Paid'
    },
  ];

  const columns = [
    { header: 'ID', accessor: 'idInvoice' },
   {
    header: 'Họ và tên',
    accessor: 'name',
    render: (value, row) => (
      <div className="flex items-center gap-2">
        <img src={row.avatar} alt="avatar" className="w-8 h-8 rounded-full" />
        <span>{value}</span>
      </div>
    )
  },
    { header: 'Ngày đặt', accessor: 'orderDate' },
    { header: 'Tổng', accessor: 'total' },
    { header: 'Phương thức thanh toán', accessor: 'paymentMethod' },
    {
    header: 'Trạng thái',
    accessor: 'status',
    render: (value) => (
      <span className={`px-2 py-1 rounded text-sm ${statusColor(value)}`}>
        {value}
      </span>
    )
  },
  ];

    const handleView = row => {
    navigate(`/admin/invoice-list/${row.id}`);
  };

  const handleEdit = row => {
    alert(`Sửa: ${row.name}`);
  };

  const handleDelete = row => {
    alert(`Xoá: ${row.name}`);
  };

  const statusColor = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-700";
      case "Cancel":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

    return (
        <div className='p-4 space-y-6 '>
      <h2 className='text-2xl font-bold text-gray-800 tracking-tight mb-5'>
        Danh sách hóa đơn
      </h2>
      {/* Book Cards */}
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

      {/* Table */}
      <div>
        <ReusableTable
          title={'Danh sách bài học'}
          columns={columns}
          data={data}
          currentPage={1}
          totalPages={3}
          onPageChange={page => console.log('Go to page:', page)}
          actions={{
            view: handleView,
            edit: handleEdit,
            delete: handleDelete,
          }}
        />
      </div>
    </div>
  );
};

export default InvoiceList;