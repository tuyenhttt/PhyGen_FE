import { useEffect, useState } from 'react';
import Breadcrumb from '@/components/layouts/Breadcrumb';
import FilterBox from '@/components/layouts/FilterBox';
import ReusableTable from '@/components/table/ReusableTable';
import QuestionDetailModal from '@/components/ui/QuestionDetailModal';
import useExamCategories from '@/hooks/useExamCategories';
import { getAllQuestions } from '@/services/questionService';
import SearchInput from '@/components/ui/SearchInput';
import { IoFilter } from 'react-icons/io5';
import { MdOutlineClear } from 'react-icons/md';

const QuestionList = () => {
  const { examOptions } = useExamCategories();

  const [questions, setQuestions] = useState([]);
  const [selectedGrades, setSelectedGrades] = useState([]);
  const [selectedExams, setSelectedExams] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState({ level: '', type: '' });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const itemsPerPage = 10;
  const activeFilterCount = Object.values(filter).filter(Boolean).length;

  const gradeOptions = [
    { label: 'Lớp 10', value: '10' },
    { label: 'Lớp 11', value: '11' },
    { label: 'Lớp 12', value: '12' },
  ];

  const yearOptions = [
    { label: '2023', value: '2023' },
    { label: '2024', value: '2024' },
    { label: '2025', value: '2025' },
  ];

  const fetchQuestions = async () => {
    try {
      const res = await getAllQuestions({
        Grade: selectedGrades,
        ExamIds: selectedExams,
        Year: selectedYears,
        search: searchTerm,
        level: filter.level,
        type: filter.type,
        pageIndex: currentPage,
        pageSize: itemsPerPage,
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

  useEffect(() => {
    fetchQuestions();
  }, [
    selectedGrades,
    selectedExams,
    selectedYears,
    searchTerm,
    filter,
    currentPage,
  ]);

  const handleView = row => {
    setSelectedQuestion(row);
    setIsModalOpen(true);
  };

  const handleGradeChange = value => {
    setSelectedGrades(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const handleExamChange = value => {
    setSelectedExams(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const handleYearChange = value => {
    setSelectedYears(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

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
          ShortAnswer: 'Trả lời ngắn',
          Essay: 'Tự luận',
        };
        return typeMap[value] || value || '—';
      },
    },
  ];

  const filteredQuestions = questions.filter(q => {
    const matchSearch = q.content
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchLevel = filter.level ? q.levelName === filter.level : true;
    const matchType = filter.type ? q.typeName === filter.type : true;
    return matchSearch && matchLevel && matchType;
  });

  return (
    <section className='bg-gray-100 min-h-screen py-20 px-4 sm:px-8 lg:px-20'>
      <div className='max-w-6xl mx-auto'>
        <Breadcrumb />

        <div className='flex flex-col lg:flex-row gap-8'>
          {/* Sidebar lọc */}
          <aside className='w-full lg:w-1/4 flex flex-col gap-6'>
            <FilterBox
              title='Lọc theo Lớp'
              options={gradeOptions}
              selectedOptions={selectedGrades}
              onChange={handleGradeChange}
            />
            {Array.isArray(examOptions) && examOptions.length > 0 && (
              <FilterBox
                title='Lọc theo Kỳ thi'
                options={examOptions}
                selectedOptions={selectedExams}
                onChange={handleExamChange}
              />
            )}
            <FilterBox
              title='Lọc theo Năm'
              options={yearOptions}
              selectedOptions={selectedYears}
              onChange={handleYearChange}
            />
          </aside>

          {/* Main content */}
          <main className='w-full lg:w-3/4 flex flex-col gap-4'>
            <ReusableTable
              title='Danh sách câu hỏi'
              columns={columns}
              data={filteredQuestions}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={page => setCurrentPage(page)}
              actions={{ view: handleView }}
              actionIcons={{ view: 'view' }}
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
          </main>
        </div>

        {isModalOpen && selectedQuestion && (
          <QuestionDetailModal
            question={selectedQuestion}
            editMode={false}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </div>
    </section>
  );
};

export default QuestionList;
