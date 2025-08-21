import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import { FaEdit, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import QuestionDetailModal from '@/components/ui/QuestionDetailModal';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { checkFile, extractFromFile } from '@/services/questionService';
import { FaArrowRightLong, FaArrowLeftLong } from 'react-icons/fa6';

const answerLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

const TYPE_MAP_NUM_TO_NAME = {
  0: 'Nhiều đáp án',
  1: 'Đúng/Sai',
  2: 'Câu trả lời ngắn',
  3: 'Tự luận',
};
const LEVEL_MAP_NUM_TO_NAME = {
  0: 'Nhận biết',
  1: 'Thông hiểu',
  2: 'Vận dụng',
};

export default function AutoCreateQuestion({ setQuestionList }) {
  const [grade, setGrade] = useState('');
  const [file, setFile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPhysicsExam, setIsPhysicsExam] = useState(null);
  const [extractDisabled, setExtractDisabled] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  // === Handlers ===
  const handleEditQuestion = q => {
    setSelectedQuestion(q);
    setEditMode(true);
    setIsModalOpen(true);
  };

  // 1) Chọn file & check file (giống User)
  const handleFileChange = async e => {
    const selectedFile = e.target.files?.[0];
    setFile(selectedFile || null);
    setQuestions([]);
    setIsPhysicsExam(null);
    setExtractDisabled(false);

    if (!grade) {
      toast.error('Vui lòng chọn khối lớp trước khi chọn file!');
      return;
    }
    if (!selectedFile) return;

    setLoading(true);
    try {
      toast.info('Đang kiểm tra file...');
      const resCheck = await checkFile(selectedFile, grade);
      if (!resCheck?.data?.isPhysicsExam) {
        setIsPhysicsExam(false);
        toast.error('File không phải đề kiểm tra vật lý!');
        return;
      }
      setIsPhysicsExam(true);
      toast.success('File hợp lệ! Bạn có thể trích xuất câu hỏi.');
    } catch (err) {
      setIsPhysicsExam(false);
      toast.error('File không hợp lệ hoặc không phải đề kiểm tra vật lý!');
    } finally {
      setLoading(false);
    }
  };

  // 2) Trích xuất câu hỏi từ file
  const handleExtractQuestion = useCallback(
    async (selectedFile = file, selectedGrade = grade) => {
      if (!selectedFile || !selectedGrade) {
        toast.error('Thiếu file hoặc khối lớp!');
        return;
      }
      setLoading(true);
      try {
        toast.info('Đang trích xuất câu hỏi...');
        const res = await extractFromFile(selectedFile, selectedGrade);
        const list = Array.isArray(res?.data) ? res.data : [];

        setQuestions(list);
        setQuestionList?.(list);
        setCurrentIndex(0);
        setExtractDisabled(true);
        toast.success(`Trích xuất thành công ${list.length} câu hỏi!`);
      } catch (err) {
        console.error('extractFromFile error:', err);
        toast.error('Không thể trích xuất câu hỏi từ file!');
      } finally {
        setLoading(false);
      }
    },
    [file, grade, setQuestionList]
  );

  // Điều hướng bằng bàn phím ← →
  useEffect(() => {
    const onKey = e => {
      if (!questions.length) return;
      if (e.key === 'ArrowLeft') {
        setCurrentIndex(i => Math.max(0, i - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex(i => Math.min(questions.length - 1, i + 1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [questions.length]);

  // Render thông tin trạng thái check file
  const CheckBadge = () => {
    if (isPhysicsExam === true)
      return (
        <span className='inline-flex items-center gap-1 text-green-600'>
          <FaCheckCircle /> Hợp lệ
        </span>
      );
    if (isPhysicsExam === false)
      return (
        <span className='inline-flex items-center gap-1 text-red-600'>
          <FaTimesCircle /> Không hợp lệ
        </span>
      );
    return null;
  };

  const q = questions[currentIndex];

  return (
    <div className='rounded-xl border bg-white p-4 md:p-6 space-y-4'>
      <div className='grid grid-cols-1 md:grid-cols-4 gap-3'>
        <div className='md:col-span-1'>
          <label className='block text-sm font-medium mb-1'>Khối</label>
          <select
            className='w-full rounded-lg border px-3 py-2 bg-white'
            value={grade}
            onChange={e => setGrade(e.target.value)}
          >
            <option value=''>Chọn khối</option>
            <option value='10'>Khối 10</option>
            <option value='11'>Khối 11</option>
            <option value='12'>Khối 12</option>
          </select>
        </div>

        <div className='md:col-span-2'>
          <label className='block text-sm font-medium mb-1'>
            File đề (.docx, .doc)
          </label>
          <input
            type='file'
            accept='.doc,.docx'
            className='w-full rounded-lg border px-3 py-2 bg-white'
            onChange={handleFileChange}
          />
        </div>

        <div className='md:col-span-1 flex items-end gap-2'>
          <PrimaryButton
            type='button'
            className='w-full bg-indigo-600 hover:bg-indigo-700'
            disabled={!file || loading}
            onClick={() => handleExtractQuestion()}
          >
            Trích xuất
          </PrimaryButton>
          <div className='whitespace-nowrap text-sm'>
            <CheckBadge />
          </div>
        </div>
      </div>

      {/* Preview */}
      {!!questions.length && (
        <div className='rounded-lg border p-4'>
          <div className='flex items-center justify-between gap-2'>
            <div className='text-sm text-gray-600'>
              Câu <b>{currentIndex + 1}</b> / {questions.length}{' '}
              <span className='ml-2'>
                ({TYPE_MAP_NUM_TO_NAME[q?.type]},{' '}
                {LEVEL_MAP_NUM_TO_NAME[q?.level]})
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <button
                type='button'
                className='p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50'
                onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
                disabled={currentIndex === 0}
                aria-label='Câu trước'
              >
                <FaArrowLeftLong />
              </button>
              <button
                type='button'
                className='p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50'
                onClick={() =>
                  setCurrentIndex(i => Math.min(i + 1, questions.length - 1))
                }
                disabled={currentIndex === questions.length - 1}
                aria-label='Câu tiếp'
              >
                <FaArrowRightLong />
              </button>
            </div>
          </div>

          <MathJaxContext config={{ tex: { inlineMath: [['$', '$']] } }}>
            <div className='mt-3 space-y-3'>
              <div className='flex items-start gap-2'>
                <span className='font-bold mt-0.5'>Nội dung:</span>
                <div className='prose prose-sm max-w-none'>
                  <MathJax dynamic>{q?.content || ''}</MathJax>
                </div>
              </div>
              {Array.isArray(questions[currentIndex].mediaUrls) &&
                questions[currentIndex].mediaUrls.length > 0 && (
                  <div className='mt-2 flex flex-wrap gap-2 justify-center'>
                    {questions[currentIndex].mediaUrls.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`Ảnh câu ${currentIndex + 1} - ${idx + 1}`}
                        className='max-h-40 rounded border'
                      />
                    ))}
                  </div>
                )}
              {/* Nếu không có mediaUrls, fallback về mediaBase64 (nếu có) */}
              {!(
                Array.isArray(questions[currentIndex].mediaUrls) &&
                questions[currentIndex].mediaUrls.length > 0
              ) &&
                questions[currentIndex].mediaBase64 && (
                  <img
                    src={`data:image/png;base64,${questions[currentIndex].mediaBase64}`}
                    alt={`Ảnh câu ${currentIndex + 1}`}
                    className='mt-2 max-h-40 rounded border mx-auto'
                  />
                )}

              {/* Danh sách đáp án nếu có */}
              {!!Object.keys(q || {}).filter(
                k => k.startsWith('answer') && q[k]
              ).length && (
                <div>
                  <div className='font-semibold mb-1'>Đáp án:</div>
                  <ul className='list-none space-y-1'>
                    {Object.keys(q || {})
                      .filter(k => k.startsWith('answer') && q[k])
                      .map((k, i) => (
                        <li key={i} className='flex items-start gap-2'>
                          <span className='font-bold'>{answerLabels[i]}.</span>
                          <div className='prose prose-sm max-w-none'>
                            <MathJax dynamic>{q[k]}</MathJax>
                          </div>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          </MathJaxContext>

          <div className='mt-3 flex justify-end'>
            <PrimaryButton onClick={() => handleEditQuestion(q)}>
              <FaEdit className='mr-2 bg-indigo-600 hover:bg-indigo-700' /> Sửa
            </PrimaryButton>
          </div>

          <div className='mt-2 text-sm text-gray-500 flex items-center gap-2 whitespace-nowrap'>
            <span>Dùng phím</span>
            <FaArrowLeftLong className='inline-block shrink-0' />
            <span>hoặc</span>
            <FaArrowRightLong className='inline-block shrink-0' />
            <span>để chuyển câu hỏi</span>
          </div>
        </div>
      )}

      {/* Modal chỉnh sửa chi tiết (giống User) */}
      {isModalOpen && selectedQuestion && (
        <QuestionDetailModal
          question={selectedQuestion}
          setQuesion={setSelectedQuestion}
          editMode={editMode}
          onClose={() => {
            setIsModalOpen(false);
            setEditMode(false);
          }}
          onSaveLocal={updatedQ => {
            setQuestions(prev =>
              prev.map(q => (q === selectedQuestion ? updatedQ : q))
            );
            setQuestionList(prev =>
              prev.map(q => (q === selectedQuestion ? updatedQ : q))
            );
          }}
          onSaveSuccess={updatedQ => {
            setQuestions(prev =>
              prev.map(q => (q.id === updatedQ.id ? updatedQ : q))
            );
            setQuestionList(prev =>
              prev.map(q => (q.id === updatedQ.id ? updatedQ : q))
            );
          }}
        />
      )}
    </div>
  );
}
