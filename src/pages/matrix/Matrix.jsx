import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllMatrices } from '@/services/matrixService';
import Breadcrumb from '@/components/layouts/Breadcrumb';
import ExamPaperCard from '@/components/cards/ExamPaperCard';
import FilterBox from '@/components/layouts/FilterBox';
import PrimaryButton from '@/components/ui/PrimaryButton';
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

  const fetchMatrices = async () => {
    setIsLoading(true);
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

      const response = await getAllMatrices(params);

      const raw = response.data;
      const list = Array.isArray(raw.data?.data) ? raw.data.data : [];

      setMatrices(list);
      setTotalCount(raw.data?.count || 0);
    } catch (error) {
      console.error('Lỗi khi lấy ma trận:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatrices();
  }, [selectedGrades, selectedExams, selectedYears, pageIndex]);

  useEffect(() => {
    if (pageIndex > 1 && matrices.length === 0 && totalCount > 0) {
      setPageIndex(1);
    }
  }, [matrices, pageIndex, totalCount]);

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

  const handleNavigateMatrixDetail = id => {
    navigate(`/matrix/matrix-detail/${id}`);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <section className='bg-gray-100 min-h-screen py-20 px-4 sm:px-8 lg:px-20'>
      <div className='max-w-6xl mx-auto'>
        <div className='flex justify-between items-center mb-8'>
          <Breadcrumb />
          <PrimaryButton
            className='bg-gradient-to-r from-orange-500 to-yellow-400 text-white font-bold px-5 py-2 rounded-xl shadow-md hover:scale-105 transition-transform duration-200'
            onClick={handleNavigateUploadMatrix}
          >
            Tải lên Ma Trận
          </PrimaryButton>
        </div>
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
                    image={matrix.imgUrl}
                    title={matrix.name}
                    grade={matrix.grade}
                    year={matrix.year}
                    description={matrix.description}
                    onClick={() => handleNavigateMatrixDetail(matrix.id)}
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
                  className='px-4 py-2 border rounded disabled:opacity-50 cursor-pointer'
                >
                  Trước
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    return (
                      page === 1 ||
                      page === totalPages ||
                      (page >= pageIndex - 1 && page <= pageIndex + 1)
                    );
                  })
                  .reduce((acc, page, idx, arr) => {
                    if (idx > 0 && arr[idx - 1] !== page - 1) {
                      acc.push('ellipsis');
                    }
                    acc.push(page);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === 'ellipsis' ? (
                      <span key={`e-${idx}`} className='px-2'>
                        ...
                      </span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setPageIndex(item)}
                        className={`px-4 py-2 border cursor-pointer rounded ${
                          pageIndex === item
                            ? 'bg-orange-500 text-white'
                            : 'bg-white'
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}

                <button
                  onClick={() =>
                    setPageIndex(p => (p < totalPages ? p + 1 : p))
                  }
                  disabled={pageIndex >= totalPages}
                  className='px-4 py-2 border rounded disabled:opacity-50 cursor-pointer'
                >
                  Sau
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </section>
  );
};

export default Matrix;
