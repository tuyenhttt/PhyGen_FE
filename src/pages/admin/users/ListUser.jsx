import StatusBadge from '@/components/layouts/StatusBadge';
import ReusableTable from '@/components/table/ReusableTable';
import { getAllUserProfile } from '@/services/userService';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ListUser = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const mapIsActive = isActive => {
    if (isActive === true) return 'Đang hoạt động';
    if (isActive === false) return 'Đã khóa';
    return 'Không rõ';
  };

  const mapIsConfirm = isConfirm => {
    if (isConfirm === true) return 'Đã kích hoạt';
    if (isConfirm === false) return 'Chưa kích hoạt';
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

  const getShortName = (firstName, lastName) => {
    const parts = (lastName || '').trim().split(' ');
    if (parts.length === 1) {
      return `${firstName || ''} ${parts[0]}`.trim();
    }
    return `${firstName || ''} ${parts[0]}...`.trim();
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getAllUserProfile();
        const profiles = res.data;

        const formatted = profiles.map((user, index) => ({
          no: index + 1,
          id: user.id,
          name: getShortName(user.firstName, user.lastName),
          email: user.email,
          gender: user.gender,
          status: mapIsActive(user.isActive),
          confirm: mapIsConfirm(user.isConfirm),
          date: formatDate(user.createdAt),
        }));

        setUsers(formatted);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách người dùng:', error);
      }
    };

    fetchUsers();
  }, []);

  const columns = [
    { header: 'STT', accessor: 'no' },
    {
      header: 'Họ và Tên',
      accessor: 'name',
      render: value => (
        <div
          className='max-w-[100px] truncate overflow-hidden whitespace-nowrap'
          title={value}
        >
          {value}
        </div>
      ),
    },
    { header: 'Email', accessor: 'email' },
    { header: 'Giới tính', accessor: 'gender' },
    {
      header: 'Kích hoạt',
      accessor: 'confirm',
      render: value => <StatusBadge status={value} />,
    },
    {
      header: 'Tài khoản',
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
      showCheckbox={false}
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
