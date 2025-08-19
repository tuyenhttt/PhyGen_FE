import ReusableTable from '@/components/table/ReusableTable';
import ConfirmModal from '@/components/ui/ConfirmModal';
import PrimaryButton from '@/components/ui/PrimaryButton';
import SearchInput from '@/components/ui/SearchInput';
import { FaPlus, FaArrowAltCircleUp, FaUndo, FaTrashAlt } from 'react-icons/fa';
import { getAllMatrices, updateStatusMatrix } from '@/services/matrixService';
import { useEffect, useMemo, useState } from 'react';
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
  const [bulkLoading, setBulkLoading] = useState(false);

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

  const effectiveColumns = filter.grade
    ? columns.filter(c => c.accessor !== 'grade')
    : columns;

  const handleView = row =>
    navigate(`/admin/exams-category/matrices/${row.id}`);

  // chọn theo trang & sạch id
  const idsOnPage = useMemo(() => new Set(matrices.map(m => m.id)), [matrices]);
  const sanitizeIds = ids =>
    Array.from(new Set(ids)).filter(id => idsOnPage.has(id));

  const selectedOnPageCount = selectedIds.filter(id =>
    idsOnPage.has(id)
  ).length;

  const handleToggleRow = (id, checked) => {
    setSelectedIds(prev => {
      const next = checked ? [...prev, id] : prev.filter(x => x !== id);
      return sanitizeIds(next);
    });
  };

  const handleToggleAll = (checked, pageRowIds) => {
    setSelectedIds(prev => {
      const page = sanitizeIds(pageRowIds || []);
      return checked
        ? sanitizeIds([...prev, ...page])
        : prev.filter(id => !page.includes(id));
    });
  };

  // đổi trạng thái local nhanh
  const applyStatusLocal = (ids, nextName) => {
    setMatrices(prev =>
      prev.map(x =>
        ids.includes(x.id)
          ? {
              ...x,
              statusName: nextName,
              status: STATUS_TO_NUM[nextName],
            }
          : x
      )
    );
  };

  //actions đơn lẻ (dùng bulk endpoint với 1 id cho chắc)
  const handleApprove = async row => {
    const curr = Number.isInteger(row.status)
      ? row.status
      : STATUS_TO_NUM[row.statusName];
    if (curr === STATUS_TO_NUM.Approved) return;

    const next =
      curr === STATUS_TO_NUM.Removed
        ? STATUS_TO_NUM.Draft
        : STATUS_TO_NUM.Approved;
    const nextName = NUM_TO_STATUS[next];

    try {
      applyStatusLocal([row.id], nextName);
      await updateStatusMatrix(row.id, next);
      toast.success(
        next === STATUS_TO_NUM.Approved
          ? 'Đã chuyển sang Đã duyệt'
          : 'Đã chuyển về Nháp'
      );
      fetchMatrices();
    } catch (e) {
      applyStatusLocal([row.id], statusNameOf(row));
      toast.error('Cập nhật trạng thái thất bại');
    }
  };

  const handleDeleteMatrix = matrix => setDeleteModal({ open: true, matrix });

  const confirmDeleteMatrix = async () => {
    const id = deleteModal.matrix.id;
    try {
      applyStatusLocal([id], 'Removed');
      await updateStatusMatrix(id, STATUS_TO_NUM.Removed);
      toast.success('Đã chuyển ma trận sang trạng thái Đã xoá');
      setDeleteModal({ open: false, matrix: null });
      fetchMatrices();
    } catch (error) {
      applyStatusLocal([id], statusNameOf(deleteModal.matrix));
      console.error('Lỗi khi xoá ma trận:', error);
      toast.error('Cập nhật trạng thái thất bại');
    }
  };

  //actions hàng loạt
  const handleBulkApprove = async () => {
    const ids = sanitizeIds(selectedIds)
      .map(id => matrices.find(m => m.id === id))
      .filter(m => m && ['Draft', 'AIDraft'].includes(statusNameOf(m)))
      .map(m => m.id);

    if (!ids.length) {
      toast.info('Không có ma trận ở trạng thái Nháp/Nháp (AI) để duyệt.');
      return;
    }

    applyStatusLocal(ids, 'Approved');
    setBulkLoading(true);
    try {
      await updateStatusMatrix(ids, STATUS_TO_NUM.Approved);
      toast.success('Đã duyệt các ma trận đã chọn.');
      setSelectedIds([]);
      fetchMatrices();
    } catch (e) {
      toast.error('Duyệt hàng loạt thất bại');
      fetchMatrices();
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkRestore = async () => {
    const ids = sanitizeIds(selectedIds)
      .map(id => matrices.find(m => m.id === id))
      .filter(m => m && statusNameOf(m) === 'Removed')
      .map(m => m.id);

    if (!ids.length) {
      toast.info('Không có ma trận ở trạng thái Đã xóa để khôi phục.');
      return;
    }

    applyStatusLocal(ids, 'Draft');
    setBulkLoading(true);
    try {
      await updateStatusMatrix(ids, STATUS_TO_NUM.Draft);
      toast.success('Đã khôi phục về Nháp.');
      setSelectedIds([]);
      fetchMatrices();
    } catch (e) {
      toast.error('Khôi phục hàng loạt thất bại');
      fetchMatrices();
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkRemove = async () => {
    const ids = sanitizeIds(selectedIds);
    if (!ids.length) {
      toast.info('Chưa có ma trận nào được chọn.');
      return;
    }

    applyStatusLocal(ids, 'Removed');
    setBulkLoading(true);
    try {
      await updateStatusMatrix(ids, STATUS_TO_NUM.Removed);
      toast.success('Đã chuyển các ma trận sang Đã xóa.');
      setSelectedIds([]);
      fetchMatrices();
    } catch (e) {
      toast.error('Xóa hàng loạt thất bại');
      fetchMatrices();
    } finally {
      setBulkLoading(false);
    }
  };

  const selectedRows = useMemo(
    () =>
      sanitizeIds(selectedIds)
        .map(id => matrices.find(m => m.id === id))
        .filter(Boolean),
    [selectedIds, matrices]
  );
  const mixedStatus = useMemo(() => {
    const set = new Set(selectedRows.map(r => statusNameOf(r)));
    return set.size > 1;
  }, [selectedRows]);

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

      {selectedOnPageCount > 0 && mixedStatus && (
        <div className='mb-2 px-3 py-2 rounded border border-red-200 bg-red-50 text-red-700'>
          Bạn đã chọn các ma trận có <b>trạng thái khác nhau</b>. Vui lòng chỉ
          chọn các ma trận cùng trạng thái để thao tác.
        </div>
      )}

      {/* Thanh thao tác hàng loạt */}
      {selectedOnPageCount > 0 && (
        <div className='mb-3 px-3 py-2 flex items-center gap-3'>
          <span>
            Đã chọn <b>{selectedOnPageCount}</b> ma trận trên trang.
          </span>

          <button
            className='text-sm underline text-gray-500 font-bold hover:text-gray-700'
            onClick={() => setSelectedIds([])}
            disabled={bulkLoading}
          >
            Bỏ chọn
          </button>

          <div className='ml-auto flex items-center gap-2'>
            {/* APPROVE */}
            <button
              onClick={handleBulkApprove}
              disabled={bulkLoading}
              className='px-3 py-1.5 rounded flex items-center gap-2 
                         bg-green-500 hover:bg-green-600 text-white shadow-sm 
                         disabled:opacity-60 disabled:cursor-not-allowed'
            >
              <FaArrowAltCircleUp />
              <span>Duyệt</span>
            </button>

            {/* RESTORE */}
            <button
              title='Khôi phục (Removed → Draft)'
              onClick={handleBulkRestore}
              disabled={bulkLoading}
              className='px-3 py-1.5 rounded flex items-center gap-2 
                         bg-blue-500 hover:bg-blue-600 text-white shadow-sm 
                         disabled:opacity-60 disabled:cursor-not-allowed'
            >
              <FaUndo />
              <span>Khôi phục</span>
            </button>

            {/* DELETE */}
            <button
              title='Đánh dấu Đã xóa'
              onClick={handleBulkRemove}
              disabled={bulkLoading}
              className='px-3 py-1.5 rounded flex items-center gap-2 
                         bg-red-500 hover:bg-red-600 text-white shadow-sm 
                         disabled:opacity-60 disabled:cursor-not-allowed'
            >
              <FaTrashAlt />
              <span>Xóa</span>
            </button>
          </div>
        </div>
      )}

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
          approve: handleApprove,
          delete: handleDeleteMatrix,
        }}
        actionIcons={{
          view: 'view',
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
          delete: row => row?.statusName === 'Removed',
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
