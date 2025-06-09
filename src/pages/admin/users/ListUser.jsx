import StatusBadge from '@/components/layouts/StatusBadge';
import ReusableTable from '@/components/table/ReusableTable';
import { useNavigate } from 'react-router-dom';

const ListUser = () => {
  const navigate = useNavigate();

  const data = [
    {
      id: 1,
      name: 'Michael A. Miner',
      email: 'abc@gmail.com',
      status: 'Đã kích hoạt',
      total: '4,521 VNĐ',
      coins: '8,901 xu',
      date: '07 Jan, 2023',
    },
    {
      id: 2,
      name: 'Michael A. Miner',
      email: 'abc@gmail.com',
      status: 'Chưa kích hoạt',
      total: '4,521 VNĐ',
      coins: '8,901 xu',
      date: '07 Jan, 2023',
    },
    {
      id: 3,
      name: 'Michael A. Miner',
      email: 'abc@gmail.com',
      status: 'Đã khóa',
      total: '4,521 VNĐ',
      coins: '8,901 xu',
      date: '07 Jan, 2023',
    },
  ];

  const columns = [
    { header: 'Tên', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    {
      header: 'Trạng thái',
      accessor: 'status',
      render: value => <StatusBadge status={value} />,
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
