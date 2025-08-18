import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '@/components/layouts/Breadcrumb';
import ReusableTable from '@/components/table/ReusableTable';
import QuestionDetailModal from '@/components/ui/QuestionDetailModal';
import {
  deleteQuestion,
  getAllQuestions,
  updateQuestion,
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

const QuestionList = () => {
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

  const itemsPerPage = 10;

  const activeFilterCount = ['level', 'type', 'fromDate', 'toDate'].filter(k =>
    Boolean(filter[k])
  ).length;

  const getCreator = q => {
    return (
      q?.createdByEmail ??
      q?.ownerEmail ??
      q?.owner?.email ??
      q?.userEmail ??
      q?.createdBy ??
      ''
    )
      .toString()
      .trim();
  };

  const normalize = s => (s || '').trim().toLowerCase();
  const isSystemCreator = c => ['admin', 'system'].includes(normalize(c));

  const fetchQuestions = async () => {
    try {
      const qs = new URLSearchParams();

      if (filter.level) qs.append('Level', filter.level);
      if (filter.type) qs.append('Type', filter.type);
      if (filter.grade) qs.append('Grade', String(Number(filter.grade)));
      if (searchTerm) qs.append('Search', searchTerm);

      qs.append('PageIndex', String(currentPage));
      qs.append('PageSize', String(itemsPerPage));

      if (filter.creator === 'system') {
        qs.append('CreatedByList', 'Admin');
      } else if (filter.creator === 'mine' && user?.email) {
        qs.append('CreatedByList', user.email);
      }

      if (filter.status) {
        qs.append('Status', String(STATUS_TO_NUM[filter.status]));
      }

      const url = `/api/questions?${qs.toString()}`;
      const res = await getAllQuestions(url);

      const result = res?.data?.data;
      const data = Array.isArray(result?.data) ? result.data : [];

      const me = normalize(user?.email);
      const withFlags = data.map(q => {
        const creator = normalize(getCreator(q));
        const isSystem = isSystemCreator(creator);
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
      });

      let filtered = withFlags;
      if (filter.status) {
        const want = filter.status.toLowerCase();
        filtered = filtered.filter(
          q => (q.statusName || '').toLowerCase() === want
        );
        const wantName = filter.status.toLowerCase();
        const wantNum = STATUS_TO_NUM[filter.status];
        filtered = filtered.filter(q => {
          const name = (q.statusName || '').toLowerCase();
          const num = typeof q.status === 'number' ? q.status : null;
          return name === wantName || num === wantNum;
        });
      }

      if (filter.creator === 'system')
        filtered = filtered.filter(q => q.isSystem);
      if (filter.creator === 'mine') filtered = filtered.filter(q => q.isMine);

      if (filtered.length === 0 && currentPage > 1) {
        setCurrentPage(p => Math.max(1, p - 1));
        return;
      }

      setQuestions(filtered);

      const serverCount = result?.count;
      const countForPaging =
        typeof serverCount === 'number' ? serverCount : filtered.length;
      setTotalPages(Math.ceil(countForPaging / itemsPerPage));
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
    setCurrentPage(1);
  }, [filter, searchTerm]);

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

  const buildUpdatePayload = row => ({
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
    // status sẽ set ở nơi gọi
  });

  const handleApprove = async row => {
    if (row?.canEdit === false) {
      toast?.warning?.('Bạn không thể duyệt câu hỏi do người khác tạo.');
      return;
    }
    const targetStatusName =
      row?.statusName === 'Removed' ? 'Draft' : 'Approved';
    if (row?.statusName === targetStatusName) {
      toast?.info?.(
        targetStatusName === 'Draft'
          ? 'Câu hỏi đã ở trạng thái Nháp.'
          : 'Câu hỏi đã ở trạng thái Đã duyệt.'
      );
      return;
    }

    try {
      const payload = {
        ...buildUpdatePayload(row),
        status: STATUS_TO_NUM[targetStatusName],
      };

      setQuestions(prev =>
        prev.map(q =>
          q.id === row.id ? { ...q, statusName: targetStatusName } : q
        )
      );

      await updateQuestion(payload);
      toast.success(
        targetStatusName === 'Draft'
          ? 'Đã khôi phục câu hỏi về Nháp'
          : 'Đã duyệt câu hỏi'
      );

      fetchQuestions();
    } catch (e) {
      setQuestions(prev =>
        prev.map(q =>
          q.id === row.id ? { ...q, statusName: row.statusName } : q
        )
      );
      console.error(e);
      toast.error('Cập nhật trạng thái thất bại');
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
      const payload = {
        ...buildUpdatePayload(row),
        status: STATUS_TO_NUM.Removed,
      };

      setQuestions(prev =>
        prev.map(q => (q.id === row.id ? { ...q, statusName: 'Removed' } : q))
      );
      await updateQuestion(payload);
      await deleteQuestion(deleteModal.question.id);
      toast.success('Đã chuyển trạng thái “Đã xóa” và xoá mềm câu hỏi');
      setDeleteModal({ open: false, question: null });
      setFilter(f => ({ ...f, status: 'Removed' }));
      setCurrentPage(1);
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

  const handleNavigateUploadQuestion = () => {
    navigate('/question/upload-question');
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

  // Ẩn cột "Lớp" nếu đã chọn khối lớp
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
                delete: row => row?.canDelete === false,
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
