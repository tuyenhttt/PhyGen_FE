import { useEffect, useState } from 'react';
import ReusableTable from '@/components/table/ReusableTable';
import { getAllQuestions, updateQuestion } from '@/services/questionService';
import SearchInput from '@/components/ui/SearchInput';
import { IoFilter } from 'react-icons/io5';
import { FaPlus } from 'react-icons/fa';
import { MdOutlineClear } from 'react-icons/md';
import QuestionDetailModal from '@/components/ui/QuestionDetailModal';
import AddQuestionModel from '@/components/ui/AddQuestionModel';
import ConfirmModal from '@/components/ui/ConfirmModal';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { toast } from 'react-toastify';
import { getTopic } from '@/services/topicService';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import TabDropdown from '@/components/ui/TabDropdown';

const Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState({
    level: '',
    type: '',
    grade: '',
    fromDate: '',
    toDate: '',
    status: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    question: null,
  });
  const [openGrade, setOpenGrade] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const STATUS_LABELS = {
    Draft: 'Nháp',
    AIDraft: 'Nháp (AI)',
    Approved: 'Đã duyệt',
    Removed: 'Đã xóa',
  };
  const LEVEL_TO_NUM = { Easy: 0, Medium: 1, Hard: 2 };
  const TYPE_TO_NUM = {
    MultipleChoice: 0,
    TrueFalse: 1,
    ShortAnswer: 2,
    Essay: 3,
  };
  const STATUS_TO_NUM = { Draft: 0, AIDraft: 1, Approved: 2, Removed: 3 };

  const itemsPerPage = 10;
  const activeFilterCount = Object.values(filter).filter(Boolean).length;

  const formatDate = dateStr =>
    dateStr ? new Date(dateStr).toISOString() : null;

  const fetchData = async () => {
    // helper: kiểm tra creator là Admin
    const isAdminCreator = q =>
      ['createdBy', 'createdByName', 'createdByRole'].some(
        k =>
          String(q?.[k] ?? '')
            .trim()
            .toLowerCase() === 'admin'
      );

    // helper: khớp trạng thái theo cả số lẫn tên (phòng backend trả kiểu nào)
    const matchesStatus = q => {
      if (!filter.status) return true;
      const wantName = filter.status; // 'Draft' | 'AIDraft' | 'Approved' | 'Removed'
      const wantNum = STATUS_TO_NUM[filter.status]; // 0|1|2|3
      const nameOk = String(q?.statusName ?? '').trim() === wantName;
      const numOk = Number(q?.status) === Number(wantNum);
      return nameOk || numOk;
    };

    try {
      const [questionsRes, topicsRes] = await Promise.all([
        getAllQuestions({
          pageIndex: currentPage,
          pageSize: itemsPerPage,
          search: searchTerm,
          level: filter.level,
          type: filter.type,
          grade: filter.grade ? Number(filter.grade) : '',
          fromDate: formatDate(filter.fromDate),
          toDate: formatDate(filter.toDate),

          // QUAN TRỌNG:
          // 1) chỉ lấy câu hỏi do Admin tạo
          createdBy: 'Admin',
          // 2) lọc trạng thái ở server (nếu backend nhận status số)
          status: filter.status ? STATUS_TO_NUM[filter.status] : '',
          // Nếu backend nhận theo tên thay vì số, đổi dòng trên thành:
          // statusName: filter.status || ''
        }),
        getTopic(),
      ]);

      const topicsData = Array.isArray(topicsRes.data)
        ? topicsRes.data
        : Array.isArray(topicsRes.data?.data)
        ? topicsRes.data.data
        : [];
      setTopics(topicsData);

      const result = questionsRes?.data?.data;
      const serverRows = Array.isArray(result?.data) ? result.data : [];
      const serverCount = Number(result?.count ?? 0);

      // Lọc chắc chắn trên client: chỉ Admin + đúng trạng thái
      const rows = serverRows.filter(isAdminCreator).filter(matchesStatus);

      const formatted = rows.map((q, i) => ({
        ...q,
        no: (currentPage - 1) * itemsPerPage + i + 1,
        levelName: q.levelName || '—',
        typeName: q.typeName || '—',
      }));

      setQuestions(formatted);

      // Tổng trang: nếu backend đã áp dụng filter -> serverCount dùng được,
      // nếu chưa thì fallback theo rows.length (ít nhất đúng trên trang hiện tại)
      const total = serverCount > 0 ? serverCount : rows.length;
      setTotalPages(Math.max(1, Math.ceil(total / itemsPerPage)));
    } catch (err) {
      console.error('Lỗi khi lấy dữ liệu:', err);
      setQuestions([]);
      setTopics([]);
      setTotalPages(1);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, searchTerm, filter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm]);

  const handleAddClick = () => setIsAddModalOpen(true);

  const handleView = row => {
    setSelectedQuestion(row);
    setEditMode(false);
    setIsViewModalOpen(true);
  };

  const handleEdit = row => {
    setSelectedQuestion(row);
    setEditMode(true);
    setIsViewModalOpen(true);
  };

  const handleDelete = question => setDeleteModal({ open: true, question });

  const confirmDeleteQuestion = async () => {
    const row = deleteModal.question;
    try {
      setQuestions(prev =>
        prev.map(q => (q.id === row.id ? { ...q, statusName: 'Removed' } : q))
      );

      const payload = buildUpdatePayload(row, {
        status: STATUS_TO_NUM.Removed,
      });
      await updateQuestion(payload);

      toast.success('Đã chuyển sang trạng thái Đã xóa');
      setDeleteModal({ open: false, question: null });
      fetchData();
    } catch (err) {
      setQuestions(prev =>
        prev.map(q =>
          q.id === row.id ? { ...q, statusName: row.statusName } : q
        )
      );
      console.error('Lỗi khi đổi trạng thái:', err);
      toast.error('Lỗi khi đổi trạng thái câu hỏi');
    }
  };

  const handleAddSave = () => {
    fetchData();
    setIsAddModalOpen(false);
  };

  const handleUpdateSuccess = async updatedData => {
    await fetchData();
    setSelectedQuestion(updatedData);
  };

  const handleUpdateSelectedQuestion = updatedData => {
    setSelectedQuestion(prev => ({ ...prev, ...updatedData }));
  };

  const buildUpdatePayload = (row, override = {}) => ({
    id: row.id,
    topicId: row.topicId ?? null,
    content: row.content ?? '',
    level:
      (Number.isInteger(row.level) ? row.level : LEVEL_TO_NUM[row.levelName]) ??
      0,
    type:
      (Number.isInteger(row.type) ? row.type : TYPE_TO_NUM[row.typeName]) ?? 0,
    answer1: row.answer1 ?? '',
    answer2: row.answer2 ?? '',
    answer3: row.answer3 ?? '',
    answer4: row.answer4 ?? '',
    answer5: row.answer5 ?? '',
    answer6: row.answer6 ?? '',
    grade: Number(row.grade) || 0,
    ...override,
  });

  const handleApprove = async row => {
    if (row?.canEdit === false) {
      toast?.warning?.('Bạn không thể duyệt câu hỏi do người khác tạo.');
      return;
    }

    const isRemoved = row?.statusName === 'Removed';
    const nextStatusName = isRemoved ? 'Draft' : 'Approved';
    const nextStatus = STATUS_TO_NUM[nextStatusName];

    if (!isRemoved && row?.statusName === 'Approved') {
      toast?.info?.('Câu hỏi đã ở trạng thái Đã duyệt.');
      return;
    }

    try {
      // cập nhật lạc quan
      setQuestions(prev =>
        prev.map(q =>
          q.id === row.id ? { ...q, statusName: nextStatusName } : q
        )
      );

      const payload = buildUpdatePayload(row, { status: nextStatus });
      await updateQuestion(payload);

      toast.success(isRemoved ? 'Đã chuyển về Nháp' : 'Đã duyệt câu hỏi');
      fetchData();
    } catch (e) {
      // rollback
      setQuestions(prev =>
        prev.map(q =>
          q.id === row.id ? { ...q, statusName: row.statusName } : q
        )
      );
      console.error(e);
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

  const columns = [
    { header: 'Mã câu hỏi', accessor: 'questionCode' },
    {
      header: 'Nội dung câu hỏi',
      accessor: 'content',
      render: value => (
        <MathJax dynamic>
          <div className='max-w-[280px] truncate' title={value}>
            {value}
          </div>
        </MathJax>
      ),
    },
    {
      header: 'Lớp',
      accessor: 'grade',
    },
    {
      header: 'Mức độ',
      accessor: 'levelName',
      render: v =>
        ({
          Easy: 'Nhận biết',
          Medium: 'Thông hiểu',
          Hard: 'Vận dụng',
        }[v] || 'Không rõ'),
    },
    {
      header: 'Loại',
      accessor: 'typeName',
      render: v =>
        ({
          MultipleChoice: 'Trắc nghiệm nhiều đáp án',
          TrueFalse: 'Trắc nghiệm Đúng/Sai',
          ShortAnswer: 'Câu hỏi trả lời ngắn',
          Essay: 'Tự luận',
        }[v] || 'Không rõ'),
    },
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

  return (
    <div className='p-4 space-y-6'>
      <div className='flex justify-between items-center mb-5'>
        <h2 className='text-2xl font-bold'>Danh sách câu hỏi</h2>
        <div className='flex gap-3'>
          <PrimaryButton
            onClick={handleAddClick}
            className='bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 shadow-md transition-all duration-200'
          >
            <FaPlus /> Thêm câu hỏi thủ công
          </PrimaryButton>
          <PrimaryButton
            onClick={handleAddClick}
            className=' font-semibold py-2 px-4 rounded-lg flex items-center gap-2 '
          >
            <FaPlus /> Thêm câu hỏi tự động
          </PrimaryButton>
        </div>
      </div>

      <MathJaxContext config={{ tex: { inlineMath: [['$', '$']] } }}>
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
          data={questions}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          actions={{
            view: handleView,
            approve: handleApprove,
            edit: handleEdit,
            delete: handleDelete,
          }}
          actionIcons={{
            view: 'view',
            approve: 'approve',
            edit: 'edit',
            delete: 'delete',
          }}
          selectable
          selectedKeys={selectedIds}
          onToggleRow={handleToggleRow}
          onToggleAll={handleToggleAll}
          getRowId={row => row.id}
          disableActions={{
            approve: row =>
              row?.canEdit === false ||
              !['Draft', 'AIDraft', 'Removed'].includes(row?.statusName),
          }}
          headerRight={
            <div className='flex gap-2 items-center relative'>
              <SearchInput
                placeholder='Tìm nội dung câu hỏi...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <button
                onClick={() => setShowFilterModal(!showFilterModal)}
                className='border px-3 py-1 rounded-md text-sm hover:bg-gray-100 flex items-center gap-1'
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
                <div className='absolute top-full right-0 mt-2 z-50 w-64 bg-white border shadow-md rounded-md p-4'>
                  <div className='flex justify-between items-center mb-2'>
                    <h3 className='text-sm font-semibold'>Bộ lọc</h3>
                    <button onClick={() => setShowFilterModal(false)}>
                      <MdOutlineClear />
                    </button>
                  </div>

                  <div className='space-y-3 text-sm'>
                    {/* Mức độ */}
                    <div>
                      <label className='font-medium'>Mức độ</label>
                      <select
                        value={filter.level}
                        onChange={e =>
                          setFilter({ ...filter, level: e.target.value })
                        }
                        className='w-full mt-1 border rounded px-2 py-1'
                      >
                        <option value=''>Tất cả</option>
                        <option value='Easy'>Nhận biết</option>
                        <option value='Medium'>Thông hiểu</option>
                        <option value='Hard'>Vận dụng</option>
                      </select>
                    </div>

                    {/* Loại câu hỏi */}
                    <div>
                      <label className='font-medium'>Loại câu hỏi</label>
                      <select
                        value={filter.type}
                        onChange={e =>
                          setFilter({ ...filter, type: e.target.value })
                        }
                        className='w-full mt-1 border rounded px-2 py-1'
                      >
                        <option value=''>Tất cả</option>
                        <option value='MultipleChoice'>
                          Trắc nghiệm nhiều đáp án
                        </option>
                        <option value='TrueFalse'>Trắc nghiệm Đúng/Sai</option>
                        <option value='ShortAnswer'>
                          Câu hỏi trả lời ngắn
                        </option>
                        <option value='Essay'>Tự luận</option>
                      </select>
                    </div>
                  </div>

                  <div className='mt-4 flex justify-end gap-2'>
                    <button
                      onClick={() => {
                        setFilter({ level: '', type: '' });
                        setShowFilterModal(false);
                      }}
                      className='text-sm px-3 py-1.5 border rounded'
                    >
                      Bỏ lọc
                    </button>
                    <button
                      onClick={() => setShowFilterModal(false)}
                      className='text-sm px-3 py-1.5 bg-blue-600 text-white rounded'
                    >
                      Lọc
                    </button>
                  </div>
                </div>
              )}
            </div>
          }
        />
      </MathJaxContext>

      {isViewModalOpen && selectedQuestion && (
        <QuestionDetailModal
          question={selectedQuestion}
          editMode={editMode}
          onSave={async payload => {
            await updateQuestion(payload);
            setIsViewModalOpen(false);
            setCurrentPage(1);
          }}
          onClose={() => setIsViewModalOpen(false)}
          onSaveSuccess={handleUpdateSuccess}
          onUpdateQuestion={handleUpdateSelectedQuestion}
        />
      )}

      {isAddModalOpen && (
        <AddQuestionModel
          editMode={true}
          onSave={handleAddSave}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}

      <ConfirmModal
        visible={deleteModal.open}
        title='Xoá câu hỏi'
        onClose={() => setDeleteModal({ open: false, exam: null })}
      >
        <p className='mb-6 text-gray-700'>
          Bạn có chắc chắn muốn xoá câu hỏi này không?
        </p>
        <div className='flex justify-end gap-2'>
          <button
            onClick={() => setDeleteModal({ open: false, exam: null })}
            className='px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100'
          >
            Hủy
          </button>
          <PrimaryButton
            onClick={confirmDeleteQuestion}
            className='px-4 py-2 rounded-md text-white bg-red-500 hover:bg-red-600'
          >
            Xoá
          </PrimaryButton>
        </div>
      </ConfirmModal>
    </div>
  );
};

export default Questions;
