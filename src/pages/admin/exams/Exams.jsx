import ReusableTable from '@/components/table/ReusableTable';
import ConfirmModal from '@/components/ui/ConfirmModal';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { getAllExams, updateStatusExam } from '@/services/examService';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaPlus, FaArrowAltCircleUp, FaUndo, FaTrashAlt } from 'react-icons/fa';
import SearchInput from '@/components/ui/SearchInput';
import TabDropdown from '@/components/ui/TabDropdown';

const STATUS_LABELS = {
  Draft: 'Nháp',
  AIDraft: 'Nháp (AI)',
  Approved: 'Đã duyệt',
  Removed: 'Đã xóa',
};

const STATUS_TO_NUM = { Draft: 0, AIDraft: 1, Approved: 2, Removed: 3 };
const NUM_TO_STATUS = Object.fromEntries(
  Object.entries(STATUS_TO_NUM).map(([k, v]) => [v, k])
);

const YEARS = ['2022', '2023', '2024', '2025'];

const Exams = () => {
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    exam: null,
  });

  const [filter, setFilter] = useState({
    level: '',
    type: '',
    grade: '',
    fromDate: '',
    toDate: '',
    year: '',
    randomizeQuestions: '',
    status: '',
  });

  const [openYear, setOpenYear] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [openGrade, setOpenGrade] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  const fetchExams = async () => {
    setIsLoading(true);
    try {
      const statusKey = filter.status ? STATUS_TO_NUM[filter.status] : null;

      const baseParams = {
        pageIndex: currentPage,
        pageSize: 10,
        Grade: filter.grade ? [filter.grade] : [],
        Year: filter.year ? [filter.year] : [],
        Search: searchTerm || '',
      };

      const params = { ...baseParams };
      if (statusKey !== null) {
        params.Status = [statusKey];
        params.Statuses = [statusKey];
        params.status = statusKey;
      }

      const res = await getAllExams(params);

      const payload = res?.data ?? {};
      const top = Array.isArray(payload?.data) ? payload : payload?.data ?? {};
      const list = Array.isArray(top?.data)
        ? top.data
        : Array.isArray(payload?.data?.data)
        ? payload.data.data
        : [];
      const countFromServer = Number(
        top?.count ?? payload?.data?.count ?? list.length ?? 0
      );
      const apiPageIndex = Number(top?.pageIndex ?? currentPage);

      const addNo = arr =>
        arr.map((item, idx) => ({
          ...item,
          no: (apiPageIndex - 1) * 10 + idx + 1,
        }));

      let filtered = list;
      if (filter.randomizeQuestions) {
        filtered = filtered.filter(
          e => e.randomizeQuestions === (filter.randomizeQuestions === 'true')
        );
      }
      if (statusKey !== null) {
        filtered = filtered.filter(
          e =>
            e.status === statusKey ||
            (e.statusName && STATUS_TO_NUM[e.statusName] === statusKey)
        );
      }

      if (statusKey !== null && filtered.length === 0) {
        const resAll = await getAllExams({
          ...baseParams,
          pageIndex: 1,
          pageSize: 1000,
        });
        const payloadAll = resAll?.data ?? {};
        const topAll = Array.isArray(payloadAll?.data)
          ? payloadAll
          : payloadAll?.data ?? {};
        const listAll = Array.isArray(topAll?.data)
          ? topAll.data
          : Array.isArray(payloadAll?.data?.data)
          ? payloadAll.data.data
          : [];

        const filteredAll = listAll
          .filter(
            e =>
              e.status === statusKey ||
              (e.statusName && STATUS_TO_NUM[e.statusName] === statusKey)
          )
          .filter(
            e =>
              !filter.randomizeQuestions ||
              e.randomizeQuestions === (filter.randomizeQuestions === 'true')
          );

        const total = filteredAll.length;
        const start = (currentPage - 1) * 10;
        const pageSlice = filteredAll.slice(start, start + 10);

        setExams(addNo(pageSlice));
        const newTotalPages = Math.max(1, Math.ceil(total / 10));
        setTotalPages(newTotalPages);
        if (currentPage > newTotalPages) setCurrentPage(1);
        return;
      }

      setExams(addNo(filtered));
      const effectiveCount =
        statusKey !== null || filter.randomizeQuestions
          ? filtered.length
          : countFromServer;
      const newTotalPages = Math.max(1, Math.ceil(effectiveCount / 10));
      setTotalPages(newTotalPages);
      if (currentPage > newTotalPages) setCurrentPage(1);
    } catch (err) {
      console.error('Lỗi khi gọi API getAllExams:', err?.response?.data || err);
      toast.error('Không tải được danh sách đề thi');
      setExams([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [currentPage, searchTerm, filter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm]);

  const idsOnPage = useMemo(() => new Set(exams.map(e => e.id)), [exams]);
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

  const columns = [
    { header: 'Mã đề thi', accessor: 'examCode' },
    {
      header: 'Tên đề thi',
      accessor: 'title',
      render: value => (
        <div className='max-w-[200px] truncate' title={value}>
          {value}
        </div>
      ),
    },
    {
      header: 'Miêu tả',
      accessor: 'description',
      render: value => (
        <div className='max-w-[150px] truncate' title={value}>
          {value}
        </div>
      ),
    },
    { header: 'Lớp', accessor: 'grade' },
    { header: 'Số câu', accessor: 'totalQuestionCount' },
    { header: 'Số phiên bản', accessor: 'versionCount' },
    {
      header: 'Trạng thái',
      accessor: 'statusName',
      render: (value, row) =>
        STATUS_LABELS[row.statusName] || row.statusName || '—',
    },
  ];

  // Ẩn cột "Lớp" nếu đã chọn khối lớp
  const effectiveColumns = filter.grade
    ? columns.filter(c => c.accessor !== 'grade')
    : columns;

  const handleView = row => {
    navigate(`/admin/exams-category/exams/${row.id}/exam-detail`);
  };

  //Actions đơn l
  const applyStatusLocal = (ids, nextName) => {
    setExams(prev =>
      prev.map(x =>
        ids.includes(x.id)
          ? { ...x, statusName: nextName, status: STATUS_TO_NUM[nextName] }
          : x
      )
    );
  };

  const handleApprove = async row => {
    if (row.statusName === 'Approved') return;
    const nextStatusName = row.statusName === 'Removed' ? 'Draft' : 'Approved';
    const nextStatus = STATUS_TO_NUM[nextStatusName];

    try {
      applyStatusLocal([row.id], nextStatusName);
      await updateStatusExam(row.id, nextStatus);
      toast.success(
        nextStatusName === 'Approved'
          ? 'Đã chuyển sang Đã duyệt'
          : 'Đã chuyển về Nháp'
      );
      fetchExams();
    } catch (e) {
      applyStatusLocal([row.id], row.statusName);
      console.error(
        'PATCH /api/exams/{id}/status approve error:',
        e?.response?.data || e
      );
      toast.error('Cập nhật trạng thái thất bại');
    }
  };

  const handleDeleteExam = exam => setDeleteModal({ open: true, exam });

  const confirmDeleteExam = async () => {
    const exam = deleteModal.exam;
    try {
      applyStatusLocal([exam.id], 'Removed');
      await updateStatusExam(exam.id, STATUS_TO_NUM.Removed);
      toast.success('Đã chuyển sang trạng thái Đã xoá');
      setDeleteModal({ open: false, exam: null });
      fetchExams();
    } catch (e) {
      applyStatusLocal([exam.id], exam.statusName);
      console.error(
        'PATCH /api/exams/{id}/status remove error:',
        e?.response?.data || e
      );
      toast.error('Cập nhật trạng thái thất bại');
    }
  };

  // Actions hàng loạt
  const runBulk = async (ids, status, successMsg) => {
    if (!ids.length) return;

    setBulkLoading(true);
    try {
      await Promise.all(ids.map(id => updateStatusExam(id, status)));
      toast.success(successMsg);
      setSelectedIds([]);
      fetchExams();
    } catch (e) {
      toast.warn('Không thể cập nhật trạng thái đề thi đã chọn.');
      console.error(e);
      fetchExams();
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkApprove = async () => {
    // chỉ duyệt những exam đang Draft/AIDraft
    const ids = sanitizeIds(selectedIds)
      .map(id => exams.find(e => e.id === id))
      .filter(e => e && ['Draft', 'AIDraft'].includes(e.statusName))
      .map(e => e.id);

    if (ids.length === 0) {
      toast.info('Không có đề thi ở trạng thái Nháp/Nháp (AI) để duyệt.');
      return;
    }

    applyStatusLocal(ids, 'Approved');
    await runBulk(ids, STATUS_TO_NUM.Approved, 'Đã duyệt các đề thi đã chọn.');
  };

  const handleBulkRestore = async () => {
    // chỉ khôi phục những exam đang Removed
    const ids = sanitizeIds(selectedIds)
      .map(id => exams.find(e => e.id === id))
      .filter(e => e && e.statusName === 'Removed')
      .map(e => e.id);

    if (ids.length === 0) {
      toast.info('Không có đề thi ở trạng thái Đã xóa để khôi phục.');
      return;
    }

    applyStatusLocal(ids, 'Draft');
    await runBulk(ids, STATUS_TO_NUM.Draft, 'Đã khôi phục về Nháp.');
  };

  const handleBulkRemove = async () => {
    const ids = sanitizeIds(selectedIds);
    if (ids.length === 0) {
      toast.info('Chưa có đề thi nào được chọn.');
      return;
    }

    applyStatusLocal(ids, 'Removed');
    await runBulk(
      ids,
      STATUS_TO_NUM.Removed,
      'Đã chuyển sang trạng thái Đã xóa.'
    );
  };

  /**
   * ===== Soft-block logic =====
   * Cho phép chọn lẫn, nhưng hiển thị banner lỗi ngay khi có nhiều trạng thái trong selection
   * và disable toàn bộ nút hành động hàng loạt.
   */
  const selectedRows = useMemo(
    () =>
      sanitizeIds(selectedIds)
        .map(id => exams.find(e => e.id === id))
        .filter(Boolean),
    [selectedIds, exams]
  );

  const mixedStatus = useMemo(() => {
    const set = new Set(selectedRows.map(r => r.statusName));
    return set.size > 1; // true nếu có nhiều hơn 1 trạng thái trong selection
  }, [selectedRows]);

  return (
    <div className='p-4 space-y-6'>
      <div className='flex justify-between items-center mb-5'>
        <h2 className='text-2xl font-bold'>Danh sách đề thi</h2>
        <div className='flex gap-3'>
          <PrimaryButton
            onClick={() => navigate('/admin/exams-category/exams/create')}
            className='bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 shadow-md transition-all duration-200'
          >
            <FaPlus /> Thêm đề thi thủ công
          </PrimaryButton>
          <PrimaryButton
            onClick={() => navigate('/admin/exams-category/exams/create-auto')}
            className='font-semibold py-2 px-4 rounded-lg flex items-center gap-2'
          >
            <FaPlus /> Thêm đề thi tự động
          </PrimaryButton>
        </div>
      </div>

      {/* Banner cảnh báo khi chọn lẫn trạng thái */}
      {selectedOnPageCount > 0 && mixedStatus && (
        <div className='mb-2 px-3 py-2 rounded border border-red-200 bg-red-50 text-red-700'>
          Bạn đã chọn các đề thi có <b>trạng thái khác nhau</b>. Vui lòng chỉ
          chọn các đề cùng trạng thái để thực hiện hành động hàng loạt.
        </div>
      )}

      {/* Thanh thao tác hàng loạt */}
      {selectedOnPageCount > 0 && (
        <div className='mb-3 px-3 py-2 flex items-center gap-3'>
          <span>
            Đã chọn <b>{selectedOnPageCount}</b> đề thi trên trang.
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
              disabled={bulkLoading || mixedStatus}
              className='px-3 py-1.5 rounded flex items-center gap-2 
                         bg-green-500 hover:bg-green-600 text-white shadow-sm 
                         disabled:opacity-60 disabled:cursor-not-allowed'
              title={
                mixedStatus
                  ? 'Không thể thao tác khi chọn lẫn trạng thái'
                  : 'Duyệt'
              }
            >
              <FaArrowAltCircleUp />
              <span>Duyệt</span>
            </button>

            {/* RESTORE */}
            <button
              title={
                mixedStatus
                  ? 'Không thể thao tác khi chọn lẫn trạng thái'
                  : 'Khôi phục (Đã xóa → Nháp)'
              }
              onClick={handleBulkRestore}
              disabled={bulkLoading || mixedStatus}
              className='px-3 py-1.5 rounded flex items-center gap-2 
                         bg-blue-500 hover:bg-blue-600 text-white shadow-sm 
                         disabled:opacity-60 disabled:cursor-not-allowed'
            >
              <FaUndo />
              <span>Khôi phục</span>
            </button>

            {/* DELETE */}
            <button
              title={
                mixedStatus
                  ? 'Không thể thao tác khi chọn lẫn trạng thái'
                  : 'Đánh dấu Đã xóa'
              }
              onClick={handleBulkRemove}
              disabled={bulkLoading || mixedStatus}
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
            {/* Khối lớp */}
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
        data={exams}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={page => setCurrentPage(page)}
        actions={{
          view: handleView,
          approve: handleApprove,
          delete: handleDeleteExam,
        }}
        actionIcons={{
          view: 'view',
          approve: 'approve',
          delete: 'delete',
        }}
        disableActions={{
          approve: row =>
            row?.canEdit === false ||
            !['Draft', 'AIDraft', 'Removed'].includes(row?.statusName),
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
              placeholder='Tìm kiếm đề thi...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        }
      />

      <ConfirmModal
        visible={deleteModal.open}
        title='Xoá đề thi'
        onClose={() => setDeleteModal({ open: false, exam: null })}
      >
        <p className='mb-6 text-gray-700'>
          Bạn có chắc chắn muốn xoá đề thi này không?
        </p>
        <div className='flex justify-end gap-2'>
          <button
            onClick={() => setDeleteModal({ open: false, exam: null })}
            className='px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100'
          >
            Hủy
          </button>
          <PrimaryButton
            onClick={confirmDeleteExam}
            className='px-4 py-2 rounded-md text-white bg-red-500 hover:bg-red-600'
          >
            Xoá
          </PrimaryButton>
        </div>
      </ConfirmModal>
    </div>
  );
};

export default Exams;
