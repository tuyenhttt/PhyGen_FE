import { useState, useEffect, useCallback } from 'react';
import CommonButton from '@/components/ui/CommonButton';
import { toast } from 'react-toastify';
import { checkFile, extractFromFile } from '@/services/questionService';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import { FaEdit } from 'react-icons/fa';
import QuestionDetailModal from '@/components/ui/QuestionDetailModal';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { FaArrowRightLong, FaArrowLeftLong } from 'react-icons/fa6';

const AutoCreateQuestion = ({ setQuestionList }) => {
  const [grade, setGrade] = useState('');
  const [file, setFile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isPhysicsExam, setIsPhysicsExam] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [extractDisabled, setExtractDisabled] = useState(false);

  const handleEditQuestion = q => {
    setSelectedQuestion(q);
    setEditMode(true);
    setIsModalOpen(true);
  };

  const typeMap = {
    0: 'Nhiều đáp án',
    1: 'Đúng/Sai',
    2: 'Câu trả lời ngắn',
    3: 'Tự luận',
  };

  const levelMap = {
    0: 'Nhận biết',
    1: 'Thông hiểu',
    2: 'Vận dụng',
  };

  const handleFileChange = async e => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
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
      if (!resCheck.data?.isPhysicsExam) {
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

  const handleExtractQuestion = async (
    selectedFile = file,
    selectedGrade = grade
  ) => {
    if (!selectedFile || !selectedGrade) {
      toast.error('Thiếu file hoặc khối lớp!');
      return;
    }
    setLoading(true);
    try {
      toast.info('Đang trích xuất câu hỏi...');
      const resExtract = await extractFromFile(selectedFile, selectedGrade);
      const list = resExtract.data || [];
      setQuestions(list);
      setQuestionList(list);

      if (list.length === 0) {
        toast.warn('Không tìm thấy câu hỏi trong file!');
      }
      // Disable nút trích xuất sau khi thành công (dù có hoặc không có câu hỏi)
      setExtractDisabled(true);
    } catch (err) {
      toast.error('Lỗi khi trích xuất câu hỏi!');
    } finally {
      setLoading(false);
    }
  };

  const answerLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

  // Reset currentIndex khi danh sách câu hỏi thay đổi
  useEffect(() => {
    setCurrentIndex(0);
  }, [questions.length]);

  // Xử lý phím mũi tên trái/phải
  const handleKeyDown = useCallback(
    e => {
      if (questions.length === 0) return;
      if (e.key === 'ArrowRight') {
        setCurrentIndex(idx => Math.min(idx + 1, questions.length - 1));
      }
      if (e.key === 'ArrowLeft') {
        setCurrentIndex(idx => Math.max(idx - 1, 0));
      }
    },
    [questions.length]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className='w-full max-w-4xl mx-auto space-y-5 text-gray-700'>
      <div className='flex items-center text-sm text-gray-600 gap-1 italic'>
        <span>
          Những trường có dấu {''}
          <span className='text-red-500 font-semibold '>*</span> bắt buộc phải
          điền
        </span>
      </div>
      {/* Chọn lớp */}
      <div className='w-full sm:w-1/4'>
        <p className='block text-[16px] font-bold mb-1'>
          Khối lớp : <span className='text-red-600'>*</span>
        </p>
        <select
          value={grade}
          onChange={e => setGrade(e.target.value)}
          className='w-full border rounded p-2'
        >
          <option value=''>Chọn lớp</option>
          <option value='10'>Lớp 10</option>
          <option value='11'>Lớp 11</option>
          <option value='12'>Lớp 12</option>
        </select>
      </div>

      {/* Upload file Word */}
      <div>
        <p className='block text-[16px] font-bold mb-1'>
          Chọn file Word đề thi vật lý: <span className='text-red-600'>*</span>
        </p>
        <div className='flex flex-col sm:flex-row items-start gap-3'>
          <div className='flex items-center gap-2'>
            <input
              type='file'
              accept='.doc,.docx'
              onChange={handleFileChange}
              disabled={loading}
              className='block w-118 text-sm text-gray-700 border border-gray-300 rounded px-4 py-2 cursor-pointer file:mr-4 file:py-1 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
            />
            {isPhysicsExam === true && (
              <FaCheckCircle
                className='text-green-500 text-xl'
                title='File hợp lệ'
              />
            )}
            {isPhysicsExam === false && (
              <FaTimesCircle
                className='text-red-500 text-xl'
                title='File không hợp lệ'
              />
            )}
          </div>
          {isPhysicsExam === true && (
            <CommonButton
              onClick={() => handleExtractQuestion()}
              disabled={loading || extractDisabled}
              className='px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium'
            >
              {loading ? 'Đang xử lý...' : 'Trích xuất câu hỏi'}
            </CommonButton>
          )}
        </div>
      </div>

      {questions.length > 0 && (
        <div className='mt-6'>
          <h3 className='text-lg font-bold mb-3'>Danh sách câu hỏi:</h3>
          <MathJaxContext config={{ tex: { inlineMath: [['$', '$']] } }}>
            <div className='flex flex-col items-center'>
              <div className='flex items-center gap-4'>
                <button
                  type='button'
                  className='p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50'
                  onClick={() => setCurrentIndex(i => Math.max(i - 1, 0))}
                  disabled={currentIndex === 0}
                  aria-label='Câu trước'
                >
                  <FaArrowLeftLong />
                </button>
                <ul className='flex'>
                  <li className='min-w-[600px] max-w-[600px] bg-white shadow-lg rounded-2xl p-6 border border-gray-200 relative transition-transform duration-200'>
                    {/* Icon chỉnh sửa */}
                    <button
                      type='button'
                      onClick={() =>
                        handleEditQuestion(questions[currentIndex])
                      }
                      className='absolute top-3 right-3 text-blue-600 hover:text-blue-800'
                      title='Chỉnh sửa câu hỏi'
                    >
                      <FaEdit />
                    </button>
                    {/* Thông tin thêm */}
                    <div className='mb-2 text-xs text-gray-500'>
                      <span>
                        Bài: {questions[currentIndex].topicName || '—'}
                      </span>{' '}
                      |{' '}
                      <span>
                        Loại:{' '}
                        {typeMap[questions[currentIndex].type] ||
                          questions[currentIndex].type}
                      </span>{' '}
                      |{' '}
                      <span>
                        Mức độ:{' '}
                        {levelMap[questions[currentIndex].level] ||
                          questions[currentIndex].level}
                      </span>{' '}
                      | <span>Lớp: {questions[currentIndex].grade}</span>
                    </div>
                    <p className='font-semibold text-indigo-600 mb-2'>
                      Câu {currentIndex + 1} / {questions.length}:
                    </p>
                    <MathJax dynamic>
                      <div className='whitespace-pre-line mb-2'>
                        {questions[currentIndex].content}
                      </div>
                    </MathJax>
                    {/* Hiển thị tất cả hình ảnh từ mediaUrls nếu có */}
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
                    {Object.keys(questions[currentIndex]).filter(
                      k => k.startsWith('answer') && questions[currentIndex][k]
                    ).length > 0 && (
                      <div className='mt-3'>
                        <p className='font-medium text-gray-700 mb-1'>
                          Đáp án:
                        </p>
                        <ul className='space-y-1 text-sm'>
                          {Object.keys(questions[currentIndex])
                            .filter(
                              k =>
                                k.startsWith('answer') &&
                                questions[currentIndex][k]
                            )
                            .map((k, i) => (
                              <li key={i} className='flex items-start gap-2'>
                                <span className='font-bold'>
                                  {answerLabels[i]}.
                                </span>
                                <MathJax dynamic>
                                  {questions[currentIndex][k]}
                                </MathJax>
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                  </li>
                </ul>
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
              <div className='mt-2 text-sm text-gray-500 flex items-center gap-2 whitespace-nowrap'>
                <span>Dùng phím</span>
                <FaArrowLeftLong className='inline-block shrink-0' />
                <span>hoặc</span>
                <FaArrowRightLong className='inline-block shrink-0' />
                <span>để chuyển câu hỏi</span>
              </div>
            </div>
          </MathJaxContext>
        </div>
      )}

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
};

export default AutoCreateQuestion;
