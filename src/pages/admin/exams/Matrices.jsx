import ReusableTable from '@/components/table/ReusableTable';
import ConfirmModal from '@/components/ui/ConfirmModal';
import PrimaryButton from '@/components/ui/PrimaryButton';
import SearchInput from '@/components/ui/SearchInput';
import { FaPlus } from 'react-icons/fa';
import { getAllMatrices, updateStatusMatrix } from '@/services/matrixService';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import TabDropdown from '@/components/ui/TabDropdown';

const PAGE_SIZE = 10;

function useDebouncedValue(value, delay = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

const STATUS_LABELS = {
  Draft: 'Nháp',
  AIDraft: 'Nháp (AI)',
  Approved: 'Đã duyệt',
  Removed: 'Đã xóa',
};
const STATUS_TO_NUM = { Draft: 0, AIDraft: 1, Approved: 2, Removed: 3 };
const NUM_TO_STATUS = { 0: 'Draft', 1: 'AIDraft', 2: 'Approved', 3: 'Removed' };
const YEARS = ['2022', '2023', '2024', '2025'];

const Matrices = () => {
  const navigate = useNavigate();

  const [matrices, setMatrices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filter, setFilter] = useState({
    grade: '',
    year: '',
    subjectId: '',
    status: '',
  });

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedValue(searchTerm, 400);

  const [deleteModal, setDeleteModal] = useState({ open: false, matrix: null });
  const [openStatus, setOpenStatus] = useState(false);
  const [openGrade, setOpenGrade] = useState(false);
  const [openYear, setOpenYear] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const statusNameOf = row =>
    NUM_TO_STATUS?.[row?.status] || row?.statusName || '';

  const fetchMatrices = async () => {
    setIsLoading(true);
    try {
      const res = await getAllMatrices({
        pageIndex: currentPage,
        pageSize: PAGE_SIZE,
        Grade: filter.grade ? [Number(filter.grade)] : undefined,
        Year: filter.year ? [Number(filter.year)] : undefined,
        SubjectId: filter.subjectId || undefined,
        Search: debouncedSearch || undefined,
        Status: filter.status ? [STATUS_TO_NUM[filter.status]] : undefined,
      });

      const raw = res.data;
      const list = Array.isArray(raw?.data?.data) ? raw.data.data : [];
      const count = Number(raw?.data?.count || 0);

      const formatted = list.map((item, index) => ({
        ...item,
        no: (currentPage - 1) * PAGE_SIZE + index + 1,
      }));

      let dataForUI = formatted;
      if (filter.status && formatted.length) {
        dataForUI = formatted.filter(it => {
          const name = NUM_TO_STATUS?.[it.status] || it.statusName;
          return name === filter.status;
        });
      }

      setMatrices(dataForUI);
      setTotalPages(
        Math.max(
          1,
          Math.ceil((filter.status ? dataForUI.length : count) / PAGE_SIZE)
        )
      );
    } catch (error) {
      console.error('Lỗi khi lấy ma trận:', error);
      toast.error('Không tải được danh sách ma trận');
      setMatrices([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatrices();
  }, [
    currentPage,
    debouncedSearch,
    filter.grade,
    filter.year,
    filter.subjectId,
    filter.status,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    debouncedSearch,
    filter.grade,
    filter.year,
    filter.subjectId,
    filter.status,
  ]);

  const columns = [
    { header: 'Mã ma trận', accessor: 'matrixCode' },
    {
      header: 'Tên ma trận',
      accessor: 'name',
      render: value => (
        <div className='max-w-[180px] truncate' title={value}>
          {value}
        </div>
      ),
    },
    {
      header: 'Miêu tả',
      accessor: 'description',
      render: value => (
        <div className='max-w-[220px] truncate' title={value}>
          {value}
        </div>
      ),
    },
    { header: 'Lớp', accessor: 'grade' },
    { header: 'Năm', accessor: 'year' },
    { header: 'Số câu', accessor: 'totalQuestionCount' },
    {
      header: 'Trạng thái',
      accessor: 'statusName',
      render: (_, row) => {
        const name = statusNameOf(row);
        return STATUS_LABELS[name] || name || '—';
      },
    },
  ];

  // Ẩn cột "Lớp" nếu đã chọn khối lớp
  const effectiveColumns = filter.grade
    ? columns.filter(c => c.accessor !== 'grade')
    : columns;

  const handleView = row =>
    navigate(`/admin/exams-category/matrices/${row.id}`);
  const handleEdit = row =>
    navigate(`/admin/exams-category/matrices/${row.id}/edit`);

  const handleApprove = async row => {
    // Lấy trạng thái hiện tại theo số (ưu tiên)
    const currStatus = Number.isInteger(row.status)
      ? row.status
      : STATUS_TO_NUM[row.statusName] ?? STATUS_TO_NUM.Draft;

    if (currStatus === STATUS_TO_NUM.Approved) return;

    const nextStatus =
      currStatus === STATUS_TO_NUM.Removed
        ? STATUS_TO_NUM.Draft
        : STATUS_TO_NUM.Approved;
    const nextStatusName = NUM_TO_STATUS[nextStatus];

    try {
      // optimistic UI: cập nhật cả status & statusName
      setMatrices(prev =>
        prev.map(x =>
          x.id === row.id
            ? { ...x, status: nextStatus, statusName: nextStatusName }
            : x
        )
      );

      await updateStatusMatrix(row.id, nextStatus);

      toast.success(
        nextStatus === STATUS_TO_NUM.Approved
          ? 'Đã chuyển sang Đã duyệt'
          : 'Đã chuyển về Nháp'
      );
      fetchMatrices();
    } catch (e) {
      // rollback
      setMatrices(prev =>
        prev.map(x =>
          x.id === row.id
            ? { ...x, status: currStatus, statusName: statusNameOf(row) }
            : x
        )
      );
      toast.error('Cập nhật trạng thái thất bại');
    }
  };

  const handleToggleRow = (id, checked) => {
    setSelectedIds(prev =>
      checked ? Array.from(new Set([...prev, id])) : prev.filter(x => x !== id)
    );
  };

  const handleToggleAll = (checked, pageRowIds) => {
    setSelectedIds(prev =>
      checked
        ? Array.from(new Set([...prev, ...pageRowIds]))
        : prev.filter(id => !pageRowIds.includes(id))
    );
  };

  const handleDeleteMatrix = matrix => setDeleteModal({ open: true, matrix });

  const confirmDeleteMatrix = async () => {
    const id = deleteModal.matrix.id;
    try {
      setMatrices(prev =>
        prev.map(x =>
          x.id === id
            ? { ...x, status: STATUS_TO_NUM.Removed, statusName: 'Removed' }
            : x
        )
      );

      await updateStatusMatrix(id, STATUS_TO_NUM.Removed);

      toast.success('Đã chuyển ma trận sang trạng thái Đã xoá');
      setDeleteModal({ open: false, matrix: null });
      fetchMatrices();
    } catch (error) {
      console.error('Lỗi khi xoá ma trận:', error);
      toast.error('Cập nhật trạng thái thất bại');
    }
  };

  return (
    <div className='p-4 space-y-6'>
      <div className='flex justify-between items-center mb-5'>
        <h2 className='text-2xl font-bold'>Danh sách ma trận đề thi</h2>
        <PrimaryButton
          onClick={() => navigate('/admin/exams-category/matrices/create')}
          className='bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition duration-200'
        >
          <FaPlus /> Tải lên ma trận
        </PrimaryButton>
      </div>

      <ReusableTable
        headerLeft={
          <div className='flex items-center gap-3 flex-wrap'>
            {/* Lớp */}
            <TabDropdown
              label='Khối lớp'
              valueLabel={filter.grade ? `Lớp ${filter.grade}` : ''}
              open={openGrade}
              setOpen={setOpenGrade}
            >
              {['', '10', '11', '12'].map(g => (
                <button
                  key={g || 'all'}
                  onClick={() => {
                    setFilter(f => ({ ...f, grade: g }));
                    setOpenGrade(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 ${
                    (filter.grade || '') === g ? 'bg-gray-50 font-medium' : ''
                  }`}
                >
                  {g ? `Lớp ${g}` : 'Tất cả'}
                </button>
              ))}
            </TabDropdown>

            {/* Năm */}
            <TabDropdown
              label='Năm học'
              valueLabel={filter.year ? filter.year : ''}
              open={openYear}
              setOpen={setOpenYear}
            >
              {['', ...YEARS].map(y => (
                <button
                  key={y || 'all'}
                  onClick={() => {
                    setFilter(f => ({ ...f, year: y }));
                    setOpenYear(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 ${
                    (filter.year || '') === y ? 'bg-gray-50 font-medium' : ''
                  }`}
                >
                  {y || 'Tất cả'}
                </button>
              ))}
            </TabDropdown>

            {/* Trạng thái */}
            <TabDropdown
              label='Trạng thái'
              valueLabel={filter.status ? STATUS_LABELS[filter.status] : ''}
              open={openStatus}
              setOpen={setOpenStatus}
            >
              {[{ k: '', t: 'Tất cả' }]
                .concat(
                  Object.keys(STATUS_LABELS).map(k => ({
                    k,
                    t: STATUS_LABELS[k],
                  }))
                )
                .map(o => (
                  <button
                    key={o.k || 'all'}
                    onClick={() => {
                      setFilter(f => ({ ...f, status: o.k }));
                      setOpenStatus(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 ${
                      (filter.status || '') === o.k
                        ? 'bg-gray-50 font-medium'
                        : ''
                    }`}
                  >
                    {o.t}
                  </button>
                ))}
            </TabDropdown>
          </div>
        }
        columns={effectiveColumns}
        data={matrices}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={page => setCurrentPage(page)}
        actions={{
          view: handleView,
          edit: handleEdit,
          approve: handleApprove,
          delete: handleDeleteMatrix,
        }}
        actionIcons={{
          view: 'view',
          edit: 'edit',
          approve: 'approve',
          delete: 'delete',
        }}
        disableActions={{
          approve: row => {
            const name = statusNameOf(row);
            return (
              row?.canEdit === false ||
              !['Draft', 'AIDraft', 'Removed'].includes(name)
            );
          },
        }}
        selectable
        selectedKeys={selectedIds}
        onToggleRow={handleToggleRow}
        onToggleAll={handleToggleAll}
        getRowId={row => row.id}
        headerRight={
          <div className='flex gap-2 items-center relative'>
            <SearchInput
              placeholder='Tìm kiếm ma trận...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        }
      />

      <ConfirmModal
        visible={deleteModal.open}
        title='Xoá ma trận'
        onClose={() => setDeleteModal({ open: false, matrix: null })}
      >
        <p className='mb-6 text-gray-700'>
          Bạn có chắc chắn muốn xoá ma trận này không?
        </p>
        <div className='flex justify-end gap-2'>
          <button
            onClick={() => setDeleteModal({ open: false, matrix: null })}
            className='px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100'
          >
            Hủy
          </button>
          <PrimaryButton
            onClick={confirmDeleteMatrix}
            className='px-4 py-2 rounded-md text-white bg-red-500 hover:bg-red-600'
          >
            Xoá
          </PrimaryButton>
        </div>
      </ConfirmModal>
    </div>
  );
};

export default Matrices;
