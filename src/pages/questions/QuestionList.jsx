import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '@/components/layouts/Breadcrumb';
import ReusableTable from '@/components/table/ReusableTable';
import QuestionDetailModal from '@/components/ui/QuestionDetailModal';
import { getAllQuestions } from '@/services/questionService';
import SearchInput from '@/components/ui/SearchInput';
import { IoFilter } from 'react-icons/io5';
import { MdOutlineClear } from 'react-icons/md';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import CommonButton from '@/components/ui/CommonButton';
import { getTopic } from '@/services/topicService';

const QuestionList = () => {
  const navigate = useNavigate();

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

  const itemsPerPage = 10;
  const activeFilterCount = Object.values(filter).filter(Boolean).length;

  const formatDate = dateStr =>
    dateStr ? new Date(dateStr).toISOString() : null;

  const fetchQuestions = async () => {
    try {
      const res = await getAllQuestions({
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
      });

      const result = res.data?.data;
      const data = Array.isArray(result?.data) ? result.data : [];

      const formatted = data.map((q, index) => ({
        ...q,
        no: (currentPage - 1) * itemsPerPage + index + 1,
      }));

      setQuestions(formatted);
      setTotalPages(Math.ceil(result?.count / itemsPerPage));
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
    fetchQuestions();
    fetchTopics();
  }, [
    selectedGrades,
    selectedExams,
    selectedYears,
    searchTerm,
    filter,
    currentPage,
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
    setSelectedQuestion(row);
    setEditMode(true);
    setIsModalOpen(true);
  };

  const handleNavigateUploadQuestion = () => {
    navigate('/question/upload-question');
  };

  const columns = [
    { header: 'STT', accessor: 'no' },
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
  ];

  return (
    <section className='bg-gray-100 min-h-screen py-20 px-4 sm:px-8 lg:px-20'>
      <div className='max-w-6xl mx-auto'>
        <div className='flex justify-between items-center mb-8'>
          <Breadcrumb />
          <PrimaryButton
            className='bg-gradient-to-r from-orange-500 to-yellow-400 text-white font-bold px-5 py-2 rounded-xl shadow-md hover:scale-105 transition-transform duration-200'
            onClick={handleNavigateUploadQuestion}
          >
            Tải lên câu hỏi
          </PrimaryButton>
        </div>

        {/* Main content */}
        <div className='flex flex-col gap-6'>
          <MathJaxContext config={{ tex: { inlineMath: [['$', '$']] } }}>
            <ReusableTable
              title='Danh sách câu hỏi'
              columns={columns}
              data={questions}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={page => setCurrentPage(page)}
              actions={{ view: handleView, edit: handleEdit }}
              actionIcons={{ view: 'view', edit: 'edit' }}
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
                          className='text-gray-500 hover:text-gray-700'
                        >
                          <MdOutlineClear size={18} />
                        </button>
                      </div>

                      <div className='space-y-2 text-sm'>
                        {/* Mức độ */}
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

                        {/* Loại câu hỏi */}
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
                      </div>

                      {/* Ngày tạo */}
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
    </section>
  );
};

export default QuestionList;
