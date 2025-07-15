import { useEffect, useState } from 'react';
import ReusableTable from '@/components/table/ReusableTable';
import { deleteQuestion, getAllQuestions } from '@/services/questionService';
import SearchInput from '@/components/ui/SearchInput';
import { IoFilter } from 'react-icons/io5';
import { MdOutlineClear } from 'react-icons/md';
import { FaPlus } from 'react-icons/fa';
import QuestionDetailModal from '@/components/ui/QuestionDetailModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { toast } from 'react-toastify';

const Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState({ level: '', type: '' });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    question: null,
  });

  const activeFilterCount = Object.values(filter).filter(Boolean).length;
  const itemsPerPage = 10;

  const fetchQuestions = async () => {
    const formatDate = dateStr => {
      return dateStr ? new Date(dateStr).toISOString() : null;
    };

    try {
      const res = await getAllQuestions({
        pageIndex: currentPage,
        pageSize: itemsPerPage,
        search: searchTerm,
        level: filter.level,
        type: filter.type,
        fromDate: formatDate(filter.fromDate),
        toDate: formatDate(filter.toDate),
      });

      const result = res.data?.data;
      const data = Array.isArray(result?.data) ? result.data : [];

      const formatted = data.map((q, index) => ({
        ...q,
        no: (currentPage - 1) * itemsPerPage + index + 1,
      }));

      setQuestions(formatted);
      setTotalPages(Math.ceil(result?.count / itemsPerPage));
    } catch (error) {
      console.error('Lỗi khi lấy câu hỏi:', error);
      setQuestions([]);
      setTotalPages(1);
    }
  };

  useEffect(() => {
    fetchQuestions(currentPage);
  }, [currentPage]);

  const columns = [
    { header: 'STT', accessor: 'no' },
    {
      header: 'Nội dung câu hỏi',
      accessor: 'content',
      render: value => (
        <div className='max-w-[350px] truncate' title={value}>
          {value}
        </div>
      ),
    },
    {
      header: 'Mức độ',
      accessor: 'levelName',
      render: value => {
        const levelMap = {
          NhậnBiết: 'Nhận biết',
          ThôngHiểu: 'Thông hiểu',
          VậnDụng: 'Vận dụng',
          3: 'Nâng cao',
        };
        return levelMap[value] || value || '—';
      },
    },
    {
      header: 'Loại',
      accessor: 'typeName',
      render: value => {
        const typeMap = {
          MultipleChoice: 'Trắc nghiệm',
          TrueFalse: 'Đúng/Sai',
          ShortAnswer: 'Trắc nghiệm trả lời ngắn',
          Essay: 'Tự luận',
        };
        return typeMap[value] || value || '—';
      },
    },
  ];

  const handleViewQuestion = row => {
    setSelectedQuestion(row);
    setIsModalOpen(true);
    setEditMode(false);
  };

  const handleEditQuestion = row => {
    setSelectedQuestion(row);
    setEditMode(true);
    setIsModalOpen(true);
  };

  const confirmDeleteQuestion = async () => {
    try {
      await deleteQuestion(deleteModal.question.id);
      toast.success('Xoá câu hỏi thành công');
      setDeleteModal({ open: false, question: null });
      fetchQuestions();
    } catch (error) {
      console.error('Lỗi khi xoá câu hỏi:', error);
      toast.error('Lỗi khi xoá câu hỏi');
    }
  };

  const handleDeleteQuestion = question => {
    setDeleteModal({ open: true, question });
  };

  const filteredQuestions = questions.filter(q => {
    const matchSearch = q.content
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchLevel = filter.level ? q.levelName === filter.level : true;
    const matchType = filter.type ? q.typeName === filter.type : true;
    const createdAt = new Date(questions.rawDate);
    const from = filter.fromDate ? new Date(filter.fromDate) : null;
    const to = filter.toDate ? new Date(filter.toDate) : null;

    const matchesDate =
      (!from || createdAt >= from) && (!to || createdAt <= to);
    return matchSearch && matchLevel && matchType && matchesDate;
  });

  return (
    <div className='p-4 space-y-6'>
      <div className='flex justify-between items-center mb-5'>
        <h2 className='text-2xl font-bold text-gray-800 tracking-tight mb-5'>
          Danh sách câu hỏi
        </h2>
        <button
          onClick={console.log('Thêm câu hỏi hay sao mà click dô')}
          className='bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition duration-200'
        >
          <FaPlus /> Thêm câu hỏi
        </button>
      </div>

      <ReusableTable
        title='Danh sách câu hỏi '
        columns={columns}
        data={filteredQuestions}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={page => setCurrentPage(page)}
        actions={{
          view: handleViewQuestion,
          edit: handleEditQuestion,
          delete: handleDeleteQuestion,
        }}
        actionIcons={{
          view: 'view',
          edit: 'edit',
          delete: 'delete',
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
                      <option value='NhậnBiết'>Nhận biết</option>
                      <option value='ThôngHiểu'>Thông hiểu</option>
                      <option value='VậnDụng'>Vận dụng</option>
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
                      <option value='MultipleChoice'>Trắc nghiệm</option>
                      <option value='TrueFalse'>Đúng/Sai</option>
                      <option value='ShortAnswer'>Trả lời ngắn</option>
                      <option value='Essay'>Tự luận</option>
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

      {isModalOpen && selectedQuestion && (
        <QuestionDetailModal
          question={selectedQuestion}
          editMode={editMode}
          onClose={() => {
            setIsModalOpen(false);
            fetchQuestions();
          }}
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
