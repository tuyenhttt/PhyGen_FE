import Breadcrumb from '@/components/layouts/Breadcrumb';
import ExamPaperCard from '@/components/cards/ExamPaperCard';
import FilterBox from '@/components/layouts/FilterBox';
import PrimaryButton from '@/components/ui/PrimaryButton';
import banner from '@assets/images/Banner1.jpg';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useExamCategories from '@/hooks/useExamCategories';

const ExamList = () => {
  const [selectedGrades, setSelectedGrades] = useState([]);
  const [selectedExams, setSelectedExams] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('Tất cả');

  const { examOptions } = useExamCategories();

  const navigate = useNavigate();

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

  const filterOptions = ['Tất cả', 'Ma trận', 'Đề thi'];

  const handleNavigateCreateExamPaper = () => {
    navigate('/exam-paper/create-exam-paper');
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

  const handleFilterChange = event => {
    setSelectedFilter(event.target.value);
  };

  return (
    <>
      {/* Section navigate */}
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
              {/* Filter Dropdown nằm phía trên Cards */}
              <div className='mb-4 flex justify-end'>
                <select
                  value={selectedFilter}
                  onChange={handleFilterChange}
                  className='w-40 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                >
                  {filterOptions.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cards grid */}
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                {Array(6)
                  .fill(0)
                  .map((_, index) => (
                    <ExamPaperCard key={index} image={banner} />
                  ))}
              </div>
            </main>
          </div>
        </div>

        {/* Banner Upload */}
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
      </section>
    </>
  );
};

export default ExamList;
