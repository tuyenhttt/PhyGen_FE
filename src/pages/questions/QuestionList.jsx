import Breadcrumb from '@/components/layouts/Breadcrumb';
import FilterBox from '@/components/layouts/FilterBox';
import ReusableTable from '@/components/table/ReusableTable';
import PrimaryButton from '@/components/ui/PrimaryButton';
import QuestionDetailModal from '@/components/ui/QuestionDetailModal';
import useExamCategories from '@/hooks/useExamCategories';
import { getAllQuestions } from '@/services/questionService';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const QuestionList = () => {
  const [selectedGrades, setSelectedGrades] = useState([]);
  const [selectedExams, setSelectedExams] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('Tất cả');
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { examOptions } = useExamCategories();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await getAllQuestions({
          Grade: selectedGrades,
          ExamIds: selectedExams,
          Year: selectedYears,
          Type: selectedFilter === 'Tất cả' ? undefined : selectedFilter,
          Page: currentPage,
          PageSize: 10,
        });

        const rawData = res.data?.data?.data || [];
        console.log('Dữ liệu câu hỏi:', rawData);
        setData(rawData);
        setTotalPages(res.data?.pagination?.totalPages || 1);
      } catch (err) {
        console.error('Lỗi khi lấy danh sách câu hỏi:', err);
      }
    };

    fetchQuestions();
  }, [
    selectedGrades,
    selectedExams,
    selectedYears,
    selectedFilter,
    currentPage,
  ]);

  const columns = [
    {
      header: 'STT',
      render: (_, __, index) => (currentPage - 1) * 10 + index + 1,
    },
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

  const handleView = row => {
    setSelectedQuestion(row);
    setIsModalOpen(true);
  };

  const gradeOptions = [
    { label: 'Lớp 10', value: '10' },
    { label: 'Lớp 11', value: '11' },
    { label: 'Lớp 12', value: '12' },
  ];

  const yearOptions = [
    { label: '2023 ', value: '2023' },
    { label: '2024', value: '2024' },
    { label: '2025', value: '2025' },
  ];

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

  const handleNavigateUploadQuestion = () => {
    navigate('/question/upload-question');
  };

  return (
    <>
      <section className='bg-gray-100 min-h-screen py-20 px-4 sm:px-8 lg:px-20'>
        <div className='max-w-6xl mx-auto'>
          {/* Title */}
          <Breadcrumb />

          {/* Layout */}
          <div className='flex flex-col lg:flex-row gap-8'>
            {/* Sidebar (Filter) */}
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

            {/* Main content (Cards) */}
            <main className='w-full lg:w-3/4 flex flex-col gap-4'>
              <ReusableTable
                title={'Danh sách câu hỏi'}
                columns={columns}
                data={data}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={page => setCurrentPage(page)}
                actions={{ view: handleView }}
                actionIcons={{ view: 'view' }}
              />
            </main>
            {isModalOpen && selectedQuestion && (
              <QuestionDetailModal
                question={selectedQuestion}
                onClose={() => setIsModalOpen(false)}
              />
            )}
          </div>
        </div>

        {/* Banner Upload */}
        <div className='bg-[#BFD6FF] rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-4 mt-15 shadow-md'>
          <div className='flex items-center gap-4'>
            <p className='text-base md:text-lg font-semibold text-[#1B2559]'>
              Tải lên câu hỏi của riêng bạn
            </p>
          </div>

          <div className='flex gap-8'>
            <PrimaryButton onClick={handleNavigateUploadQuestion}>
              Tải lên Câu hỏi
            </PrimaryButton>
          </div>
        </div>
      </section>
    </>
  );
};

export default QuestionList;
