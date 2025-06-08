import ReusableTable from '@/components/table/ReusableTable';

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
  { header: 'ID Hóa đơn', accessor: 'id' },
  {
    header: 'Trạng thái',
    accessor: 'status',
    render: value => (
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${statusBadge[value]}`}
      >
        {value}
      </span>
    ),
  },
  { header: 'Tổng tiền', accessor: 'amount' },
  { header: 'Ngày', accessor: 'date' },
  { header: 'Phương thức', accessor: 'method' },
];

const DetailUser = () => {
  return (
    <div className='p-6'>
      {/* Header Info */}
      <div className='bg-white p-6 rounded-xl shadow mb-6 flex items-center gap-6'>
        <img
          src='https://i.pravatar.cc/100'
          alt='avatar'
          className='w-24 h-24 rounded-full object-cover'
        />
        <div>
          <h2 className='text-xl font-bold '>Michael A. Miner</h2>
          <p className='text-gray-600'>michael.miner@example.com</p>
        </div>
      </div>

      <div className='grid grid-cols-3 gap-10'>
        <div className='bg-white p-4 rounded-lg shadow'>
          <h3 className='text-lg font-bold mb-4'>Chi tiết người dùng</h3>
          <p className='mb-4'>
            <strong>Email:</strong> michael.miner@example.com
          </p>
          <p className='mb-4'>
            <strong>Địa chỉ:</strong> 02 rue des Nations Unies, SAINT-ARNOULT
          </p>
          <p className='mb-4'>
            <strong>Số điện thoại</strong> 0126.222.666
          </p>
          <p className='mb-4'>
            <strong>Giới tính</strong> Nam
          </p>
          <p className='mb-4'>
            <strong>Ngày sinh</strong> 15-11-2020
          </p>
        </div>

        <div className='col-span-2'>
          <ReusableTable
            title='Lịch sử giao dịch'
            columns={columns}
            data={transactions}
            actions={null}
            currentPage={1}
            totalPages={1}
            onPageChange={() => {}}
            showCheckbox={false}
            showActions={false}
          />
        </div>
      </div>
    </div>
  );
};

export default DetailUser;
