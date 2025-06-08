import ReusableTable from '@/components/table/ReusableTable';
import { useNavigate } from 'react-router-dom';

const statusColor = {
  'Đã kích hoạt': 'bg-green-100 text-green-800 border border-green-300',
  'Chưa kích hoạt': 'bg-red-100 text-red-800 border border-red-300',
};

const ListUser = () => {
  const navigate = useNavigate();

  const data = [
    {
      id: 1,
      name: 'Michael A. Miner',
      email: 'abc@gmail.com',
      status: 'Đã kích hoạt',
      total: '$4,521',
      coins: '$8,901',
      date: '07 Jan, 2023',
    },
  ];

  const columns = [
    { header: 'Tên', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    {
      header: 'Trạng thái',
      accessor: 'status',
      render: val => (
        <span
          className={`inline-block px-3 py-1 text-xs font-medium rounded ${statusColor[val]}`}
        >
          {val}
        </span>
      ),
    },
    { header: 'Tổng số tiền', accessor: 'total' },
    { header: 'Số xu hiện tại', accessor: 'coins' },
    { header: 'Số đề thi', accessor: 'date' },
  ];

  const handleView = row => {
    navigate(`/admin/users/${row.id}`);
  };

  const handleLockUser = row => {
    alert(`Khoá tài khoản: ${row.name}`);
  };

  return (
    <ReusableTable
      title='Danh sách người dùng'
      columns={columns}
      data={data}
      currentPage={1}
      totalPages={3}
      onPageChange={page => console.log('Go to page:', page)}
      actions={{
        view: handleView,
        delete: handleLockUser,
      }}
      actionIcons={{
        delete: 'lock',
      }}
    />
  );
};

export default ListUser;
