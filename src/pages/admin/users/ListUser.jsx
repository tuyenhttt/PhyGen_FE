import StatusBadge from '@/components/layouts/StatusBadge';
import ReusableTable from '@/components/table/ReusableTable';
import { getAllUserProfile } from '@/services/userService';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ListUser = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getAllUserProfile();
        const profiles = res.data;

        const formatted = profiles.map(user => ({
          id: user.id,
          name: user.lastName + ' ' + user.firstName || 'Chưa cập nhật',
          email: user.email,
          gender: user.gender,
          status: mapIsActive(user.isActive),
          date: formatDate(user.createdAt),
        }));

        setUsers(formatted);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách người dùng:', error);
      }
    };

    fetchUsers();
  }, []);

  const mapIsActive = isActive => {
    if (isActive === true) return 'Đã kích hoạt';
    if (isActive === false) return 'Chưa kích hoạt';
    return 'Không rõ';
  };

  // Định dạng ngày tạo
  const formatDate = dateStr => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const columns = [
    { header: 'Họ và Tên', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Gender', accessor: 'gender' },
    {
      header: 'Trạng thái',
      accessor: 'status',
      render: value => <StatusBadge status={value} />,
    },
    { header: 'Ngày tạo', accessor: 'date' },
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
      data={users}
      currentPage={1}
      totalPages={1}
      onPageChange={page => console.log('Chuyển đến trang:', page)}
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
