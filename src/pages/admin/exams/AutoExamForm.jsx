import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { getExamCategory } from '@/services/examService';
import { getAllMatrices } from '@/services/matrixService';
import Cookies from 'js-cookie';

const AutoExamForm = forwardRef(({}, ref) => {
  const [examCategories, setExamCategories] = useState(null);
  const [selectedExamCategoriesId, setSelectedExamCategoriesId] = useState('');
  const [loadingExamCategories, setLoadingExamCategories] = useState(true);

  const [matrices, setMatrices] = useState(null);
  const [loadingMatrices, setLoadingMatrices] = useState(false);
  const [selectedMatrixId, setSelectedMatrixId] = useState('');
  const [selectedMatrix, setSelectedMatrix] = useState(null);

  const [selectedGrade, setSelectedGrade] = useState('');
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [totalQuestions, setTotalQuestions] = useState('');

  const [shuffleQuestions, setShuffleQuestions] = useState(null);
  const [numberOfExamPapers, setNumberOfExamPapers] = useState('');
  const userCookieId = Cookies.get('custom-user')
    ? JSON.parse(Cookies.get('custom-user')).id
    : '';

  // fetch exam categories
  useEffect(() => {
    const fetchExamCategories = async () => {
      setLoadingExamCategories(true);
      try {
        const resp = await getExamCategory();
        if (resp) setExamCategories(resp.data);
      } catch (err) {
        console.error('Lỗi tải kỳ thi:', err);
        setExamCategories(null);
      } finally {
        setLoadingExamCategories(false);
      }
    };
    fetchExamCategories();
  }, []);

  // fetch matrices on filters
  useEffect(() => {
    const fetchMatrices = async () => {
      if (selectedExamCategoriesId || selectedGrade || year) {
        setLoadingMatrices(true);
        try {
          const resp = await getAllMatrices({
            ExamCategoryId: selectedExamCategoriesId,
            Grade: selectedGrade,
            Year: year,
            Status: 2,
          });
          if (resp?.data) setMatrices(resp.data);
        } catch (err) {
          console.error('Lỗi tải ma trận:', err);
          setMatrices(null);
        } finally {
          setLoadingMatrices(false);
        }
      } else {
        setMatrices(null);
      }
    };
    fetchMatrices();
  }, [selectedExamCategoriesId, selectedGrade, year]);

  // sync from selected matrix
  useEffect(() => {
    if (selectedMatrix) {
      setSelectedExamCategoriesId(selectedMatrix.examCategoryId || '');
      setSelectedGrade(
        selectedMatrix.grade ? String(selectedMatrix.grade) : ''
      );
      setYear(selectedMatrix.year ? String(selectedMatrix.year) : '');
      setTotalQuestions(
        selectedMatrix.totalQuestionCount
          ? String(selectedMatrix.totalQuestionCount)
          : ''
      );
    } else {
      setSelectedExamCategoriesId('');
      setSelectedGrade('');
      setYear('');
      setTotalQuestions('');
    }
  }, [selectedMatrix]);

  const handleExamCategoriesChange = e => {
    setSelectedExamCategoriesId(e.target.value);
    setMatrices(null);
    setSelectedMatrixId('');
    setSelectedMatrix(null);
  };

  const handleGradeChange = e => {
    setSelectedGrade(e.target.value);
    setMatrices(null);
    setSelectedMatrixId('');
    setSelectedMatrix(null);
  };

  const handleYearChange = e => {
    setYear(e.target.value);
    setMatrices(null);
    setSelectedMatrixId('');
    setSelectedMatrix(null);
  };

  const handleMatrixChange = e => {
    const matrixId = e.target.value;
    setSelectedMatrixId(matrixId);
    if (matrixId) {
      const found = matrices?.data?.data?.find(m => m.id === matrixId);
      setSelectedMatrix(found || null);
    } else {
      setSelectedMatrix(null);
    }
  };

  const getMatricesData = () => matrices?.data?.data || [];
  const getExamCategoriesData = () => examCategories?.data || [];

  useImperativeHandle(ref, () => ({
    getExamData: () => ({
      examCategoryId: selectedExamCategoriesId,
      userId: userCookieId,
      title: title,
      year: parseInt(year) || null,
      grade: parseInt(selectedGrade) || null,
      totalQuestionCount: parseInt(totalQuestions) || null,
      imgUrl:
        'https://xdcs.cdnchinhphu.vn/446259493575335936/2023/12/30/3vatlipage-0001-17039312328961072714218.jpg',
      status: 1,
    }),
    getNumberofExamPaper: () => ({
      versionCount:
        shuffleQuestions === 'yes' ? parseInt(numberOfExamPapers) || 1 : 1,
      randomizeQuestions: shuffleQuestions === 'yes',
    }),
    getSelectedMatrixId: () => ({ matrixId: selectedMatrixId }),
    resetData: () => {
      setSelectedExamCategoriesId('');
      setMatrices(null);
      setSelectedMatrixId('');
      setSelectedMatrix(null);
      setSelectedGrade('');
      setTitle('');
      setYear('');
      setTotalQuestions('');
      setShuffleQuestions(null);
      setNumberOfExamPapers('');
    },
  }));

  const inputBase =
    'w-full px-3 py-2 rounded-md border border-gray-300 bg-gray-50 ' +
    'focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition';

  return (
    <div className='max-w-3xl mx-auto'>
      <div className='text-sm text-gray-600 italic mb-5'>
        <span>
          Những trường có dấu {''}
          <span className='text-red-500 font-semibold '>*</span> bắt buộc phải
          điền
        </span>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>
        <div>
          <label className='block text-sm font-medium mb-1'>
            Tiêu đề <span className='text-red-600'>*</span>
          </label>
          <input
            className={inputBase}
            placeholder='Ví dụ: Kiểm tra cuối kì Vật lí 12'
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className='block text-sm font-medium mb-1'>
            Kỳ thi <span className='text-red-600'>*</span>
          </label>
          <select
            className={inputBase}
            value={selectedExamCategoriesId}
            onChange={handleExamCategoriesChange}
          >
            {loadingExamCategories ? (
              <option>Đang tải...</option>
            ) : (
              <>
                <option value=''> Chọn kỳ thi </option>
                {getExamCategoriesData().map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>
      </div>

      {/* Bộ lọc ma trận */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-5 mt-3'>
        <div>
          <label className='block text-sm font-medium mb-1'>
            Khối <span className='text-red-600'>*</span>
          </label>
          <select
            className={inputBase}
            value={selectedGrade}
            onChange={handleGradeChange}
          >
            <option value=''>Chọn khối </option>
            <option value={10}>Khối 10</option>
            <option value={11}>Khối 11</option>
            <option value={12}>Khối 12</option>
          </select>
        </div>
        <div>
          <label className='block text-sm font-medium mb-1'>
            Năm <span className='text-red-600'>*</span>
          </label>
          <input
            type='number'
            min='1900'
            max='2100'
            className={inputBase}
            placeholder='VD: 2025'
            value={year}
            onChange={handleYearChange}
          />
        </div>
        <div>
          <label className='block text-sm font-medium mb-1'>Tổng số câu</label>
          <input
            type='number'
            disabled
            className={`${inputBase} text-gray-600 bg-gray-100`}
            value={totalQuestions}
            onChange={e => setTotalQuestions(e.target.value)}
          />
        </div>
      </div>

      {/* Ma trận */}
      <label className='block text-sm font-medium mb-1 mt-5'>
        Ma trận <span className='text-red-600'>*</span>
      </label>
      <select
        className={`${inputBase} ${
          loadingMatrices || getMatricesData().length === 0
            ? 'opacity-60 cursor-not-allowed'
            : ''
        }`}
        value={selectedMatrixId}
        onChange={handleMatrixChange}
        disabled={loadingMatrices || getMatricesData().length === 0}
      >
        {loadingMatrices ? (
          <option>Đang tải ma trận...</option>
        ) : getMatricesData().length > 0 ? (
          <>
            <option value=''>Chọn ma trận</option>
            {getMatricesData().map(m => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </>
        ) : (
          <option>Không có ma trận khả dụng</option>
        )}
      </select>

      {/* Xáo trộn & số đề */}
      {/* <label className='block text-sm font-medium mt-5'>
        Xáo trộn & số đề <span className='text-red-600'>*</span>
      </label>
      <div className='rounded-xl bg-gray-50 p-4'>
        <div className='flex flex-wrap items-center gap-6'>
          <label className='inline-flex items-center gap-2'>
            <input
              type='radio'
              name='shuffleAuto'
              value='yes'
              checked={shuffleQuestions === 'yes'}
              onChange={e => setShuffleQuestions(e.target.value)}
            />
            <span>Có xáo trộn</span>
          </label>
          <label className='inline-flex items-center gap-2'>
            <input
              type='radio'
              name='shuffleAuto'
              value='no'
              checked={shuffleQuestions === 'no'}
              onChange={e => setShuffleQuestions(e.target.value)}
            />
            <span>Không xáo trộn</span>
          </label>

          {shuffleQuestions === 'yes' && (
            <div className='ml-auto w-44'>
              <label className='block text-sm font-medium mb-1'>
                Số phiên bản
              </label>
              <input
                type='number'
                min='1'
                className={inputBase}
                placeholder='VD: 3'
                value={numberOfExamPapers}
                onChange={e => setNumberOfExamPapers(e.target.value)}
              />
            </div>
          )}
        </div>
      </div> */}
    </div>
  );
});

export default AutoExamForm;
