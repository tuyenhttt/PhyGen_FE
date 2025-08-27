import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { getExamCategory } from '@/services/examService';
import { getAllMatrices } from '@/services/matrixService';
import Cookies from 'js-cookie';

const ManualExamForm = forwardRef(({}, ref) => {
  const [shuffleQuestions, setShuffleQuestions] = useState(null);
  const [examCategories, setExamCategories] = useState(null);
  const [selectedExamCategoriesId, setSelectedExamCategoriesId] = useState('');
  const [loadingExamCategories, setLoadingExamCategories] = useState(true);

  const [matrices, setMatrices] = useState(null);
  const [loadingMatrices, setLoadingMatrices] = useState(false);
  const [selectedMatrixId, setSelectedMatrixId] = useState('');
  const [selectedMatrix, setSelectedMatrix] = useState(null);

  const [selectedGrade, setSelectedGrade] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [year, setYear] = useState('');
  const [totalQuestions, setTotalQuestions] = useState('');
  const [numberOfExamPapers, setNumberOfExamPapers] = useState('');

  const userCookieId = Cookies.get('custom-user')
    ? JSON.parse(Cookies.get('custom-user')).id
    : '';

  // fetch exam categories
  useEffect(() => {
    (async () => {
      setLoadingExamCategories(true);
      try {
        const resp = await getExamCategory();
        if (resp) setExamCategories(resp.data);
      } catch {
        setExamCategories(null);
      } finally {
        setLoadingExamCategories(false);
      }
    })();
  }, []);

  // fetch matrices
  useEffect(() => {
    (async () => {
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
        } catch {
          setMatrices(null);
        } finally {
          setLoadingMatrices(false);
        }
      } else {
        setMatrices(null);
      }
    })();
  }, [selectedExamCategoriesId, selectedGrade, year]);

  // sync từ ma trận
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

  const handleMatrixChange = e => {
    const matrixId = e.target.value;
    setSelectedMatrixId(matrixId);
    if (matrixId) {
      const found = matrices?.data?.data?.find(m => m.id === matrixId);
      setSelectedMatrix(found || null);
    } else setSelectedMatrix(null);
  };

  const getMatricesData = () => matrices?.data?.data || [];
  const getExamCategoriesData = () => examCategories?.data || [];

  useImperativeHandle(ref, () => ({
    getFormData: () => ({
      examCategoryId: selectedExamCategoriesId,
      userId: userCookieId,
      title,
      description,
      grade: parseInt(selectedGrade) || 0,
      year: parseInt(year) || 0,
      totalQuestionCount: parseInt(totalQuestions) || 0,
      versionCount:
        shuffleQuestions === 'yes' ? parseInt(numberOfExamPapers) || 1 : 1,
      randomizeQuestions: shuffleQuestions === 'yes',
      imgUrl:
        'https://xdcs.cdnchinhphu.vn/446259493575335936/2023/12/30/3vatlipage-0001-17039312328961072714218.jpg',
    }),
    getSelectedMatrixId: () => ({ matrixId: selectedMatrixId }),
  }));

  const inputBase =
    'w-full px-3 py-2 rounded-md border border-gray-300 bg-gray-50 ' +
    'focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition';

  return (
    <form className='max-w-3xl mx-auto p-2'>
      <div className='text-sm text-gray-600 italic mb-5'>
        <span>
          Những trường có dấu {''}
          <span className='text-red-500 font-semibold '>*</span> bắt buộc phải
          điền
        </span>
      </div>

      {/* Tiêu đề + kỳ thi */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <label className='block text-sm font-medium mb-1'>
            Tiêu đề <span className='text-red-600'>*</span>
          </label>
          <input
            className={inputBase}
            placeholder='Ví dụ: Kiểm tra giữa kì Vật lí 12'
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
            onChange={e => setSelectedExamCategoriesId(e.target.value)}
          >
            {loadingExamCategories ? (
              <option>Đang tải...</option>
            ) : (
              <>
                <option value=''>Chọn kỳ thi </option>
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

      {/* Mô tả */}
      <div className='mt-6'>
        <label className='block text-sm font-medium mb-1'>Mô tả</label>
        <textarea
          rows={3}
          className={inputBase}
          placeholder='Mô tả tổng quan cấu trúc đề...'
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-3'>
        <div>
          <label className='block text-sm font-medium mb-1'>
            Khối <span className='text-red-600'>*</span>
          </label>
          <select
            className={inputBase}
            value={selectedGrade}
            onChange={e => setSelectedGrade(e.target.value)}
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
            onChange={e => setYear(e.target.value)}
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
        className={inputBase}
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

      {/* Xáo trộn */}
      {/* <label className='block text-sm font-medium mb-1 mt-5'>
        Xóa trộn đề <span className='text-red-600'>*</span>
      </label>
      <div className='flex flex-wrap items-center gap-6'>
        <label className='inline-flex items-center gap-2'>
          <input
            type='radio'
            name='shuffle'
            value='yes'
            checked={shuffleQuestions === 'yes'}
            onChange={e => setShuffleQuestions(e.target.value)}
          />
          <span>Có xáo trộn</span>
        </label>
        <label className='inline-flex items-center gap-2'>
          <input
            type='radio'
            name='shuffle'
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
      </div> */}
    </form>
  );
});

export default ManualExamForm;
