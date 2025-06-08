import ReusableTable from './ReusableTable';

const transactions = [
  {
    id: '#INV-6212',
    status: 'Đã thanh toán',
    amount: '$112.00',
    date: '01 Jan, 2023',
    method: 'Momo',
  },
  {
    id: '#INV-6213',
    status: 'Chờ thanh toán',
    amount: '$91.00',
    date: '23 Feb, 2023',
    method: 'Chuyển khoản',
  },
  {
    id: '#INV-6214',
    status: 'Thất bại',
    amount: '$47.00',
    date: '14 Mar, 2023',
    method: 'MoMoWallet',
  },
  {
    id: '#INV-6215',
    status: 'Đã thanh toán',
    amount: '$114.00',
    date: '22 May, 2023',
    method: 'Visa',
  },
];

const statusBadge = {
  'Đã thanh toán': 'bg-green-100 text-green-700',
  'Chờ thanh toán': 'bg-yellow-100 text-yellow-700',
  'Thất bại': 'bg-red-100 text-red-700',
};

const columns = [
  {
    header: 'ID Hóa đơn',
    accessor: 'id',
  },
  {
    header: 'Trạng thái',
    accessor: 'status',
    render: value => (
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${
          statusBadge[value] || 'bg-gray-100 text-gray-600'
        }`}
      >
        {value}
      </span>
    ),
  },
  {
    header: 'Tổng tiền',
    accessor: 'amount',
  },
  {
    header: 'Ngày',
    accessor: 'date',
  },
  {
    header: 'Phương thức',
    accessor: 'method',
  },
];

const HistoryTransaction = () => {
  return (
    <ReusableTable
      title='Lịch sử giao dịch'
      columns={columns}
      data={transactions}
      actions={null}
      currentPage={1}
      totalPages={1}
      onPageChange={() => {}}
    />
  );
};

export default HistoryTransaction;
