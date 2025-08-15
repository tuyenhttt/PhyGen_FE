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
import RemovedToggle from '@/components/ui/RemovedToggle';
import GradeTabs from '@/components/ui/GradeTabs';

const normalize = s => (typeof s === 'string' ? s.trim().toLowerCase() : '');

const getDeletedByEmail = q =>
  q?.deletedByEmail ||
  q?.deletedBy ||
  q?.removedByEmail ||
  q?.removedBy ||
  q?.deletedByUser?.email ||
  q?.removedByUser?.email ||
  '';

const QuestionList = () => {
  // Map trạng thái
  const STATUS_LABELS = {
    Draft: 'Nháp',
    AIDraft: 'Nháp (AI)',
    Approved: 'Đã duyệt',
    Removed: 'Đã xóa',
  };
  const STATUS_TO_NUM = { Draft: 0, AIDraft: 1, Approved: 2, Removed: 3 };
  const NUM_TO_STATUS = {
    0: 'Draft',
    1: 'AIDraft',
    2: 'Approved',
    3: 'Removed',
  };

  // Map level/type nếu BE dùng số
  const LEVEL_TO_NUM = { Easy: 0, Medium: 1, Hard: 2 };
  const TYPE_TO_NUM = {
    MultipleChoice: 0,
    TrueFalse: 1,
    ShortAnswer: 2,
    Essay: 3,
  };

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
  const [updatingId, setUpdatingId] = useState(null);
  const [statusTab, setStatusTab] = useState('active'); // 'active' | 'removed'
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    question: null,
  });
  const [deleting, setDeleting] = useState(false);

  const itemsPerPage = 10;

  const activeFilterCount = Object.entries(filter).filter(
    ([k, v]) => k !== 'grade' && Boolean(v)
  ).length;

  const formatDate = dateStr =>
    dateStr ? new Date(dateStr).toISOString() : null;

  //   const fetchQuestions = async () => {
  //     try {
  //       const params = {
  //         Grade: selectedGrades,
  //         ExamIds: selectedExams,
  //         Year: selectedYears,
  //         search: searchTerm,
  //         level: filter.level,
  //         type: filter.type,
  //         grade: filter.grade ? Number(filter.grade) : undefined,
  //         pageIndex: currentPage,
  //         pageSize: itemsPerPage,
  //         fromDate: formatDate(filter.fromDate),
  //         toDate: formatDate(filter.toDate),
  //         status: statusTab === 'removed' ? STATUS_TO_NUM.Removed : undefined,
  //       };

  //       if (statusTab === 'removed' && user?.email) {
  //         params.deletedBy = user.email;
  //         params.deletedByEmail = user.email;
  //         params.onlyMyDeleted = true;
  //       }

  //       const res = await getAllQuestions(params);
  //       const result = res.data?.data;
  //       const data = Array.isArray(result?.data) ? result.data : [];

  //       const formatted = data.map(q => {
  //         const createdBy =
  //           q.createdByEmail ||
  //           q.createdBy ||
  //           q.ownerEmail ||
  //           q.owner?.email ||
  //           q.userEmail;
  //         const isOwner =
  //           createdBy && user?.email
  //             ? normalize(createdBy) === normalize(user.email)
  //             : true;

  //         return { ...q, canEdit: isOwner, canDelete: isOwner };
  //       });

  //       const filtered =
  //         statusTab === 'removed' && user?.email
  //           ? formatted.filter(
  //               q => normalize(getDeletedByEmail(q)) === normalize(user.email)
  //             )
  //           : formatted;

  //       setQuestions(filtered);

  //       const countForPaging =
  //         statusTab === 'removed'
  //           ? filtered.length
  //           : result?.count || filtered.length;
  //       setTotalPages(Math.ceil(countForPaging / itemsPerPage));
  //     } catch (err) {
  //       console.error('Lỗi khi fetch câu hỏi:', err);
  //     }
  //   };

  const fetchQuestions = async () => {
    try {
      const params = {
        Grade: selectedGrades,
        ExamIds: selectedExams,
        Year: selectedYears,
        search: searchTerm,
        level: filter.level,
        type: filter.type,
        grade: filter.grade ? Number(filter.grade) : undefined,
        pageIndex: currentPage,
        pageSize: itemsPerPage,
        fromDate: formatDate(filter.fromDate),
        toDate: formatDate(filter.toDate),
      };

      // ---- LỌC TRẠNG THÁI NGAY Ở SERVER (tùy BE hỗ trợ) ----
      if (statusTab === 'removed') {
        // chỉ lấy Removed
        params.status = STATUS_TO_NUM.Removed;
      } else {
        // loại Removed: truyền đủ kiểu để BE nào cũng hiểu
        params.statuses = [
          STATUS_TO_NUM.Draft,
          STATUS_TO_NUM.AIDraft,
          STATUS_TO_NUM.Approved,
        ];
        params.excludeStatus = STATUS_TO_NUM.Removed;
        params.isRemoved = false;
      }

      // Chỉ xem “Đã xóa bởi tôi”
      if (statusTab === 'removed' && user?.email) {
        params.deletedBy = user.email;
        params.deletedByEmail = user.email;
        params.onlyMyDeleted = true;
      }

      const res = await getAllQuestions(params);
      const result = res.data?.data;
      const data = Array.isArray(result?.data) ? result.data : [];

      const formatted = data.map(q => {
        const createdBy =
          q.createdByEmail ||
          q.createdBy ||
          q.ownerEmail ||
          q.owner?.email ||
          q.userEmail;
        const isOwner =
          createdBy && user?.email
            ? normalize(createdBy) === normalize(user.email)
            : true;
        return { ...q, canEdit: isOwner, canDelete: isOwner };
      });

      // Bảo hiểm client-side (nếu BE chưa lọc)
      const filtered = formatted.filter(q => {
        const key = q.statusName || NUM_TO_STATUS[q.status] || 'Draft';
        return statusTab === 'removed' ? key === 'Removed' : key !== 'Removed';
      });

      // Nếu trang hiện tại rỗng (do vừa xóa hết hoặc do lọc), lùi về trang trước
      if (filtered.length === 0 && currentPage > 1) {
        setCurrentPage(p => Math.max(1, p - 1));
        return; // useEffect sẽ gọi lại fetchQuestions
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
    statusTab,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [statusTab]);

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
      await deleteQuestion(deleteModal.question.id);
      toast.success('Xoá câu hỏi thành công');
      setDeleteModal({ open: false, question: null });
      setStatusTab('removed');
      setCurrentPage(1); // <— về trang 1 của tab ĐÃ XÓA
    } catch (err) {
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

  const handleChangeStatus = async (row, newStatusKey) => {
    const id = row.id;
    const prevKey = row.statusName || NUM_TO_STATUS[row.status] || 'Draft';

    // Ở tab ĐÃ XÓA chỉ cho khôi phục về Draft
    if (
      statusTab === 'removed' &&
      newStatusKey !== 'Draft' &&
      newStatusKey !== 'Removed'
    ) {
      toast?.warning?.('Trong mục Đã xóa, chỉ có thể khôi phục về Nháp.');
      return;
    }

    // UI optimistic
    setQuestions(prev =>
      prev.map(q =>
        q.id === id
          ? {
              ...q,
              statusName: newStatusKey,
              status: STATUS_TO_NUM[newStatusKey],
            }
          : q
      )
    );

    const payload = {
      id: row.id,
      topicId: row.topicId ?? null,
      content: row.content ?? '',
      level:
        typeof row.level === 'number'
          ? row.level
          : LEVEL_TO_NUM[row.levelName] ?? 0,
      type:
        typeof row.type === 'number'
          ? row.type
          : TYPE_TO_NUM[row.typeName] ?? 0,
      answer1: row.answer1 ?? '',
      answer2: row.answer2 ?? '',
      answer3: row.answer3 ?? '',
      answer4: row.answer4 ?? '',
      answer5: row.answer5 ?? '',
      answer6: row.answer6 ?? '',
      grade: row.grade,
      status: STATUS_TO_NUM[newStatusKey],
      questionCode: row.questionCode ?? '',
    };

    setUpdatingId(id);
    try {
      await updateQuestion(payload);
      toast?.success?.('Cập nhật trạng thái thành công.');

      // Nếu trạng thái mới không còn thuộc tab hiện tại, refresh
      if (
        (statusTab === 'removed' && newStatusKey !== 'Removed') ||
        (statusTab === 'active' && newStatusKey === 'Removed')
      ) {
        fetchQuestions();
      }
    } catch (e) {
      // rollback
      setQuestions(prev =>
        prev.map(q =>
          q.id === id
            ? { ...q, statusName: prevKey, status: STATUS_TO_NUM[prevKey] }
            : q
        )
      );
      toast?.error?.('Cập nhật trạng thái thất bại.');
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
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
      render: (value, row) => {
        const curKey = row.statusName || NUM_TO_STATUS[row.status] || 'Draft';
        const canChange = row?.canEdit !== false;

        // Ở tab "ĐÃ XÓA": chỉ hiển thị Removed (disabled) + Draft (phục hồi)
        const options =
          statusTab === 'removed'
            ? [
                {
                  value: 'Removed',
                  label: STATUS_LABELS.Removed,
                  disabled: true,
                },
                { value: 'Draft', label: STATUS_LABELS.Draft },
              ]
            : Object.keys(STATUS_LABELS).map(k => ({
                value: k,
                label: STATUS_LABELS[k],
              }));

        return (
          <select
            className={
              'border rounded-md px-2 py-1 text-sm max-w-[120px] ' +
              (!canChange || updatingId === row.id
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : '')
            }
            value={curKey}
            onChange={e => handleChangeStatus(row, e.target.value)}
            disabled={!canChange || updatingId === row.id}
            title={
              canChange ? 'Đổi trạng thái' : 'Bạn không có quyền đổi trạng thái'
            }
          >
            {options.map(opt => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      },
    },
  ];

  // Ẩn cột "Lớp" nếu đã chọn tab 10/11/12
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
                  <GradeTabs
                    value={filter.grade}
                    onChange={v => setFilter({ ...filter, grade: v })}
                  />
                </div>
              }
              columns={effectiveColumns}
              data={questions}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={page => setCurrentPage(page)}
              actions={{
                view: handleView,
                edit: handleEdit,
                delete: handleAskDelete,
              }}
              actionIcons={{
                view: 'view',
                edit: row => (row?.canEdit === false ? 'edit' : 'edit'),
                delete: row => (row?.canEdit === false ? 'delete' : 'delete'),
              }}
              disableActions={{
                edit: row => row?.canEdit === false,
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

                  {/* Nút ĐÃ XÓA ở bên phải Lọc */}
                  <RemovedToggle
                    active={statusTab === 'removed'}
                    onToggle={() =>
                      setStatusTab(prev =>
                        prev === 'removed' ? 'active' : 'removed'
                      )
                    }
                  />

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

                      <div className='grid grid-cols-2 gap-2 mt-2'>
                        <div>
                          <label className='font-medium'>Từ ngày</label>
                          <input
                            type='date'
                            value={filter.fromDate}
                            onChange={e =>
                              setFilter({ ...filter, fromDate: e.target.value })
                            }
                            className='w-full border rounded px-2 py-1 text-sm'
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
                            className='w-full border rounded px-2 py-1 text-sm'
                          />
                        </div>
                      </div>

                      <div className='mt-4 flex justify-end gap-2'>
                        <CommonButton
                          onClick={() => {
                            setFilter({
                              level: '',
                              type: '',
                              grade: '',
                              fromDate: '',
                              toDate: '',
                            });
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

        {deleteModal.question?.content && (
          <div className='mb-5 p-3 bg-gray-50 rounded border text-xs text-gray-700 max-h-28 overflow-auto'>
            <div className='font-medium mb-1'>Nội dung:</div>
            <div className='line-clamp-4'>{deleteModal.question.content}</div>
          </div>
        )}

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
            {deleting ? 'Đang xoá…' : 'Xoá'}
          </PrimaryButton>
        </div>
      </ConfirmModal>
    </section>
  );
};

export default QuestionList;
