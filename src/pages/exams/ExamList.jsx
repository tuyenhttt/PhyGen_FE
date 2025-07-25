import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '@/components/layouts/Breadcrumb';
import ExamPaperCard from '@/components/cards/ExamPaperCard';
import FilterBox from '@/components/layouts/FilterBox';
import PrimaryButton from '@/components/ui/PrimaryButton';
import banner from '@assets/images/Banner1.jpg';
import { getAllExams } from '@/services/examService';
import useExamCategories from '@/hooks/useExamCategories';

const ExamList = () => {
  const navigate = useNavigate();
  const { examOptions } = useExamCategories();

  const [selectedGrades, setSelectedGrades] = useState([]);
  const [selectedExams, setSelectedExams] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [exams, setExams] = useState([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(6);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

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

  const fetchExams = async () => {
    setIsLoading(true);
    setHasError(false);

    try {
      const selectedExamLabels = selectedExams
        .map(id => examOptions.find(o => o.value === id)?.label)
        .filter(Boolean);

      const params = {
        pageIndex,
        pageSize,
        ...(selectedGrades.length && { Grade: selectedGrades }),
        ...(selectedYears.length && { Year: selectedYears }),
        ...(selectedExamLabels.length && { ExamCategory: selectedExamLabels }),
      };

      const response = await getAllExams(params);
      const data = response.data?.data;

      setExams(data?.data || []);
      setTotalCount(data?.count || 0);
    } catch (err) {
      console.error('Lỗi khi gọi API:', err);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [selectedGrades, selectedExams, selectedYears, pageIndex]);

  const handleNavigateCreateExamPaper = () => {
    navigate('/exam-paper/create-exam-paper');
  };

  const handleGradeChange = value =>
    setSelectedGrades(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );

  const handleExamChange = value =>
    setSelectedExams(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );

  const handleYearChange = value =>
    setSelectedYears(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );

  const handleNavigateExamDetail = examId => {
    navigate(`/exam/${examId}/exam-detail`);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <section className='bg-gray-100 min-h-screen py-20 px-4 sm:px-8 lg:px-20'>
      <div className='max-w-6xl mx-auto'>
        <Breadcrumb />

        <div className='flex flex-col lg:flex-row gap-8'>
          {/* Filter Sidebar */}
          <aside className='w-full lg:w-1/4 flex flex-col gap-6'>
            <FilterBox
              title='Lọc theo Lớp'
              options={gradeOptions}
              selectedOptions={selectedGrades}
              onChange={handleGradeChange}
            />
            {examOptions?.length > 0 && (
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

          {/* Main Content */}
          <main className='w-full lg:w-3/4 flex flex-col gap-4'>
            {/* Card Grid */}
            {isLoading ? (
              <p className='text-center text-gray-500'>Đang tải đề thi...</p>
            ) : hasError ? (
              <p className='text-center text-red-600'>Lỗi khi tải dữ liệu.</p>
            ) : exams.length === 0 ? (
              <p className='text-center text-gray-500'>Không có đề thi nào.</p>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                {exams.map(exam => (
                  <ExamPaperCard
                    key={exam.id}
                    title={exam.title}
                    grade={exam.grade}
                    year={exam.year}
                    image={exam.imgUrl}
                    description={exam.description}
                    onClick={() => handleNavigateExamDetail(exam.id)}
                  />
                ))}
              </div>
            )}

            {/* Custom Pagination */}
            {totalPages > 1 && (
              <div className='flex justify-center mt-6 gap-2'>
                <button
                  onClick={() => setPageIndex(p => Math.max(1, p - 1))}
                  disabled={pageIndex === 1}
                  className='px-4 py-2 border rounded disabled:opacity-50'
                >
                  Trước
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPageIndex(i + 1)}
                    className={`px-4 py-2 border rounded ${
                      pageIndex === i + 1
                        ? 'bg-orange-500 text-white'
                        : 'bg-white'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() =>
                    setPageIndex(p => (p < totalPages ? p + 1 : p))
                  }
                  disabled={pageIndex >= totalPages}
                  className='px-4 py-2 border rounded disabled:opacity-50'
                >
                  Sau
                </button>
              </div>
            )}
          </main>
        </div>

        {/* Upload Banner */}
        <div className='bg-[#BFD6FF] rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-4 mt-15 shadow-md'>
          <div className='flex items-center gap-4'>
            <p className='text-base md:text-lg font-semibold text-[#1B2559]'>
              Tạo đề thi của riêng bạn
            </p>
          </div>
          <div className='flex gap-8'>
            <PrimaryButton onClick={handleNavigateCreateExamPaper}>
              Tạo Đề Thi
            </PrimaryButton>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExamList;
