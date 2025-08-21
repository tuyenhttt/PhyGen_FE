import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { getExamCategory } from '@/services/examService';
import { getAllMatrices } from '@/services/matrixService';

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

  useEffect(() => {
    const fetchMatrices = async () => {
      if (selectedExamCategoriesId || selectedGrade || year) {
        setLoadingMatrices(true);
        try {
          const resp = await getAllMatrices({
            ExamCategoryId: selectedExamCategoriesId,
            Grade: selectedGrade,
            Year: year,
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

  useEffect(() => {
    if (selectedMatrix) {
      setSelectedExamCategoriesId(selectedMatrix.examCategoryId || '');
      setSelectedGrade(selectedMatrix.grade ? String(selectedMatrix.grade) : '');
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

  const handleExamCategoriesChange = (e) => {
    setSelectedExamCategoriesId(e.target.value);
    setMatrices(null);
    setSelectedMatrixId('');
    setSelectedMatrix(null);
  };
  const handleGradeChange = (e) => {
    setSelectedGrade(e.target.value);
    setMatrices(null);
    setSelectedMatrixId('');
    setSelectedMatrix(null);
  };
  const handleYearChange = (e) => {
    setYear(e.target.value);
    setMatrices(null);
    setSelectedMatrixId('');
    setSelectedMatrix(null);
  };
  const handleMatrixChange = (e) => {
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
    getExamTitle: () => ({ title }),
    getNumberofExamPaper: () => ({
      versionCount: shuffleQuestions === 'yes' ? parseInt(numberOfExamPapers) || 1 : 1,
      randomizeQuestions: shuffleQuestions === 'yes',
    }),
    getSelectedMatrixId: () => ({ matrixId: selectedMatrixId }),
  }));

  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <div className="px-5 py-4 border-b flex items-center justify-between">
        <h3 className="font-semibold text-lg">Sinh đề tự động (Admin)</h3>
        <span className="text-xs text-gray-500 italic">
          * Chọn ma trận, hệ thống sẽ sinh đề theo AI
        </span>
      </div>

      <div className="p-5 grid grid-cols-1 gap-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tiêu đề</label>
            <input
              className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              placeholder="Ví dụ: Kiểm tra cuối kì Vật lí 12"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Kỳ thi</label>
            <select
              className="w-full rounded-lg border px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500"
              value={selectedExamCategoriesId}
              onChange={handleExamCategoriesChange}
            >
              {loadingExamCategories ? (
                <option>Đang tải...</option>
              ) : (
                <>
                  <option value="">— Chọn kỳ thi —</option>
                  {getExamCategoriesData().map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </>
              )}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Khối</label>
            <select
              className="w-full rounded-lg border px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500"
              value={selectedGrade}
              onChange={handleGradeChange}
            >
              <option value="">— Chọn khối —</option>
              <option value={10}>Khối 10</option>
              <option value={11}>Khối 11</option>
              <option value={12}>Khối 12</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Năm</label>
            <input
              type="number"
              min="1900"
              max="2100"
              className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              placeholder="VD: 2025"
              value={year}
              onChange={handleYearChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tổng số câu</label>
            <input
              type="number"
              disabled
              className="w-full rounded-lg border px-3 py-2 bg-gray-50 text-gray-600"
              value={totalQuestions}
              onChange={e => setTotalQuestions(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Ma trận</label>
          <select
            className="w-full rounded-lg border px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500"
            value={selectedMatrixId}
            onChange={handleMatrixChange}
            disabled={loadingMatrices || getMatricesData().length === 0}
          >
            {loadingMatrices ? (
              <option>Đang tải ma trận...</option>
            ) : getMatricesData().length > 0 ? (
              <>
                <option value="">— Chọn ma trận —</option>
                {getMatricesData().map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </>
            ) : (
              <option>Không có ma trận khả dụng</option>
            )}
          </select>
        </div>

        <div className="rounded-lg border p-4 bg-gray-50">
          <div className="font-medium mb-2">Xáo trộn & số đề</div>
          <div className="flex items-center gap-6">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="shuffleAuto"
                value="yes"
                checked={shuffleQuestions === 'yes'}
                onChange={e => setShuffleQuestions(e.target.value)}
              />
              <span>Có xáo trộn</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="shuffleAuto"
                value="no"
                checked={shuffleQuestions === 'no'}
                onChange={e => setShuffleQuestions(e.target.value)}
              />
              <span>Không xáo trộn</span>
            </label>
            {shuffleQuestions === 'yes' && (
              <div className="ml-auto w-48">
                <input
                  type="number"
                  min="1"
                  className="w-full rounded-lg border px-3 py-2"
                  placeholder="Số version"
                  value={numberOfExamPapers}
                  onChange={e => setNumberOfExamPapers(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default AutoExamForm;
