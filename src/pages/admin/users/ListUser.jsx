import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReusableTable from '@/components/table/ReusableTable';
import StatusBadge from '@/components/layouts/StatusBadge';
import { getAllUserProfile, lockUserById } from '@/services/userService';
import SearchInput from '@/components/ui/SearchInput';
import { MdOutlineClear } from 'react-icons/md';
import { toast } from 'react-toastify';
import PrimaryButton from '@/components/ui/PrimaryButton';
import CommonButton from '@/components/ui/CommonButton';
import { IoFilter } from 'react-icons/io5';

const ListUser = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState({
    role: '',
    status: '',
    confirm: '',
    fromDate: '',
    toDate: '',
  });
  const [showFilterModal, setShowFilterModal] = useState(false);

  const activeFilterCount = Object.values(filter).filter(v => v).length;

  const mapIsActive = isActive => {
    if (isActive === true) return 'Đang hoạt động';
    if (isActive === false) return 'Đã khóa';
  };

  const mapIsConfirm = isConfirm => {
    if (isConfirm === true) return 'Đã kích hoạt';
    if (isConfirm === false) return 'Chưa kích hoạt';
    return 'Không rõ';
  };

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

  const handleLockUser = async row => {
    try {
      await lockUserById(row.id);

      setUsers(prev =>
        prev.map(user =>
          user.id === row.id ? { ...user, status: 'Đã khóa' } : user
        )
      );

      toast.success(`Đã khoá tài khoản ${row.name}`);
    } catch (error) {
      console.error('Lỗi khi khoá tài khoản:', error);
      toast.error('Không thể khoá tài khoản. Vui lòng thử lại.');
    }
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
          rawDate: user.createdAt,
          role: user.role,
        }));
        setUsers(formatted);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách người dùng:', error);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filter.role ? user.role === filter.role : true;
    const matchesStatus = filter.status ? user.status === filter.status : true;
    const matchesConfirm = filter.confirm
      ? user.confirm === filter.confirm
      : true;

    const createdAt = new Date(user.rawDate);
    const from = filter.fromDate ? new Date(filter.fromDate) : null;
    const to = filter.toDate ? new Date(filter.toDate) : null;

    const matchesDate =
      (!from || createdAt >= from) && (!to || createdAt <= to);

    return (
      matchesSearch &&
      matchesRole &&
      matchesStatus &&
      matchesConfirm &&
      matchesDate
    );
  });

  const columns = [
    { header: 'STT', accessor: 'no' },
    {
      header: 'Họ và Tên',
      accessor: 'name',
      render: value => (
        <div className='max-w-[100px] truncate' title={value}>
          {value}
        </div>
      ),
    },
    {
      header: 'Email',
      accessor: 'email',
      render: value => (
        <div className='max-w-[150px] truncate' title={value}>
          {value}
        </div>
      ),
    },
    { header: 'Giới tính', accessor: 'gender' },
    {
      header: 'Kích hoạt',
      accessor: 'confirm',
      render: value => <StatusBadge status={value} />,
    },
    {
      header: 'Trạng thái',
      accessor: 'status',
      render: value => <StatusBadge status={value} />,
    },
    { header: 'Ngày tạo', accessor: 'date' },
    { header: 'Vai trò', accessor: 'role' },
  ];

  const handleView = row => navigate(`/admin/users/${row.id}`);

  return (
    <ReusableTable
      title='Danh sách người dùng'
      columns={columns}
      data={filteredUsers}
      currentPage={1}
      totalPages={1}
      onPageChange={page => console.log('Chuyển đến trang:', page)}
      showCheckbox={false}
      actions={{ view: handleView, delete: handleLockUser }}
      actionIcons={{ delete: 'lock' }}
      disableActions={{
        delete: row => row.role === 'Admin' || row.status === 'Đã khóa',
      }}
      headerRight={
        <div className='flex gap-2 items-center relative'>
          {/* Search Input */}
          <SearchInput
            placeholder='Tìm kiếm theo tên hoặc email...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />

          {/* Filter Button */}
          <button
            onClick={() => setShowFilterModal(!showFilterModal)}
            className='relative border px-3 py-1 rounded-md text-sm hover:bg-gray-100 flex items-center gap-1'
          >
            <IoFilter />
            <span>Lọc</span>
            {activeFilterCount > 0 && (
              <span className='ml-1 text-xs bg-blue-600 text-white rounded-full px-1.5'>
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Filter Modal */}
          {showFilterModal && (
            <div className='absolute top-full right-0 mt-2 bg-white border shadow-lg rounded-lg w-72 p-4 z-50'>
              <div className='flex justify-between items-center mb-3'>
                <h3 className='text-sm font-semibold'>Bộ lọc người dùng</h3>
                <button onClick={() => setShowFilterModal(false)}>
                  <MdOutlineClear />
                </button>
              </div>
              <div className='space-y-3 text-sm'>
                {/* Vai trò */}
                <div>
                  <label className='font-medium'>Vai trò</label>
                  <div className='flex flex-wrap gap-2 mt-1'>
                    {['', 'Admin', 'User'].map(role => (
                      <label key={role} className='flex items-center gap-1'>
                        <input
                          type='radio'
                          name='role'
                          checked={filter.role === role}
                          onChange={() => setFilter({ ...filter, role })}
                        />
                        {role || 'Tất cả'}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Kích hoạt */}
                <div>
                  <label className='font-medium'>Kích hoạt</label>
                  <select
                    value={filter.confirm}
                    onChange={e =>
                      setFilter({ ...filter, confirm: e.target.value })
                    }
                    className='w-full mt-1 border rounded-md px-2 py-1'
                  >
                    <option value=''>Tất cả</option>
                    <option value='Đã kích hoạt'>Đã kích hoạt</option>
                    <option value='Chưa kích hoạt'>Chưa kích hoạt</option>
                  </select>
                </div>

                {/* Trạng thái */}
                <div>
                  <label className='font-medium'>Trạng thái</label>
                  <select
                    value={filter.status}
                    onChange={e =>
                      setFilter({ ...filter, status: e.target.value })
                    }
                    className='w-full mt-1 border rounded-md px-2 py-1'
                  >
                    <option value=''>Tất cả</option>
                    <option value='Đang hoạt động'>Đang hoạt động</option>
                    <option value='Đã khóa'>Đã khóa</option>
                  </select>
                </div>

                {/* Ngày tạo */}
                <div className='grid grid-cols-2 gap-2'>
                  <div>
                    <label className='font-medium'>Từ ngày</label>
                    <input
                      type='date'
                      value={filter.fromDate}
                      onChange={e =>
                        setFilter({ ...filter, fromDate: e.target.value })
                      }
                      className='w-full border rounded-md px-2 py-1'
                    />
                  </div>
                  <div>
                    <label className='font-medium'>Đến ngày</label>
                    <input
                      type='date'
                      value={filter.toDate}
                      onChange={e =>
                        setFilter({ ...filter, toDate: e.target.value })
                      }
                      className='w-full border rounded-md px-2 py-1'
                    />
                  </div>
                </div>
              </div>

              {/* Footer buttons */}
              <div className='mt-4 flex justify-end gap-2'>
                <CommonButton
                  className='text-sm px-3 py-1.5'
                  onClick={() => {
                    setFilter({
                      role: '',
                      status: '',
                      confirm: '',
                      fromDate: '',
                      toDate: '',
                    });
                    setShowFilterModal(false);
                  }}
                >
                  Bỏ lọc
                </CommonButton>
                <PrimaryButton
                  className='text-sm px-3 py-1.5'
                  onClick={() => setShowFilterModal(false)}
                >
                  Lọc
                </PrimaryButton>
              </div>
            </div>
          )}
        </div>
      }
    />
  );
};

export default ListUser;
