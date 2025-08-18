import ReusableTable from '@/components/table/ReusableTable';
import ConfirmModal from '@/components/ui/ConfirmModal';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { getAllExams, updateStatusExam } from '@/services/examService';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaPlus } from 'react-icons/fa';
import SearchInput from '@/components/ui/SearchInput';
import TabDropdown from '@/components/ui/TabDropdown';

const STATUS_LABELS = {
  Draft: 'Nháp',
  AIDraft: 'Nháp (AI)',
  Approved: 'Đã duyệt',
  Removed: 'Đã xóa',
};

const STATUS_TO_NUM = { Draft: 0, AIDraft: 1, Approved: 2, Removed: 3 };

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

  const fetchExams = async () => {
    setIsLoading(true);
    try {
      const statusKey = filter.status ? STATUS_TO_NUM[filter.status] : null;

      const baseParams = {
        pageIndex: currentPage, // 1-based
        pageSize: 10,
        Grade: filter.grade ? [filter.grade] : [],
        Year: filter.year ? [filter.year] : [],
        Search: searchTerm || '',
      };

      // gửi nhiều biến thể cho chắc
      const params = { ...baseParams };
      if (statusKey !== null) {
        params.Status = [statusKey];
        params.Statuses = [statusKey];
        params.status = statusKey;
      }

      const res = await getAllExams(params);

      // chuẩn hoá mọi shape response
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

      // nếu đang lọc status, thử lọc client từ list hiện tại
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

      // Fallback: nếu đang lọc status nhưng trang hiện tại rỗng -> fetch lần nữa không truyền Status và lọc client
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

      // bình thường: dùng dữ liệu server (đã/tạm lọc)
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

  const handleApprove = async row => {
    if (row.statusName === 'Approved') return;

    const nextStatusName = row.statusName === 'Removed' ? 'Draft' : 'Approved';
    const nextStatus = STATUS_TO_NUM[nextStatusName];

    try {
      // optimistic UI
      setExams(prev =>
        prev.map(x =>
          x.id === row.id ? { ...x, statusName: nextStatusName } : x
        )
      );

      await updateStatusExam(row.id, nextStatus);

      toast.success(
        nextStatusName === 'Approved'
          ? 'Đã chuyển sang Đã duyệt'
          : 'Đã chuyển về Nháp'
      );
      fetchExams();
    } catch (e) {
      // rollback
      setExams(prev =>
        prev.map(x =>
          x.id === row.id ? { ...x, statusName: row.statusName } : x
        )
      );
      console.error(
        'PATCH /api/exams/{id}/status approve error:',
        e?.response?.data || e
      );
      toast.error('Cập nhật trạng thái thất bại');
    }
  };

  const handleDeleteExam = exam => {
    setDeleteModal({ open: true, exam });
  };

  const confirmDeleteExam = async () => {
    const exam = deleteModal.exam;
    try {
      // optimistic UI
      setExams(prev =>
        prev.map(x => (x.id === exam.id ? { ...x, statusName: 'Removed' } : x))
      );

      await updateStatusExam(exam.id, STATUS_TO_NUM.Removed);

      toast.success('Đã chuyển sang trạng thái Đã xoá');
      setDeleteModal({ open: false, exam: null });
      fetchExams();
    } catch (e) {
      // rollback
      setExams(prev =>
        prev.map(x =>
          x.id === exam.id ? { ...x, statusName: exam.statusName } : x
        )
      );
      console.error(
        'PATCH /api/exams/{id}/status remove error:',
        e?.response?.data || e
      );
      toast.error('Cập nhật trạng thái thất bại');
    }
  };

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
