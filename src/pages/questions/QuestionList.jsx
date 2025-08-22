import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '@/components/layouts/Breadcrumb';
import ReusableTable from '@/components/table/ReusableTable';
import QuestionDetailModal from '@/components/ui/QuestionDetailModal';
import {
  deleteQuestion,
  getAllQuestions,
  updateQuestionsStatus,
} from '@/services/questionService';
import SearchInput from '@/components/ui/SearchInput';
import { IoFilter } from 'react-icons/io5';
import { MdOutlineClear } from 'react-icons/md';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import CommonButton from '@/components/ui/CommonButton';
import { getTopic } from '@/services/topicService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import ConfirmModal from '@/components/ui/ConfirmModal';
import TabDropdown from '@/components/ui/TabDropdown';
import { FaArrowAltCircleUp, FaTrashAlt, FaUndo } from 'react-icons/fa';

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
const NUM_TO_STATUS = Object.fromEntries(
  Object.entries(STATUS_TO_NUM).map(([k, v]) => [v, k])
);

const QuestionList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [questions, setQuestions] = useState([]);
  const [selectedGrades, setSelectedGrades] = useState([]);
  const [selectedExams, setSelectedExams] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState({
    level: '',
    type: '',
    grade: '',
    creator: '',
    status: '',
    fromDate: '',
    toDate: '',
  });

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [topics, setTopics] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    question: null,
  });
  const [deleting, setDeleting] = useState(false);
  const [openGrade, setOpenGrade] = useState(false);
  const [openCreator, setOpenCreator] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  const itemsPerPage = 10;

  const activeFilterCount = ['level', 'type', 'fromDate', 'toDate'].filter(k =>
    Boolean(filter[k])
  ).length;

  const getCreator = q =>
    (
      q?.createdByEmail ??
      q?.ownerEmail ??
      q?.owner?.email ??
      q?.userEmail ??
      q?.createdBy ??
      ''
    )
      .toString()
      .trim();

  const normalize = s => (s || '').trim().toLowerCase();

  const statusNum = k => STATUS_TO_NUM[k];

  // ===== Helpers dùng chung =====
  const extractItems = res => {
    const root = res?.data ?? {};
    const box = root?.data ?? root;
    const items = Array.isArray(box?.data)
      ? box.data
      : Array.isArray(box)
      ? box
      : [];
    const count = typeof box?.count === 'number' ? box.count : items.length;
    const pageSize =
      typeof box?.pageSize === 'number'
        ? box.pageSize
        : items.length > 0
        ? items.length
        : 20;
    const pageIndex = typeof box?.pageIndex === 'number' ? box.pageIndex : 1;
    return { items, count, pageSize, pageIndex };
  };

  const fetchAllPaged = async baseQS => {
    const firstQS = new URLSearchParams(baseQS);
    firstQS.set('PageIndex', '1');
    firstQS.set('PageSize', '20');

    const firstRes = await getAllQuestions(
      `/api/questions?${firstQS.toString()}`
    );
    const { items: firstItems, count, pageSize } = extractItems(firstRes);

    const totalPages = Math.max(1, Math.ceil(count / pageSize));
    let all = firstItems;

    if (totalPages === 1) return all;

    const promises = [];
    for (let i = 2; i <= totalPages; i++) {
      const qs = new URLSearchParams(baseQS);
      qs.set('PageIndex', String(i));
      qs.set('PageSize', String(pageSize));
      promises.push(getAllQuestions(`/api/questions?${qs.toString()}`));
    }
    const rest = await Promise.all(promises);
    for (const res of rest) {
      const { items } = extractItems(res);
      if (Array.isArray(items) && items.length) all = all.concat(items);
    }
    return all;
  };

  const uniqueById = arr => {
    const seen = new Set();
    return arr.filter(x => {
      const k = x?.id;
      if (!k || seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  };

  // ===== fetchQuestions hoàn chỉnh =====
  const fetchQuestions = async () => {
    try {
      const qsCommon = new URLSearchParams();
      if (filter.level) qsCommon.append('Level', filter.level);
      if (filter.type) qsCommon.append('Type', filter.type);
      if (filter.grade) qsCommon.append('Grade', String(Number(filter.grade)));
      if (searchTerm) qsCommon.append('Search', searchTerm);

      const qsMine = new URLSearchParams(qsCommon);
      if (user?.email) qsMine.append('CreatedByList', user.email);

      const qsSys = new URLSearchParams(qsCommon);
      qsSys.append('Status', String(STATUS_TO_NUM.Approved));

      qsSys.append('CreatedByList', 'Admin');
      qsSys.append('CreatedByList', 'System');

      const [dataMineRaw, dataSysRaw] = await Promise.all([
        fetchAllPaged(qsMine),
        fetchAllPaged(qsSys),
      ]);

      // Map flags
      const me = normalize(user?.email);
      const withFlags = q => {
        const creatorRaw = getCreator(q);
        const creator = normalize(creatorRaw);
        const isSystem =
          ['admin', 'system'].includes(creator) ||
          /^admin@/i.test(creatorRaw || '') ||
          /^system@/i.test(creatorRaw || '');
        const isMine = creator === me;
        const statusName =
          q.statusName ||
          (typeof q.status === 'number' ? NUM_TO_STATUS[q.status] : '');
        return {
          ...q,
          statusName,
          isSystem,
          isMine,
          canEdit: isMine,
          canDelete: isMine,
        };
      };

      const merged = uniqueById([...dataMineRaw, ...dataSysRaw].map(withFlags));

      let filtered = merged.filter(
        q => q.isMine || (q.isSystem && q.statusName === 'Approved')
      );

      if (filter.creator === 'mine') {
        filtered = filtered.filter(q => q.isMine);
      } else if (filter.creator === 'system') {
        filtered = filtered.filter(q => q.isSystem);
      }

      if (filter.status) {
        const want = filter.status.toLowerCase();
        filtered = filtered.filter(q => {
          if (q.isSystem)
            return q.statusName === 'Approved' && want === 'approved';
          return (q.statusName || '').toLowerCase() === want;
        });
      }
      if (filter.level) {
        filtered = filtered.filter(
          q => (q.levelName || '').toLowerCase() === filter.level.toLowerCase()
        );
      }
      if (filter.type) {
        filtered = filtered.filter(
          q => (q.typeName || '').toLowerCase() === filter.type.toLowerCase()
        );
      }
      if (filter.grade) {
        filtered = filtered.filter(
          q => String(q.grade) === String(filter.grade)
        );
      }
      if (searchTerm?.trim()) {
        const s = searchTerm.trim().toLowerCase();
        filtered = filtered.filter(
          q =>
            (q.content || '').toLowerCase().includes(s) ||
            (q.questionCode || '').toLowerCase().includes(s)
        );
      }

      const getTS = q => {
        const t =
          q.updatedAt ||
          q.createdAt ||
          q.createdDate ||
          q.createDate ||
          q.createdOn;
        return t ? new Date(t).getTime() : Number(q.id) || 0;
      };
      filtered.sort((a, b) => getTS(b) - getTS(a));

      // Client-side pagination
      const totalCount = filtered.length;
      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const pageData = filtered.slice(start, end);
      const nextTotalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));

      if (pageData.length === 0 && currentPage > 1) {
        setCurrentPage(p => Math.max(1, p - 1));
        return;
      }

      setQuestions(pageData);
      setTotalPages(nextTotalPages);
    } catch (err) {
      console.error('Lỗi khi fetch câu hỏi:', err);
    }
  };

  const fetchTopics = async () => {
    try {
      const res = await getTopic();
      setTopics(res?.data?.data || []);
    } catch (error) {
      console.error('Lỗi khi fetch topics:', error);
    }
  };

  useEffect(() => {
    if (user === undefined) return;
    fetchQuestions();
    fetchTopics();
  }, [
    selectedGrades,
    selectedExams,
    selectedYears,
    searchTerm,
    filter,
    currentPage,
    user?.email,
  ]);

  useEffect(() => {
    setSelectedIds([]);
    setCurrentPage(1);
  }, [filter, searchTerm]);

  // ===== Actions từng dòng =====
  const handleView = row => {
    setSelectedQuestion(row);
    setEditMode(false);
    setIsModalOpen(true);
  };

  const handleEdit = row => {
    if (row?.canEdit === false) {
      toast?.warning?.('Bạn không thể chỉnh sửa câu hỏi do người khác tạo.');
      return;
    }
    setSelectedQuestion(row);
    setEditMode(true);
    setIsModalOpen(true);
  };

  const handleApprove = async row => {
    if (row?.canEdit === false) {
      toast?.warning?.(
        'Bạn không thể đổi trạng thái câu hỏi do người khác tạo.'
      );
      return;
    }

    const current = row?.statusName;
    let target = null;

    if (current === 'Removed') target = 'Draft';
    else if (['Draft', 'AIDraft'].includes(current)) target = 'Approved';
    else {
      toast.info('Trạng thái hiện tại không hỗ trợ thao tác này.');
      return;
    }

    try {
      // optimistic
      setQuestions(prev =>
        prev.map(q =>
          q.id === row.id
            ? { ...q, statusName: target, status: statusNum(target) }
            : q
        )
      );

      await updateQuestionsStatus([row.id], statusNum(target));
      toast.success(target === 'Draft' ? 'Đã khôi phục về Nháp' : 'Đã duyệt');
      fetchQuestions();
    } catch (e) {
      // rollback đơn giản
      setQuestions(prev =>
        prev.map(q => (q.id === row.id ? { ...q, statusName: current } : q))
      );
      toast.error('Cập nhật trạng thái thất bại');
      console.error(e);
    }
  };

  const handleAskDelete = row => {
    if (row?.canDelete === false) {
      toast?.warning?.('Bạn không thể xóa câu hỏi do người khác tạo.');
      return;
    }
    setDeleteModal({ open: true, question: row });
  };

  const confirmDeleteQuestion = async () => {
    if (!deleteModal.question) return;
    try {
      setDeleting(true);
      const row = deleteModal.question;

      setQuestions(prev =>
        prev.map(q =>
          q.id === row.id
            ? { ...q, statusName: 'Removed', status: STATUS_TO_NUM.Removed }
            : q
        )
      );

      // Đặt trạng thái Removed qua endpoint status (đồng bộ với bulk)
      await updateQuestionsStatus([row.id], STATUS_TO_NUM.Removed);
      // Nếu cần gọi API xóa mềm riêng, giữ lại:
      await deleteQuestion(row.id);

      toast.success('Đã chuyển trạng thái “Đã xóa”.');
      setDeleteModal({ open: false, question: null });
    } catch (err) {
      const orig = deleteModal.question?.statusName;
      if (orig) {
        setQuestions(prev =>
          prev.map(q =>
            q.id === deleteModal.question.id ? { ...q, statusName: orig } : q
          )
        );
      }
      console.error('Lỗi khi xoá:', err);
      toast.error('Lỗi khi xoá câu hỏi');
    } finally {
      setDeleting(false);
    }
  };

  const editableSelectedIds = () =>
    selectedIds.filter(id => {
      const q = questions.find(x => x.id === id);
      return q?.canEdit;
    });

  const handleBulkApprove = async () => {
    const idsAll = editableSelectedIds();
    const ids = idsAll.filter(id => {
      const q = questions.find(x => x.id === id);
      return ['Draft', 'AIDraft'].includes(q?.statusName);
    });

    if (ids.length === 0) {
      toast.warn('Trạng thái hiện tại không hỗ trợ thao tác này.');
      return;
    }
    const skipped = selectedIds.length - ids.length;
    if (skipped > 0) toast.info(`Bỏ qua ${skipped} câu không hợp lệ.`);

    // optimistic
    setQuestions(prev =>
      prev.map(q =>
        ids.includes(q.id)
          ? { ...q, statusName: 'Approved', status: STATUS_TO_NUM.Approved }
          : q
      )
    );

    setBulkLoading(true);
    try {
      await updateQuestionsStatus(ids, STATUS_TO_NUM.Approved);
      toast.success('Đã duyệt các câu hỏi đã chọn.');
      setSelectedIds([]);
      fetchQuestions();
    } catch (e) {
      toast.error('Duyệt thất bại');
      fetchQuestions();
    } finally {
      setBulkLoading(false);
    }
  };

  // RESTORE hàng loạt: chỉ Removed -> Draft
  const handleBulkRestore = async () => {
    const idsAll = editableSelectedIds();
    const ids = idsAll.filter(id => {
      const q = questions.find(x => x.id === id);
      return q?.statusName === 'Removed';
    });

    if (ids.length === 0) {
      toast.warn('Trạng thái hiện tại không hỗ trợ thao tác này.');
      return;
    }
    const skipped = selectedIds.length - ids.length;
    if (skipped > 0) toast.info(`Bỏ qua ${skipped} câu không hợp lệ.`);

    // optimistic
    setQuestions(prev =>
      prev.map(q =>
        ids.includes(q.id)
          ? { ...q, statusName: 'Draft', status: STATUS_TO_NUM.Draft }
          : q
      )
    );

    setBulkLoading(true);
    try {
      await updateQuestionsStatus(ids, STATUS_TO_NUM.Draft);
      toast.success('Đã khôi phục về Nháp.');
      setSelectedIds([]);
      fetchQuestions();
    } catch (e) {
      toast.error('Khôi phục thất bại');
      fetchQuestions();
    } finally {
      setBulkLoading(false);
    }
  };

  // REMOVE hàng loạt: đặt Removed
  const handleBulkRemove = async () => {
    const ids = editableSelectedIds();
    if (ids.length === 0) {
      toast.warning('Trạng thái hiện tại không hỗ trợ thao tác này.');
      return;
    }
    const skipped = selectedIds.length - ids.length;
    if (skipped > 0)
      toast.info(`Bỏ qua ${skipped} câu không thuộc quyền của bạn.`);

    setQuestions(prev =>
      prev.map(q =>
        ids.includes(q.id)
          ? { ...q, statusName: 'Removed', status: STATUS_TO_NUM.Removed }
          : q
      )
    );

    setBulkLoading(true);
    try {
      await updateQuestionsStatus(ids, STATUS_TO_NUM.Removed);
      toast.success('Đã chuyển sang trạng thái Đã xóa.');
      setSelectedIds([]);
      fetchQuestions();
    } catch (e) {
      toast.error('Cập nhật trạng thái thất bại');
      fetchQuestions();
    } finally {
      setBulkLoading(false);
    }
  };

  const handleNavigateUploadQuestion = () =>
    navigate('/question/upload-question');

  const handleToggleRow = (id, checked) =>
    setSelectedIds(prev =>
      checked ? Array.from(new Set([...prev, id])) : prev.filter(x => x !== id)
    );

  const handleToggleAll = (checked, pageRowIds) =>
    setSelectedIds(prev =>
      checked
        ? Array.from(new Set([...prev, ...pageRowIds]))
        : prev.filter(id => !pageRowIds.includes(id))
    );

  const selectedRows = useMemo(
    () =>
      selectedIds.map(id => questions.find(q => q.id === id)).filter(Boolean),
    [selectedIds, questions]
  );

  const mixedStatus = useMemo(() => {
    const set = new Set(selectedRows.map(r => r.statusName));
    return set.size > 1;
  }, [selectedRows]);

  const hasSystemSelected = useMemo(() => {
    return selectedRows.some(r => r?.isSystem);
  }, [selectedRows]);

  const columns = [
    { header: 'Mã câu hỏi', accessor: 'questionCode' },
    {
      header: 'Nội dung câu hỏi',
      accessor: 'content',
      render: value => (
        <MathJax dynamic>
          <div className='max-w-[350px] truncate' title={value}>
            {value}
          </div>
        </MathJax>
      ),
    },
    { header: 'Lớp', accessor: 'grade' },
    {
      header: 'Mức độ',
      accessor: 'levelName',
      render: value => {
        const levelMap = {
          Easy: 'Nhận biết',
          Medium: 'Thông hiểu',
          Hard: 'Vận dụng',
        };
        return levelMap[value] || value || '—';
      },
    },
    {
      header: 'Loại',
      accessor: 'typeName',
      render: value => {
        const typeMap = {
          MultipleChoice: 'Trắc nghiệm nhiều đáp án',
          TrueFalse: 'Trắc nghiệm Đúng/Sai',
          ShortAnswer: 'Câu hỏi trả lời ngắn',
          Essay: 'Tự luận',
        };
        return typeMap[value] || value || '—';
      },
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
    <section className='bg-gray-100 min-h-screen py-20 px-4 sm:px-8 lg:px-20'>
      <div className='max-w-6xl mx-auto'>
        <div className='flex justify-between items-center mb-5'>
          <Breadcrumb />
          <PrimaryButton
            className='bg-gradient-to-r from-orange-500 to-yellow-400 text-white font-bold px-5 py-2 rounded-xl shadow-md hover:scale-105 transition-transform duration-200'
            onClick={handleNavigateUploadQuestion}
          >
            Tải lên câu hỏi
          </PrimaryButton>
        </div>

        {/* Banner cảnh báo khi chọn lẫn trạng thái */}
        {selectedIds.length > 0 && mixedStatus && (
          <div className='mb-3 px-3 py-2 rounded border border-red-200 bg-red-50 text-red-700'>
            Bạn đã chọn các câu hỏi có <b>trạng thái khác nhau</b>. Vui lòng chỉ
            chọn các câu hỏi cùng trạng thái để thực hiện hành động hàng loạt.
          </div>
        )}

        {selectedIds.length > 0 && hasSystemSelected && (
          <div className='mb-3 px-3 py-2 rounded border border-amber-200 bg-amber-50 text-amber-800'>
            Bạn đã chọn câu hỏi do <b>Admin/Hệ thống</b> tạo. Không thể thực
            hiện các thao tác này.
          </div>
        )}

        {/* Thanh hành động khi chọn nhiều */}
        {selectedIds.length > 0 && (
          <div className='mb-3 px-3 py-2 bg-white rounded flex items-center gap-3 shadow-sm'>
            <span>
              Đã chọn <b>{selectedIds.length}</b> câu hỏi trên trang.
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
                disabled={bulkLoading || mixedStatus || hasSystemSelected}
                className='px-3 py-1.5 rounded flex items-center gap-2 
     bg-green-500 hover:bg-green-600 text-white shadow-sm 
     disabled:opacity-60 disabled:cursor-not-allowed'
                title={
                  hasSystemSelected
                    ? 'Không thể thao tác với câu hỏi do Admin/Hệ thống tạo'
                    : mixedStatus
                    ? 'Không thể thao tác khi chọn lẫn trạng thái'
                    : 'Duyệt'
                }
              >
                <FaArrowAltCircleUp size={22} />
                <span>Duyệt</span>
              </button>

              {/* RESTORE */}
              <button
                onClick={handleBulkRestore}
                disabled={bulkLoading || mixedStatus || hasSystemSelected}
                className='px-3 py-1.5 rounded flex items-center gap-2 
     bg-blue-500 hover:bg-blue-600 text-white shadow-sm 
     disabled:opacity-60 disabled:cursor-not-allowed'
                title={
                  hasSystemSelected
                    ? 'Không thể thao tác với câu hỏi do Admin/Hệ thống tạo'
                    : mixedStatus
                    ? 'Không thể thao tác khi chọn lẫn trạng thái'
                    : 'Khôi phục (Removed → Draft)'
                }
              >
                <FaUndo />
                <span>Khôi phục</span>
              </button>

              {/* DELETE */}
              <button
                onClick={handleBulkRemove}
                disabled={bulkLoading || mixedStatus || hasSystemSelected}
                className='px-3 py-1.5 rounded flex items-center gap-2 
     bg-red-500 hover:bg-red-600 text-white shadow-sm 
     disabled:opacity-60 disabled:cursor-not-allowed'
                title={
                  hasSystemSelected
                    ? 'Không thể thao tác với câu hỏi do Admin/Hệ thống tạo'
                    : mixedStatus
                    ? 'Không thể thao tác khi chọn lẫn trạng thái'
                    : 'Đánh dấu Đã xóa'
                }
              >
                <FaTrashAlt />
                <span>Xóa</span>
              </button>
            </div>
          </div>
        )}

        <div className='flex flex-col gap-6'>
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
                          (filter.grade || '') === g
                            ? 'bg-gray-50 font-medium'
                            : ''
                        }`}
                      >
                        {g ? `Lớp ${g}` : 'Tất cả'}
                      </button>
                    ))}
                  </TabDropdown>

                  {/* Người tạo */}
                  <TabDropdown
                    label='Người tạo'
                    valueLabel={
                      filter.creator === 'mine'
                        ? 'Của tôi'
                        : filter.creator === 'system'
                        ? 'Hệ thống'
                        : ''
                    }
                    open={openCreator}
                    setOpen={setOpenCreator}
                  >
                    {[
                      { k: '', t: 'Tất cả' },
                      { k: 'mine', t: 'Của tôi' },
                      { k: 'system', t: 'Hệ thống' },
                    ].map(o => (
                      <button
                        key={o.k || 'all'}
                        onClick={() => {
                          setFilter(f => ({ ...f, creator: o.k }));
                          setOpenCreator(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 ${
                          (filter.creator || '') === o.k
                            ? 'bg-gray-50 font-medium'
                            : ''
                        }`}
                      >
                        {o.t}
                      </button>
                    ))}
                  </TabDropdown>

                  {/* Trạng thái */}
                  <TabDropdown
                    label='Trạng thái'
                    valueLabel={
                      filter.status ? STATUS_LABELS[filter.status] : ''
                    }
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
              onPageChange={page => setCurrentPage(page)}
              actions={{
                view: handleView,
                approve: handleApprove,
                edit: handleEdit,
                delete: handleAskDelete,
              }}
              actionIcons={{
                view: 'view',
                approve: 'approve',
                edit: row => (row?.canEdit === false ? 'edit' : 'edit'),
                delete: row => (row?.canEdit === false ? 'delete' : 'delete'),
              }}
              disableActions={{
                edit: row => row?.canEdit === false,
                approve: row =>
                  row?.canEdit === false ||
                  !['Draft', 'AIDraft', 'Removed'].includes(row?.statusName),
                delete: row =>
                  row?.canDelete === false || row?.statusName === 'Removed',
              }}
              selectable
              selectedKeys={selectedIds}
              onToggleRow={handleToggleRow}
              onToggleAll={handleToggleAll}
              getRowId={row => row.id}
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
                    <span>Lọc </span>
                    {activeFilterCount > 0 && (
                      <span className='ml-1 text-xs bg-blue-600 text-white rounded-full px-1.5'>
                        {activeFilterCount}
                      </span>
                    )}
                  </button>

                  {showFilterModal && (
                    <div className='absolute top-full right-0 mt-2 z-50 w-60 bg-white border shadow-md rounded-md p-4 animate-fadeIn'>
                      <div className='flex justify-between items-center mb-3'>
                        <h3 className='text-sm font-semibold'>Bộ lọc</h3>
                        <button
                          onClick={() => setShowFilterModal(false)}
                          className='text-gray-600 hover:text-gray-700'
                        >
                          <MdOutlineClear size={18} />
                        </button>
                      </div>

                      <div className='space-y-2 text-sm'>
                        <div>
                          <label className='font-medium'>Mức độ</label>
                          <select
                            value={filter.level}
                            onChange={e =>
                              setFilter({ ...filter, level: e.target.value })
                            }
                            className='w-full mt-1 border rounded px-2 py-1.5 text-sm'
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
                            className='w-full mt-1 border rounded px-2 py-1.5 text-sm'
                          >
                            <option value=''>Tất cả</option>
                            <option value='MultipleChoice'>
                              Trắc nghiệm nhiều đáp án
                            </option>
                            <option value='TrueFalse'>
                              Trắc nghiệm Đúng/Sai
                            </option>
                            <option value='ShortAnswer'>
                              Câu hỏi trả lời ngắn
                            </option>
                            <option value='Essay'>Tự luận</option>
                          </select>
                        </div>
                      </div>

                      <div className='mt-4 flex justify-end gap-2'>
                        <CommonButton
                          onClick={() => {
                            setFilter(f => ({
                              ...f,
                              level: '',
                              type: '',
                              fromDate: '',
                              toDate: '',
                            }));
                            setShowFilterModal(false);
                          }}
                          className='text-sm px-3 py-1.5 border rounded'
                        >
                          Bỏ lọc
                        </CommonButton>
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

          {isModalOpen && selectedQuestion && (
            <QuestionDetailModal
              question={selectedQuestion}
              editMode={editMode}
              onClose={() => {
                setIsModalOpen(false);
                setEditMode(false);
              }}
              onSaveSuccess={fetchQuestions}
            />
          )}
        </div>
      </div>

      {/* Modal xác nhận xóa */}
      <ConfirmModal
        visible={deleteModal.open}
        title='Xoá câu hỏi'
        onClose={() =>
          deleting ? null : setDeleteModal({ open: false, question: null })
        }
      >
        <p className='mb-4 text-gray-700'>
          Bạn có chắc chắn muốn xoá câu hỏi
          {deleteModal.question?.questionCode ? (
            <>
              {' '}
              <span className='font-semibold'>
                #{deleteModal.question.questionCode}
              </span>
            </>
          ) : null}
          ? Hành động này là <span className='font-medium'>xóa mềm</span> và có
          thể khôi phục trong mục <span className='font-medium'>Đã xóa</span>.
        </p>

        <div className='flex justify-end gap-2'>
          <button
            onClick={() => setDeleteModal({ open: false, question: null })}
            className='px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100'
            disabled={deleting}
          >
            Hủy
          </button>
          <PrimaryButton
            onClick={confirmDeleteQuestion}
            className='px-4 py-2 rounded-md text-white bg-red-500 hover:bg-red-600 disabled:opacity-60'
            disabled={deleting}
          >
            Xoá
          </PrimaryButton>
        </div>
      </ConfirmModal>
    </section>
  );
};

export default QuestionList;
