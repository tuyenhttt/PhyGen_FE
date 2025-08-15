import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllExams } from '@/services/examService';
import useExamCategories from '@/hooks/useExamCategories';
import Breadcrumb from '@/components/layouts/Breadcrumb';
import ExamPaperCard from '@/components/cards/ExamPaperCard';
import PrimaryButton from '@/components/ui/PrimaryButton';
import FilterButton from '@/components/ui/FilterButton';
import SearchInput from '@/components/ui/SearchInput';
import MultiSelectDropdown from '@/components/ui/MultiSelectDropdown';
import { SlCalender } from 'react-icons/sl';
import { PiExamBold } from 'react-icons/pi';

const TABS = [
  { label: 'Lớp 10', value: '10' },
  { label: 'Lớp 11', value: '11' },
  { label: 'Lớp 12', value: '12' },
];

const YEAR_OPTIONS = [
  { label: '2023', value: '2023' },
  { label: '2024', value: '2024' },
  { label: '2025', value: '2025' },
];

const ExamList = () => {
  const navigate = useNavigate();
  const { examOptions = [] } = useExamCategories();

  const orangeBtn =
    'bg-gradient-to-r from-orange-500 to-yellow-400 text-white font-bold px-5 py-2 rounded-xl shadow-md hover:opacity-95 active:scale-[0.98] transition-all';

  // Filters
  const [activeGrade, setActiveGrade] = useState('10');
  const [selectedExams, setSelectedExams] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [searchText, setSearchText] = useState('');

  // Data
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(6);
  const [totalCount, setTotalCount] = useState(0);

  // Menu state (dropdowns)
  const [openMenu, setOpenMenu] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const onClick = e => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setOpenMenu(null);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Reset page khi đổi filter
  useEffect(
    () => setPageIndex(1),
    [activeGrade, selectedExams, selectedYears, searchText]
  );

  const headerFilters = useMemo(
    () => ({
      grade: activeGrade ? [activeGrade] : [],
      exams: selectedExams,
      years: selectedYears,
      q: searchText?.trim(),
    }),
    [activeGrade, selectedExams, selectedYears, searchText]
  );

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
        ...(headerFilters.grade.length && { Grade: headerFilters.grade }),
        ...(headerFilters.years.length && { Year: headerFilters.years }),
        ...(selectedExamLabels.length && { ExamCategory: selectedExamLabels }),
        ...(headerFilters.q && { Search: headerFilters.q }), // thêm search (nếu BE hỗ trợ)
      };

      const res = await getAllExams(params);
      const data = res?.data?.data || {};
      const list = data.data || data.items || data.results || [];
      const count =
        data.count ??
        data.total ??
        data.TotalCount ??
        data.total_count ??
        data.examsTotal ??
        (pageIndex === 1 ? list.length : 0);

      setExams(Array.isArray(list) ? list : []);
      setTotalCount(Number(count) || 0);
    } catch (e) {
      console.error('Lỗi khi gọi API:', e);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [activeGrade, selectedExams, selectedYears, searchText, pageIndex]);

  const handleNavigateCreateExamPaper = () => navigate('/exam/create-exam');
  const handleNavigateExamDetail = id => navigate(`/exam/${id}/exam-detail`);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / pageSize));
  const showPagination = totalCount > pageSize;

  return (
    <section className='bg-gray-100 min-h-screen py-20 px-4 sm:px-8 lg:px-20'>
      <div className='max-w-6xl mx-auto'>
        {/* Top Row */}
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4'>
          <Breadcrumb />
          <PrimaryButton
            className={orangeBtn}
            onClick={handleNavigateCreateExamPaper}
          >
            Tạo đề thi
          </PrimaryButton>
        </div>

        {/* Menu Tabs */}
        <div
          className='flex flex-col md:flex-row md:items-center md:justify-between rounded-2xl bg-white px-3 sm:px-4 py-5 shadow-sm mb-12 gap-5 md:gap-0'
          ref={menuRef}
        >
          {/* LEFT: Tabs */}
          <div className='flex flex-wrap items-center gap-5'>
            {TABS.map(tab => {
              const active = activeGrade === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveGrade(tab.value)}
                  type='button'
                  className={[
                    'px-5 w-[80px] sm:px-4 py-2 rounded-full text-sm font-medium cursor-pointer',
                    active
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'text-blue-700 bg-white hover:bg-green-50 border border-blue-800',
                  ].join(' ')}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* RIGHT: Search + Filters */}
          <div className='flex items-center gap-2 sm:gap-3'>
            <SearchInput
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              placeholder='Tìm đề thi...'
            />

            {/* Kỳ thi */}
            <div className='relative'>
              <FilterButton
                label='Kỳ thi'
                count={selectedExams.length}
                isOpen={openMenu === 'exam'}
                onClick={() => setOpenMenu(m => (m === 'exam' ? null : 'exam'))}
                icon={<PiExamBold size={20} />}
                color={{
                  light: 'text-blue-700',
                  soft: 'bg-blue-100 text-blue-800',
                  border: 'border-blue-800',
                }}
              />
              {openMenu === 'exam' && (
                <MultiSelectDropdown
                  items={examOptions}
                  selectedValues={selectedExams}
                  onToggle={val =>
                    setSelectedExams(prev =>
                      prev.includes(val)
                        ? prev.filter(v => v !== val)
                        : [...prev, val]
                    )
                  }
                  className='w-64'
                  onClickOutside={() => setOpenMenu(null)}
                />
              )}
            </div>

            {/* Năm */}
            <div className='relative'>
              <FilterButton
                label='Năm'
                count={selectedYears.length}
                isOpen={openMenu === 'year'}
                onClick={() => setOpenMenu(m => (m === 'year' ? null : 'year'))}
                icon={<SlCalender size={18} />}
                color={{
                  light: 'text-blue-700',
                  soft: 'bg-blue-100 text-blue-800',
                  border: 'border-blue-800',
                }}
              />
              {openMenu === 'year' && (
                <MultiSelectDropdown
                  items={YEAR_OPTIONS}
                  selectedValues={selectedYears}
                  onToggle={val =>
                    setSelectedYears(prev =>
                      prev.includes(val)
                        ? prev.filter(v => v !== val)
                        : [...prev, val]
                    )
                  }
                  className='w-40'
                  onClickOutside={() => setOpenMenu(null)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <main className='w-full flex flex-col gap-6'>
          {isLoading ? (
            <p className='text-center text-gray-500'>Đang tải đề thi...</p>
          ) : hasError ? (
            <p className='text-center text-red-600'>Lỗi khi tải dữ liệu.</p>
          ) : exams.length === 0 ? (
            <p className='text-center text-gray-500'>Không có đề thi nào.</p>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
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

          {/* Pagination */}
          {showPagination && (
            <div className='flex justify-center items-center gap-2 mt-2'>
              <button
                onClick={() => {
                  setPageIndex(p => Math.max(1, p - 1));
                  scrollToTop();
                }}
                disabled={pageIndex === 1}
                className='px-4 py-2 rounded border border-blue-800 disabled:opacity-50'
              >
                Trước
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  page =>
                    page === 1 ||
                    page === totalPages ||
                    (page >= pageIndex - 1 && page <= pageIndex + 1)
                )
                .reduce((acc, page, idx, arr) => {
                  if (idx > 0 && arr[idx - 1] !== page - 1)
                    acc.push('ellipsis');
                  acc.push(page);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === 'ellipsis' ? (
                    <span key={`e-${idx}`} className='px-2 text-blue-700'>
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => {
                        setPageIndex(item);
                        scrollToTop();
                      }}
                      className={`px-4 py-2 rounded border border-blue-800 ${
                        pageIndex === item
                          ? 'bg-orange-500 text-white border-transparent'
                          : 'bg-white'
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}

              <button
                onClick={() => {
                  setPageIndex(p => (p < totalPages ? p + 1 : p));
                  scrollToTop();
                }}
                disabled={pageIndex >= totalPages}
                className='px-4 py-2 rounded border border-blue-800 disabled:opacity-50'
              >
                Sau
              </button>
            </div>
          )}
        </main>
      </div>
    </section>
  );
};

export default ExamList;
