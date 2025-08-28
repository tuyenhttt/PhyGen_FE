import { useEffect, useMemo, useState } from 'react';
import ReusableTable from '@/components/table/ReusableTable';
import {
  getAllQuestions,
  updateQuestion,
  updateQuestionsStatus,
} from '@/services/questionService';
import SearchInput from '@/components/ui/SearchInput';
import { IoFilter } from 'react-icons/io5';
import { FaPlus, FaTrashAlt, FaUndo, FaArrowAltCircleUp } from 'react-icons/fa';
import { MdOutlineClear } from 'react-icons/md';
import QuestionDetailModal from '@/components/ui/QuestionDetailModal';
import AutoAddQuestionModal from '@/components/ui/AutoAddQuestionModal';
import AddQuestionModel from '@/components/ui/AddQuestionModel';
import ConfirmModal from '@/components/ui/ConfirmModal';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { toast } from 'react-toastify';
import { getTopic } from '@/services/topicService';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import TabDropdown from '@/components/ui/TabDropdown';
import { IoWarningOutline } from 'react-icons/io5';

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

const ITEMS_PER_PAGE = 10;

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
  const [isAutoAddModalOpen, setIsAutoAddModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    question: null,
  });
  const [openGrade, setOpenGrade] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  const activeFilterCount = useMemo(
    () =>
      ['level', 'type', 'fromDate', 'toDate', 'status', 'grade'].filter(k =>
        Boolean(filter[k])
      ).length,
    [filter]
  );

  const formatDate = d => (d ? new Date(d).toISOString() : null);

  const fetchData = async () => {
    try {
      const qs = new URLSearchParams();
      qs.append('pageIndex', String(currentPage));
      qs.append('pageSize', String(ITEMS_PER_PAGE));

      qs.append('CreatedByList', 'Admin');
      qs.append('createdBy', 'Admin');

      const isCodeLike = s =>
        !!s &&
        /^[A-Za-z0-9_-]+$/.test(s.trim()) &&
        !/\s/.test(s) &&
        /\d/.test(s);

      if (searchTerm) {
        const v = searchTerm.trim();
        if (isCodeLike(v)) {
          qs.append('QuestionCode', v);
        } else {
          qs.append('search', v);
        }
      }
      if (filter.level) qs.append('level', filter.level);
      if (filter.type) qs.append('type', filter.type);
      if (filter.grade) qs.append('grade', String(Number(filter.grade)));
      if (filter.fromDate) qs.append('fromDate', formatDate(filter.fromDate));
      if (filter.toDate) qs.append('toDate', formatDate(filter.toDate));
      if (filter.status)
        qs.append('status', String(STATUS_TO_NUM[filter.status]));

      const res = await getAllQuestions(`/api/questions?${qs.toString()}`);
      const result = res?.data?.data;
      const serverRows = Array.isArray(result?.data) ? result.data : [];
      const serverCount = Number(result?.count ?? 0);

      const formatted = serverRows.map((q, i) => ({
        ...q,
        no: (currentPage - 1) * ITEMS_PER_PAGE + i + 1,
        levelName: q.levelName || '—',
        typeName: q.typeName || '—',
      }));
      setQuestions(formatted);

      const total =
        Number.isFinite(serverCount) && serverCount > 0
          ? serverCount
          : formatted.length;
      setTotalPages(Math.max(1, Math.ceil(total / ITEMS_PER_PAGE)));
    } catch (err) {
      console.error('Lỗi khi lấy dữ liệu:', err);
      setQuestions([]);
      setTopics([]);
      setTotalPages(1);
    }
  };

  const fetchTopics = async () => {
    try {
      const topicsRes = await getTopic();
      const topicsData = Array.isArray(topicsRes.data)
        ? topicsRes.data
        : Array.isArray(topicsRes.data?.data)
        ? topicsRes.data.data
        : [];
      setTopics(topicsData);
    } catch (e) {
      console.error('Lỗi khi lấy topics:', e);
      setTopics([]);
    }
  };

  useEffect(() => {
    fetchData();
    fetchTopics();
  }, [currentPage, searchTerm, filter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm]);

  // chọn hàng + đếm trên trang
  const idsOnPage = useMemo(
    () => new Set(questions.map(q => q.id)),
    [questions]
  );
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

  // ===== Soft-block logic: cho phép chọn lẫn nhưng cảnh báo & disable bulk =====
  const selectedRows = useMemo(
    () =>
      sanitizeIds(selectedIds)
        .map(id => questions.find(q => q.id === id))
        .filter(Boolean),
    [selectedIds, questions]
  );

  const mixedStatus = useMemo(() => {
    const set = new Set(selectedRows.map(r => r.statusName));
    return set.size > 1;
  }, [selectedRows]);

  // hành động từng dòng
  const handleAddClick = () => setIsAddModalOpen(true);
  const handleAutoAddClick = () => setIsAutoAddModalOpen(true);

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

  const handleApprove = async row => {
    const isRemoved = row?.statusName === 'Removed';
    const nextStatusName = isRemoved ? 'Draft' : 'Approved';
    const nextStatus = STATUS_TO_NUM[nextStatusName];

    try {
      setQuestions(prev =>
        prev.map(q =>
          q.id === row.id ? { ...q, statusName: nextStatusName } : q
        )
      );
      await updateQuestionsStatus([row.id], nextStatus);
      toast.success(isRemoved ? 'Đã chuyển về Nháp' : 'Đã duyệt câu hỏi');
      fetchData();
    } catch (e) {
      setQuestions(prev =>
        prev.map(q =>
          q.id === row.id ? { ...q, statusName: row.statusName } : q
        )
      );
      toast.error('Cập nhật trạng thái thất bại');
      console.error(e);
    }
  };

  const handleDelete = question => setDeleteModal({ open: true, question });

  const confirmDeleteQuestion = async () => {
    const row = deleteModal.question;
    try {
      setQuestions(prev =>
        prev.map(q => (q.id === row.id ? { ...q, statusName: 'Removed' } : q))
      );
      await updateQuestionsStatus([row.id], STATUS_TO_NUM.Removed);
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

  // ==== hành động hàng loạt ====
  const handleBulkApprove = async () => {
    const ids = sanitizeIds(selectedIds)
      .map(id => questions.find(q => q.id === id))
      .filter(q => q && ['Draft', 'AIDraft'].includes(q.statusName))
      .map(q => q.id);

    if (ids.length === 0) {
      toast.info('Không có câu hỏi ở trạng thái Nháp/Nháp (AI) để duyệt.');
      return;
    }

    setQuestions(prev =>
      prev.map(q => (ids.includes(q.id) ? { ...q, statusName: 'Approved' } : q))
    );
    setBulkLoading(true);
    try {
      await updateQuestionsStatus(ids, STATUS_TO_NUM.Approved);
      toast.success('Đã duyệt các câu hỏi đã chọn.');
      setSelectedIds([]);
      fetchData();
    } catch (e) {
      toast.error('Duyệt thất bại');
      fetchData();
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkRestore = async () => {
    const ids = sanitizeIds(selectedIds)
      .map(id => questions.find(q => q.id === id))
      .filter(q => q && q.statusName === 'Removed')
      .map(q => q.id);

    if (ids.length === 0) {
      toast.info('Không có câu hỏi ở trạng thái Đã xóa để khôi phục.');
      return;
    }

    setQuestions(prev =>
      prev.map(q => (ids.includes(q.id) ? { ...q, statusName: 'Draft' } : q))
    );
    setBulkLoading(true);
    try {
      await updateQuestionsStatus(ids, STATUS_TO_NUM.Draft);
      toast.success('Đã khôi phục về Nháp.');
      setSelectedIds([]);
      fetchData();
    } catch (e) {
      toast.error('Khôi phục thất bại');
      fetchData();
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkRemove = async () => {
    const ids = sanitizeIds(selectedIds);
    if (ids.length === 0) {
      toast.info('Chưa có câu hỏi nào được chọn.');
      return;
    }

    setQuestions(prev =>
      prev.map(q => (ids.includes(q.id) ? { ...q, statusName: 'Removed' } : q))
    );
    setBulkLoading(true);
    try {
      await updateQuestionsStatus(ids, STATUS_TO_NUM.Removed);
      toast.success('Đã chuyển sang trạng thái Đã xóa.');
      setSelectedIds([]);
      fetchData();
    } catch (e) {
      toast.error('Cập nhật trạng thái thất bại');
      fetchData();
    } finally {
      setBulkLoading(false);
    }
  };

  // columns
  const columns = [
    { header: 'Mã câu hỏi', accessor: 'questionCode' },
    {
      header: 'Nội dung câu hỏi',
      accessor: 'content',
      render: value => (
        <MathJax dynamic>
          <div className='max-w-[250px] truncate' title={value}>
            {value}
          </div>
        </MathJax>
      ),
    },
    { header: 'Lớp', accessor: 'grade' },
    {
      header: 'Mức độ',
      accessor: 'levelName',
      render: v =>
        ({ Easy: 'Nhận biết', Medium: 'Thông hiểu', Hard: 'Vận dụng' }[v] ||
        'Không rõ'),
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
            onClick={handleAutoAddClick}
            className='font-semibold py-2 px-4 rounded-lg flex items-center gap-2'
          >
            <FaPlus /> Thêm câu hỏi tự động
          </PrimaryButton>
        </div>
      </div>

      {/* Banner cảnh báo khi chọn lẫn trạng thái */}
      {selectedOnPageCount > 0 && mixedStatus && (
        <div className='mb-2 px-3 py-2 rounded border border-red-200 bg-red-50 text-red-700'>
          Bạn đã chọn các câu hỏi có <b>trạng thái khác nhau</b>. Vui lòng chỉ
          chọn các câu hỏi cùng trạng thái để thực hiện hành động hàng loạt.
        </div>
      )}

      {/* Thanh thao tác hàng loạt */}
      {selectedOnPageCount > 0 && (
        <div className='mb-3 px-3 py-2 flex items-center gap-3 '>
          <span>
            Đã chọn <b>{selectedOnPageCount}</b> câu hỏi trên trang.{` `}
            <button
              className='text-sm underline text-gray-500 font-bold hover:text-gray-700'
              onClick={() => setSelectedIds([])}
              disabled={bulkLoading}
            >
              Bỏ chọn
            </button>
          </span>

          <div className='ml-auto flex items-center gap-2'>
            <button
              onClick={handleBulkApprove}
              disabled={bulkLoading || mixedStatus}
              className='px-3 py-1.5 rounded flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white shadow-sm disabled:opacity-60 disabled:cursor-not-allowed'
              title={
                mixedStatus
                  ? 'Không thể thao tác khi chọn lẫn trạng thái'
                  : 'Duyệt'
              }
            >
              <FaArrowAltCircleUp />
              <span>Duyệt</span>
            </button>
            <button
              title={
                mixedStatus
                  ? 'Không thể thao tác khi chọn lẫn trạng thái'
                  : 'Khôi phục (Đã xóa → Nháp)'
              }
              onClick={handleBulkRestore}
              disabled={bulkLoading || mixedStatus}
              className='px-3 py-1.5 rounded flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white shadow-sm disabled:opacity-60 disabled:cursor-not-allowed'
            >
              <FaUndo />
              <span>Khôi phục</span>
            </button>
            <button
              title={
                mixedStatus
                  ? 'Không thể thao tác khi chọn lẫn trạng thái'
                  : 'Đánh dấu Đã xóa'
              }
              onClick={handleBulkRemove}
              disabled={bulkLoading || mixedStatus}
              className='px-3 py-1.5 rounded flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white shadow-sm disabled:opacity-60 disabled:cursor-not-allowed'
            >
              <FaTrashAlt />
              <span>Xóa</span>
            </button>
          </div>
        </div>
      )}
      {questions.some(q => q.isDuplicate) && (
        <div className='flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-2 mb-3 rounded'>
          <IoWarningOutline size={24} className='flex-shrink-0' />
          <span>
            Một số câu hỏi bị đánh dấu là <b>trùng</b>. Hãy kiểm tra trước khi
            duyệt.
          </span>
        </div>
      )}
      <MathJaxContext config={{ tex: { inlineMath: [['$', '$']] } }}>
        <ReusableTable
          headerLeft={
            <div className='flex items-center gap-3 flex-wrap'>
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
              !['Draft', 'AIDraft', 'Removed'].includes(row?.statusName),
            delete: row => row?.statusName === 'Removed',
          }}
          headerRight={
            <div className='flex gap-2 items-center relative'>
              <SearchInput
                placeholder='Tìm theo nội dung hoặc mã câu hỏi...'
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
                        setFilter({
                          level: '',
                          type: '',
                          grade: '',
                          fromDate: '',
                          toDate: '',
                          status: '',
                        });
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
          onSaveSuccess={() => fetchData()}
        />
      )}

      {isAddModalOpen && (
        <AddQuestionModel
          editMode={true}
          onSave={() => {
            fetchData();
            setIsAddModalOpen(false);
          }}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}
      {isAutoAddModalOpen && (
        <AutoAddQuestionModal
          onClose={() => setIsAutoAddModalOpen(false)}
          setQuestionList={setQuestions}
        />
      )}

      <ConfirmModal
        visible={deleteModal.open}
        title='Xoá câu hỏi'
        onClose={() => setDeleteModal({ open: false, question: null })}
      >
        <p className='mb-6 text-gray-700'>
          Bạn có chắc chắn muốn xoá câu hỏi này không?
        </p>
        <div className='flex justify-end gap-2'>
          <button
            onClick={() => setDeleteModal({ open: false, question: null })}
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
