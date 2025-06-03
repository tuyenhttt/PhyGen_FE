import Breadcrumb from '@/components/layouts/Breadcrumb';
import FilterBox from '@/components/layouts/FilterBox';
import Footer from '@/components/layouts/Footer';
import Header from '@/components/layouts/Header';
import ReusableTable from '@/components/table/ReusableTable';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { useState } from 'react';

const QuestionList = () => {
  const [selectedGrades, setSelectedGrades] = useState([]);
  const [selectedExams, setSelectedExams] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('Tất cả');

  const data = [
    {
      question: 'Michael A. Miner',
    },
  ];

  const handleView = row => {
    alert(`Xem chi tiết: ${row.name}`);
  };

  const handleEdit = row => {
    alert(`Sửa: ${row.name}`);
  };

  const handleDelete = row => {
    alert(`Xoá: ${row.name}`);
  };

  const gradeOptions = [
    { label: 'Lớp 10', value: '10' },
    { label: 'Lớp 11', value: '11' },
    { label: 'Lớp 12', value: '12' },
  ];

  const examOptions = [
    { label: 'Giữa kỳ 1 ', value: 'Giữa kỳ 1' },
    { label: 'Cuối kỳ 1', value: 'Cuối kỳ 1' },
    { label: 'Giữa kỳ 2', value: 'Giữa kỳ 2' },
    { label: 'Cuối kỳ 2', value: 'Cuối kỳ 2' },
  ];

  const yearOptions = [
    { label: '2023 ', value: '2023' },
    { label: '2024', value: '2024' },
    { label: '2025', value: '2025' },
  ];

  const filterOptions = ['Tất cả', 'Ma trận', 'Đề thi'];

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

  const columns = [{ header: 'Câu hỏi', accessor: 'question' }];

  return (
    <>
      <Header />

      <section className='bg-gray-50 min-h-screen py-20 px-4 sm:px-8 lg:px-20'>
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
              <FilterBox
                title='Lọc theo Kỳ thi'
                options={examOptions}
                selectedOptions={selectedExams}
                onChange={handleExamChange}
              />
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
                  {filterOptions.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <ReusableTable
                title={'Danh sách câu hỏi của bạn'}
                columns={columns}
                data={data}
                currentPage={1}
                totalPages={3}
                onPageChange={page => console.log('Go to page:', page)}
                actions={{
                  view: handleView,
                  edit: handleEdit,
                  delete: handleDelete,
                }}
              />
            </main>
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
            <PrimaryButton>Tải lên Câu hỏi</PrimaryButton>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default QuestionList;
