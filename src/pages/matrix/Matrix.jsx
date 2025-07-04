import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllMatrices } from '@/services/matrixService';
import Breadcrumb from '@/components/layouts/Breadcrumb';
import ExamPaperCard from '@/components/cards/ExamPaperCard';
import FilterBox from '@/components/layouts/FilterBox';
import PrimaryButton from '@/components/ui/PrimaryButton';
import banner from '@assets/images/Banner1.jpg';
import useExamCategories from '@/hooks/useExamCategories';

const Matrix = () => {
  const [selectedGrades, setSelectedGrades] = useState([]);
  const [selectedExams, setSelectedExams] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [matrices, setMatrices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(6);
  const [totalCount, setTotalCount] = useState(0);

  const { examOptions } = useExamCategories();
  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchMatrices = async () => {
      try {
        setIsLoading(true);
        const res = await getAllMatrices({
          PageIndex: pageIndex,
          PageSize: pageSize,
          Grade: selectedGrades.join(','),
          Year: selectedYears.join(','),
          ExamCategoryId: selectedExams.join(','),
        });

        const { data } = res.data;
        setMatrices(data.data || []);
        setTotalCount(data.count || 0);
      } catch (error) {
        console.error('Lỗi khi lấy ma trận:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatrices();
  }, [pageIndex, selectedGrades, selectedExams, selectedYears]);

  const handleNavigateUploadMatrix = () => {
    navigate('/matrix/upload-matrix');
  };

  const handleGradeChange = value => {
    setPageIndex(1);
    setSelectedGrades(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const handleExamChange = value => {
    setPageIndex(1);
    setSelectedExams(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const handleYearChange = value => {
    setPageIndex(1);
    setSelectedYears(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  return (
    <section className='bg-gray-100 min-h-screen py-20 px-4 sm:px-8 lg:px-20'>
      <div className='max-w-6xl mx-auto'>
        <Breadcrumb />

        <div className='flex flex-col lg:flex-row gap-8'>
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

          <main className='w-full lg:w-3/4 flex flex-col gap-4'>
            {isLoading ? (
              <p className='text-center text-gray-500'>Đang tải dữ liệu...</p>
            ) : matrices.length === 0 ? (
              <p className='text-center text-gray-500'>
                Không có ma trận để hiển thị.
              </p>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                {matrices.map(matrix => (
                  <ExamPaperCard
                    key={matrix.id}
                    image={banner}
                    title={matrix.name}
                    grade={matrix.grade}
                    year={matrix.year}
                    description={matrix.description}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalCount > pageSize && (
              <div className='flex justify-center mt-6 gap-4'>
                <button
                  onClick={() => setPageIndex(p => Math.max(1, p - 1))}
                  disabled={pageIndex === 1}
                  className='px-4 py-2 bg-white border rounded disabled:opacity-50'
                >
                  Trang trước
                </button>
                <span className='px-4 py-2'>{pageIndex}</span>
                <button
                  onClick={() =>
                    setPageIndex(p =>
                      p < Math.ceil(totalCount / pageSize) ? p + 1 : p
                    )
                  }
                  disabled={pageIndex >= Math.ceil(totalCount / pageSize)}
                  className='px-4 py-2 bg-white border rounded disabled:opacity-50'
                >
                  Trang sau
                </button>
              </div>
            )}
          </main>
        </div>

        <div className='bg-[#BFD6FF] rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-4 mt-15 shadow-md mt-10'>
          <p className='text-base md:text-lg font-semibold text-[#1B2559]'>
            Tải lên Ma Trận của bạn
          </p>
          <PrimaryButton onClick={handleNavigateUploadMatrix}>
            Tải lên Ma Trận
          </PrimaryButton>
        </div>
      </div>
    </section>
  );
};

export default Matrix;
