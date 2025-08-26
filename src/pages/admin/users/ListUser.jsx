import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReusableTable from '@/components/table/ReusableTable';
import StatusBadge from '@/components/layouts/StatusBadge';
import SearchInput from '@/components/ui/SearchInput';
import { MdOutlineClear } from 'react-icons/md';
import { toast } from 'react-toastify';
import PrimaryButton from '@/components/ui/PrimaryButton';
import CommonButton from '@/components/ui/CommonButton';
import { IoFilter } from 'react-icons/io5';
import { formatDateTime } from '@/utils/dateUtils';
import ConfirmModal from '@/components/ui/ConfirmModal';
import {
  getAllUserProfile,
  lockUserById,
  unlockUserById,
} from '@/services/userService';

const PAGE_SIZE = 10;
const uiConfirmToBoolean = v =>
  v === 'Đã kích hoạt' ? true : v === 'Chưa kích hoạt' ? false : null;
const uiStatusToBoolean = v =>
  v === 'Đang hoạt động' ? true : v === 'Đã khóa' ? false : null;
const toIsoStart = d => (d ? `${d}T00:00:00` : null);
const toIsoEnd = d => (d ? `${d}T23:59:59` : null);
const mapIsActive = b =>
  b === true ? 'Đang hoạt động' : b === false ? 'Đã khóa' : 'Không rõ';
const mapIsConfirm = b =>
  b === true ? 'Đã kích hoạt' : b === false ? 'Chưa kích hoạt' : 'Không rõ';
const getShortName = (firstName, lastName) => {
  const parts = (lastName || '').trim().split(' ');
  const short =
    parts.length === 1
      ? `${firstName || ''} ${parts[0]}`
      : `${firstName || ''} ${parts[0]}...`;
  return {
    shortName: short.trim(),
    fullName: `${firstName || ''} ${lastName || ''}`.trim(),
  };
};

const ListUser = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchUser, setSearchUser] = useState('');
  const [filter, setFilter] = useState({
    role: '',
    status: '',
    confirm: '',
    fromDate: '',
    toDate: '',
  });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [confirmState, setConfirmState] = useState({
    open: false,
    user: null,
    action: null,
    loading: false,
  });

  const activeFilterCount = useMemo(
    () => Object.values(filter).filter(Boolean).length + (searchUser ? 1 : 0),
    [filter, searchUser]
  );

  const fetchUsers = async () => {
    try {
      const res = await getAllUserProfile(currentPage, PAGE_SIZE, {
        nameOrEmail: (searchUser || '').trim(),
        role: filter.role || null,
        isActive: uiStatusToBoolean(filter.status),
        isConfirm: uiConfirmToBoolean(filter.confirm),
        fromDate: toIsoStart(filter.fromDate),
        toDate: toIsoEnd(filter.toDate),
      });

      const { count, data: profiles } = res.data;
      const mapped = profiles.map((u, idx) => {
        const { shortName, fullName } = getShortName(u.firstName, u.lastName);
        return {
          no: (currentPage - 1) * PAGE_SIZE + idx + 1,
          id: u.id,
          name: shortName,
          fullName,
          email: u.email,
          gender: u.gender,
          status: mapIsActive(u.isActive),
          confirm: mapIsConfirm(u.isConfirm),
          date: u.createdAt,
          rawDate: u.createdAt,
          role: u.role,
        };
      });
      setRows(mapped);
      setTotalPages(Math.ceil((count || 0) / PAGE_SIZE));
    } catch (err) {
      console.error('Lỗi khi lấy danh sách người dùng:', err);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchUser]);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, filter, searchUser]);

  const openConfirm = row => {
    const action = row.status === 'Đang hoạt động' ? 'lock' : 'unlock';
    setConfirmState({ open: true, user: row, action, loading: false });
  };

  const handleLockUser = async row => {
    try {
      await lockUserById(row.id);
      toast.success(`Đã khoá tài khoản ${row.fullName || row.email}`);
      fetchUsers();
    } catch (e) {
      console.error('Lỗi khi khoá tài khoản:', e);
      toast.error('Không thể khoá tài khoản. Vui lòng thử lại.');
    }
  };

  const handleUnlockUser = async row => {
    try {
      await unlockUserById(row.id);
      toast.success(`Đã mở khoá tài khoản ${row.fullName || row.email}`);
      fetchUsers();
    } catch (e) {
      console.error('Lỗi khi mở khoá tài khoản:', e);
      toast.error('Không thể mở khoá tài khoản. Vui lòng thử lại.');
    }
  };

  const confirmLockUnlock = async () => {
    const { user, action } = confirmState;
    if (!user || !action) return;
    try {
      setConfirmState(s => ({ ...s, loading: true }));
      if (action === 'lock') await handleLockUser(user);
      else await handleUnlockUser(user);
    } finally {
      setConfirmState({
        open: false,
        user: null,
        action: null,
        loading: false,
      });
    }
  };

  const columns = [
    { header: 'STT', accessor: 'no' },
    {
      header: 'Họ và Tên',
      accessor: 'name',
      render: (value, row) => (
        <div className='max-w-[120px] truncate' title={row.fullName}>
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
      render: v => <StatusBadge status={v} />,
    },
    {
      header: 'Trạng thái',
      accessor: 'status',
      render: v => <StatusBadge status={v} />,
    },
    { header: 'Ngày tạo', accessor: 'date', render: v => formatDateTime(v) },
    { header: 'Vai trò', accessor: 'role' },
  ];

  const handleView = row => navigate(`/admin/users/${row.id}`);

  return (
    <>
      <ReusableTable
        title='Danh sách người dùng'
        columns={columns}
        data={rows}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={page => setCurrentPage(page)}
        actions={{ toggleLock: openConfirm, view: handleView }}
        actionIcons={{
          toggleLock: row =>
            row.status === 'Đang hoạt động' ? 'lock' : 'unlock',
          view: 'view',
        }}
        disableActions={{ toggleLock: row => row.role === 'Admin' }}
        headerRight={
          <div className='flex gap-2 items-center relative'>
            <SearchInput
              placeholder='Tìm kiếm theo tên hoặc email...'
              value={searchUser}
              onChange={e => setSearchUser(e.target.value)}
            />
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

            {showFilterModal && (
              <div className='absolute top-full right-0 mt-2 bg-white border shadow-lg rounded-lg w-72 p-4 z-50'>
                <div className='flex justify-between items-center mb-3'>
                  <h3 className='text-sm font-semibold'>Bộ lọc người dùng</h3>
                  <button onClick={() => setShowFilterModal(false)}>
                    <MdOutlineClear />
                  </button>
                </div>

                <div className='space-y-3 text-sm'>
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

      <ConfirmModal
        visible={confirmState.open}
        title={
          confirmState.action === 'lock'
            ? 'Khoá tài khoản'
            : 'Mở khoá tài khoản'
        }
        onClose={() =>
          setConfirmState({
            open: false,
            user: null,
            action: null,
            loading: false,
          })
        }
      >
        <p className='mb-6 text-gray-700'>
          {confirmState.action === 'lock'
            ? 'Bạn có chắc chắn muốn khoá tài khoản '
            : 'Bạn có chắc chắn muốn mở khoá tài khoản '}
          <b>{confirmState.user?.fullName || confirmState.user?.email}</b>?
        </p>
        <div className='flex justify-end gap-2'>
          <button
            onClick={() =>
              setConfirmState({
                open: false,
                user: null,
                action: null,
                loading: false,
              })
            }
            className='px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100'
            disabled={confirmState.loading}
          >
            Hủy
          </button>
          <PrimaryButton
            onClick={confirmLockUnlock}
            className='px-4 py-2 rounded-md text-white'
            disabled={confirmState.loading}
          >
            {confirmState.loading ? 'Đang xử lý...' : 'Xác nhận'}
          </PrimaryButton>
        </div>
      </ConfirmModal>
    </>
  );
};

export default ListUser;
