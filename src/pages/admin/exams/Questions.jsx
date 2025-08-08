import { useEffect, useState } from 'react';
import ReusableTable from '@/components/table/ReusableTable';
import {
  deleteQuestion,
  getAllQuestions,
  postQuestion,
  updateQuestion,
} from '@/services/questionService';
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

  const itemsPerPage = 10;
  const activeFilterCount = Object.values(filter).filter(Boolean).length;

  const formatDate = dateStr =>
    dateStr ? new Date(dateStr).toISOString() : null;

  const fetchData = async () => {
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
        }),
        getTopic(),
      ]);

      const topicsData = Array.isArray(topicsRes.data)
        ? topicsRes.data
        : Array.isArray(topicsRes.data.data)
        ? topicsRes.data.data
        : [];
      setTopics(topicsData);

      const result = questionsRes.data?.data;
      const data = Array.isArray(result?.data) ? result.data : [];

      const formatted = data.map((q, i) => ({
        ...q,
        no: (currentPage - 1) * itemsPerPage + i + 1,
        levelName: q.levelName || '—',
        typeName: q.typeName || '—',
      }));

      setQuestions(formatted);
      setTotalPages(Math.ceil(result?.count / itemsPerPage));
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
    try {
      await deleteQuestion(deleteModal.question.id);
      toast.success('Xoá câu hỏi thành công');
      setDeleteModal({ open: false, question: null });

      fetchData();
    } catch (err) {
      console.error('Lỗi khi xoá:', err);
      toast.error('Lỗi khi xoá câu hỏi');
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

  const columns = [
    { header: 'STT', accessor: 'no' },
    {
      header: 'Nội dung câu hỏi',
      accessor: 'content',
      render: value => (
        <MathJax dynamic>
          <div className='max-w-[300px] truncate' title={value}>
            {value}
          </div>
        </MathJax>
      ),
    },
    {
      header: 'Chủ đề',
      accessor: 'topicId',
      render: id => (
        <div
          className='truncate max-w-[150px]'
          title={topics.find(t => t.id === id)?.name || '—'}
        >
          {topics.find(t => t.id === id)?.name || ''}
        </div>
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
  ];

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
          title='Danh sách câu hỏi'
          columns={columns}
          data={questions}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          actions={{ view: handleView, edit: handleEdit, delete: handleDelete }}
          actionIcons={{ view: 'view', edit: 'edit', delete: 'delete' }}
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

                    {/* Lớp */}
                    <div>
                      <label className='font-medium'>Khối lớp</label>
                      <select
                        value={filter.grade}
                        onChange={e =>
                          setFilter({ ...filter, grade: e.target.value })
                        }
                        className='w-full mt-1 border rounded px-2 py-1'
                      >
                        <option value=''>Tất cả</option>
                        <option value='10'>Lớp 10</option>
                        <option value='11'>Lớp 11</option>
                        <option value='12'>Lớp 12</option>
                      </select>
                    </div>

                    {/* Ngày tạo */}
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
